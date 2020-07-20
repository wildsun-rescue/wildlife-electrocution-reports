const Promise = require('bluebird')
const serverless = require('serverless-http')
const express = require('express')
const cors = require('cors')
const multer = require('multer')

const deline = require('deline')
const Twilio = require('twilio')
const isgd = require('isgd')
const GoogleSpreadsheet = require('google-spreadsheet')
const AWS = require('aws-sdk')
const uuid = require('uuid')
require('isomorphic-fetch')

const WildlifeReportSchema = require('../common/WildlifeReportSchema')

const {
  TWILLIO_SID,
  TWILLIO_AUTH_TOKEN,
  TWILLIO_PHONE_NUMBER,
  TWILLIO_WHATSAPP_NUMBER,
  GOOGLE_CREDENTIALS,
  GOOGLE_SPREADSHEET_ID,
  PUSHBULLET_ACCESS_TOKEN,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_REGION,
  STATIC_SECRET_KEY,
} = process.env

const pages = {
  instructions: 1,
  formSubmissions: 2,
  managers: 3,
}

const app = express()
app.use(cors())

const upload = multer().none()


// Google Sheets

const getSheet = async () => {
  // spreadsheet key is the long id in the sheets URL
  const sheet = new GoogleSpreadsheet(GOOGLE_SPREADSHEET_ID)

  // see notes below for authentication instructions!
  const creds = JSON.parse(GOOGLE_CREDENTIALS)

  await Promise.promisify(sheet.useServiceAccountAuth)(creds)

  return sheet
}

const getManagers = async ({ sheet }) => {
  const managerRows = await Promise.promisify(sheet.getRows)(pages.managers)

  const bool = field => field.trim().toUpperCase() === 'Y'

  return managerRows
    .filter(row => bool(row.active))
    .map((row) => {
      const email = row.pushbulletemail || ''
      console.log(row, email)
      return {
        name: row.manager,
        phoneNumber: row.cellphone.replace(/[- ]/g, '').trim(),
        sms: bool(row.textmessage),
        pushbullet: bool(row.pushbullet),
        // whatsApp: row.whatsapp.trim().toUpperCase() === 'Y',
        whatsApp: false,
        email: email.length > 0 ? email.trim() : false,
      }
    })
}

const updateSpreadsheet = async ({ row, sheet }) => {
  // console.log('APPENDING ROW', row)
  await Promise.promisify(sheet.addRow)(pages.formSubmissions, row)
}


// URL Shortening

const shorten = url => new Promise((resolve) => {
  isgd.shorten(url, resolve)
})


// AWS and S3

const s3Bucket = new AWS.S3({
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  region: S3_REGION,
  signatureVersion: 'v4',
  params: {
    Bucket: S3_BUCKET,
  },
})

const imageFileExts = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/tiff': '.tiff',
}

const createPhoto = async (contentType) => {
  const id = uuid.v4()
  const fileExt = imageFileExts[contentType]

  if (fileExt == null) {
    throw new Error(`Invalid photo content type: ${contentType}`)
  }

  const key = `wildlife-report-image-${id}${fileExt}`

  const presignedPostPayload = await Promise.promisify(
    (params, cb) => s3Bucket.createPresignedPost(params, cb),
  )({
    Fields: {
      key,
      'Content-Type': contentType,
    },
    Conditions: [
      { 'Content-Type': contentType },
      ['content-length-range', 0, 30000000], // 30 Mb
    ],
  })

  return {
    readURL: `https://wildsun.netlify.com/.netlify/functions/photo?key=${key}&secret=${STATIC_SECRET_KEY}`,
    presignedPostPayload,
  }
}


// Lambda Function

