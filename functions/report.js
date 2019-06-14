const Promise = require('bluebird')
const serverless = require('serverless-http')
const express = require('express')
const cors = require('cors')
const multer = require('multer')

const deline = require('deline')
const Twilio = require('twilio')
const isgd = require('isgd')
const GoogleSpreadsheet = require('google-spreadsheet')

const WildlifeReportSchema = require('../lib/WildlifeReportSchema')

const {
  TWILLIO_SID,
  TWILLIO_AUTH_TOKEN,
  TWILLIO_PHONE_NUMBER,
  TWILLIO_WHATSAPP_NUMBER,
  GOOGLE_CREDENTIALS,
  GOOGLE_SPREADSHEET_ID,
} = process.env

const pages = {
  instructions: 1,
  formSubmissions: 2,
  managers: 3,
}

const app = express()
app.use(cors())

const upload = multer().none()

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
      phoneNumber: row.cellphone.trim(),
      whatsApp: row.whatsApp.trim().toUpperCase() === 'Y',
    }))
    .filter(cellphone => cellphone.length > 0)
}

const updateSpreadsheet = async ({ row, sheet }) => {
  // console.log('APPENDING ROW', row)
  await Promise.promisify(sheet.addRow)(pages.formSubmissions, row)
}

const shorten = url => new Promise((resolve) => {
  isgd.shorten(url, resolve)
})

app.post('*', async (req, res) => {
  const json = JSON.parse(req.body.toString('utf8'))

  /* eslint-disable no-console */
  console.log('\nForm Submission')
  console.log('----------------------------------------------')
  console.log(JSON.stringify(json, null, 2))
  /* eslint-enable no-console */

  const valid = await WildlifeReportSchema.isValid(json)

  if (!valid) {
    console.log('Invalid Form Submission')
    res.status(500)
    return null
  }

  if (process.env.NODE_ENV === 'development') {
    return { statusCode: 200, body: '' }
  }

  await Promise.promisify(upload)(req, res)

  const {
    coords,
    // TODO: photos
    // animalPhoto,
    // locationPhoto,
    electricalPostNumber,
    nearestLandmark,
    species,
    description,
    phoneNumber,
    fullName,
    email,
  } = json

  const map = await shorten(
    `https://maps.google.com/maps?q=${coords[0]},${coords[1]}`,
  )

  /* eslint-disable-next-line no-console */
  console.log('Connecting to Google Sheets')
  const sheet = await getSheet()

  const row = {
    confirmed: 'N',
    submissiondate: new Date().toISOString(),
    gpscoordinates: coords.join(', '),
    map,
    // TODO: photos
    // animalphoto: (
    //  'https://jotform.co/uploads/wildsunrescue/'+
    //  `${formID}/${submissionID}/${submissionID}_base64_9.png`
    // ),
    // locationphoto: (
    //  'https://jotform.co/uploads/wildsunrescue/'+
    //  `${formID}/${submissionID}/${submissionID}_base64_15.png`
    // ),
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
    managers.map(({ phoneNumber: managerPhoneNumber, whatsApp }) => (
      twilio.messages.create({
        body: smsMessage,
        from: whatsApp ? TWILLIO_WHATSAPP_NUMBER : TWILLIO_PHONE_NUMBER,
        to: (whatsApp ? 'whatsapp:' : '') + managerPhoneNumber,
      })
    )),
  )

  /* eslint-disable-next-line no-console */
  console.log('Done')
  return { statusCode: 200, body: '' }
})

module.exports.handler = serverless(app)
