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

const WildlifeReportSchema = require('../common/WildlifeReportSchema')

const {
  TWILLIO_SID,
  TWILLIO_AUTH_TOKEN,
  TWILLIO_PHONE_NUMBER,
  TWILLIO_WHATSAPP_NUMBER,
  GOOGLE_CREDENTIALS,
  GOOGLE_SPREADSHEET_ID,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} = process.env

// In addition aws-sdk uses these environment variables internally as well:
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY

// PROBABLY UNUSED:
// AWS_SESSION_TOKEN

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

  return managerRows
    .filter(row => row.active.trim().toUpperCase() === 'Y')
    .map(row => ({
      phoneNumber: row.cellphone.replace(/[- ]/g, '').trim(),
      whatsApp: row.whatsapp.trim().toUpperCase() === 'Y',
    }))
    .filter(({ phoneNumber }) => phoneNumber.length > 0)
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

AWS.config.credentials = new AWS.Credentials(
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
)

const s3Bucket = new AWS.S3({
  params: {
    Bucket: S3_BUCKET,
  },
})

const uploadPhoto = async (fileURI, submissionDate) => {
  // const ContentType = fileURI.match(/^data:(image\/\w+);/)[1]
  //
  // const buf = Buffer.from(
  //   fileURI.replace(/^data:image\/\w+;base64,/, ''),
  //   'base64',
  // )
  //

  // await Promise.promisify(s3Bucket.putObject)(data)

  const key = `wildlife-report-image-${submissionDate}-${uuid.v4()}`

  const presignedPostPayload = await Promise.promisify(s3Bucket.createPresignedPost)({
    Fields: {
      key,
    },
    Conditions: [
      ['content-length-range', 0, 30000000], // 30 Mb
    ],
  })

  const YEARS = 60 * 60 * 24 * 365

  const readURL = s3Bucket.getSignedUrl('getObject', {
    Key: key,
    Expires: 1000 * YEARS,
  })

  return {
    presignedPostPayload,
    readURL,
  }
}


// Lambda Function

app.post('*', async (req, res) => {
  const json = JSON.parse(req.body.toString('utf8'))

  const { photos } = json
  delete json.photos

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
    return null
  }

  if (typeof photos !== 'object') {
    throw new Error('Photos must be an array')
  }

  if (photos.length > 2) {
    throw new Error('Cannot upload more then 2 photos')
  }

  /* eslint-disable-next-line no-console */
  console.log(`${photos.length} photos`)


  if (process.env.NODE_ENV === 'development') {
    return { statusCode: 200, body: '' }
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
  } = json

  const submissionDate = new Date().toISOString()

  /* eslint-disable-next-line no-console */
  console.log('Shortening URL')
  const map = await shorten(
    `https://maps.google.com/maps?q=${coords[0]},${coords[1]}`,
  )

  /* eslint-disable-next-line no-console */
  // console.log('Uploading Photos')
  // const s3PhotoData = await Promise.all(
  //   photos.map(photo => uploadPhoto(photo, submissionDate)),
  // )

  /* eslint-disable-next-line no-console */
  console.log('Connecting to Google Sheets')
  const sheet = await getSheet()

  const row = {
    confirmed: 'N',
    submissiondate: submissionDate,
    gpscoordinates: coords.join(', '),
    map,
    // animalphoto: s3PhotoData[0].readURL,
    // locationphoto: s3PhotoData[1].readURL,
    animalphoto: 'https://i.pinimg.com/originals/01/c2/9c/01c29c6d963bc2c93893622bc0fd2cc4.jpg',
    locationphoto: 'https://data.junkee.com/wp-content/uploads/2017/04/Fyre-Festival.jpg',
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

  const smsMessage = deline`
    Wildlife Electrocution Alert!\n

    A ${species} has been reported by ${fullName}
    📞 ${phoneNumber}\n

    Description: ${description}\n

    Map: ${map}

    Sheet: https://docs.google.com/spreadsheets/d/1CT9bNkZvscQnYVaKHtEP2aZm6mDD_NNQy7EGV3OmSEg/edit?usp=sharing
  `

  /* eslint-disable no-console */
  console.log(`\nSMS (${smsMessage.length} Bytes)`)
  console.log('----------------------------------------------')
  console.log(`${smsMessage}\n`)
  /* eslint-enable no-console */

  const twilio = Twilio(TWILLIO_SID, TWILLIO_AUTH_TOKEN)

  /* eslint-disable-next-line no-console */
  console.log('Sending Texts')
  await Promise.all(
    managers.map(({ phoneNumber: managerPhoneNumber, whatsApp }) => {
      const to = (whatsApp ? 'whatsapp:' : '') + managerPhoneNumber
      /* eslint-disable-next-line no-console */
      console.log(to)

      return twilio.messages.create({
        body: smsMessage,
        from: whatsApp ? TWILLIO_WHATSAPP_NUMBER : TWILLIO_PHONE_NUMBER,
        to,
      })
    }),
  )

  /* eslint-disable-next-line no-console */
  console.log('Done')
  return {
    statusCode: 200,
    body: JSON.stringify({
      presignedPostPayloads: s3PhotoData.map(d => d.presignedPostPayload),
    }),
  }
})

module.exports.handler = serverless(app)