app.post('*', async (req, res) => {
  const json = JSON.parse(req.body.toString('utf8'))

  /* eslint-disable no-console */
  console.log('\nForm Submission')
  console.log('----------------------------------------------')
  console.log(JSON.stringify(json, null, 2))
  /* eslint-enable no-console */

  const valid = await WildlifeReportSchema.isValid(json)

  if (!valid) {
    /* eslint-disable-next-line no-console */
    console.log('Invalid Form Submission')
    res.status(500)
    res.send('')
    return
  }


  if (process.env.NODE_ENV === 'development') {
    return
  }

  await Promise.promisify(upload)(req, res)

  const {
    coords,
    electricalPostNumber,
    nearestLandmark,
    species,
    description,
    phoneNumber,
    fullName,
    email,
    photoContentTypes,
  } = json

  const submissionDate = new Date().toISOString()

  /* eslint-disable-next-line no-console */
  console.log('Shortening URL')
  const map = await shorten(
    `https://maps.google.com/maps?q=${coords[0]},${coords[1]}`,
  )

  /* eslint-disable-next-line no-console */
  console.log('Creating Photo Upload URLs')
  const s3PhotoData = await Promise.all(
    photoContentTypes.map(createPhoto),
  )

  /* eslint-disable-next-line no-console */
  console.log('Connecting to Google Sheets')
  const sheet = await getSheet()

  const row = {
    confirmed: 'N',
    submissiondate: submissionDate,
    gpscoordinates: coords.join(', '),
    map,
    animalphoto: s3PhotoData[0] && s3PhotoData[0].readURL,
    locationphoto: s3PhotoData[1] && s3PhotoData[1].readURL,
    email,
    fullname: fullName,
    electricalpostnumber: electricalPostNumber,
    nearestbusinessorlandmark: nearestLandmark,
    descriptionoftheanimalinneed: description,
    animalspecies: species,
    phonenumber: phoneNumber,
  }

  /* eslint-disable-next-line no-console */
  console.log('Adding Form Data')
  await updateSpreadsheet({ row, sheet })

  /* eslint-disable-next-line no-console */
  console.log('Getting Managers')
  const managers = await getManagers({ row, sheet })

  const smsTitle = 'Wildlife Electrocution Alert!'

  const smsBody = deline`
    A ${species} has been reported by ${fullName}
    📞 ${phoneNumber}\n

    Description: ${description}\n

    Map: ${map}

    Sheet: https://docs.google.com/spreadsheets/d/1CT9bNkZvscQnYVaKHtEP2aZm6mDD_NNQy7EGV3OmSEg/edit?usp=sharing
  `

  const smsMessage = `${smsTitle}\n\n${smsBody}`

  /* eslint-disable no-console */
  console.log(`\nSMS (${smsMessage.length} Bytes)`)
  console.log('----------------------------------------------')
  console.log(`${smsMessage}\n`)
  /* eslint-enable no-console */

  const twilio = Twilio(TWILLIO_SID, TWILLIO_AUTH_TOKEN)

  /* eslint-disable-next-line no-console */
  console.log('Sending Texts')
  await Promise.all(
    managers.map((manager) => {
      const to = (manager.whatsApp ? 'whatsapp:' : '') + manager.phoneNumber
      /* eslint-disable-next-line no-console */
      console.log(
        manager.name,
        'twillio:',
        manager.sms && to,
        'pushbullet:',
        manager.pushbullet && manager.email,
      )

      const promises = []

      if (manager.phoneNumber != null && manager.sms) {
        promises.push(twilio.messages.create({
          body: smsMessage,
          from: manager.whatsApp ? TWILLIO_WHATSAPP_NUMBER : TWILLIO_PHONE_NUMBER,
          to,
        }))
      }

      if (manager.email && manager.pushbullet) {
        promises.push(
          fetch('https://api.pushbullet.com/v2/pushes', {
            method: 'POST',
            headers: {
              'Access-Token': PUSHBULLET_ACCESS_TOKEN,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: manager.email,
              type: 'note',
              title: smsTitle,
              body: smsBody,
            }),
          }).then((pushbulletResponse) => {
            if (!pushbulletResponse.ok) {
              console.error("Warning: Pushbullet failed to send for " + manager.email)
              console.error(JSON.stringify(pushbulletResponse))
            }
          }),
        )
      }

      return Promise.all(promises)
    }),
  )

  /* eslint-disable-next-line no-console */
  console.log('Done')
  res.json({
    presignedPostPayloads: s3PhotoData.map(p => p.presignedPostPayload),
  })
})

module.exports.handler = serverless(app)
