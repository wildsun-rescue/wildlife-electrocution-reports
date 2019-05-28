const Promise = require('bluebird')
const serverless = require('serverless-http')
const express = require('express')
const multer = require('multer')

const deline = require('deline')
const Twilio = require('twilio')
const isgd = require('isgd')
// const { google } = require('googleapis')
const GoogleSpreadsheet = require('google-spreadsheet')

const {
  STATIC_AUTH_TOKEN,
  TWILLIO_SID,
  TWILLIO_AUTH_TOKEN,
  TWILLIO_PHONE_NUMBER,
  GOOGLE_CREDENTIALS,
  GOOGLE_SPREADSHEET_ID,
} = process.env
//
// const sheets = google.sheets('v4', {
//   auth: GOOGLE_API_KEY,
// })

const pages = {
  instructions: 1,
  mapData: 2,
  formSubmissions: 3,
  managers: 4,
}

const app = express()

const upload = multer().none()

const getSheet = async () => {
  // spreadsheet key is the long id in the sheets URL
  const sheet = new GoogleSpreadsheet(GOOGLE_SPREADSHEET_ID)

  // see notes below for authentication instructions!
  var creds = JSON.parse(GOOGLE_CREDENTIALS)
  console.log(creds)

  await Promise.promisify(sheet.useServiceAccountAuth)(creds)

  return sheet
}

const getManagers = async ({ row, sheet }) => {
  const managerRows = await Promise.promisify(sheet.getRows)(pages.managers)
  console.log(managerRows)
  return JSON.parse(MANAGER_PHONE_NUMBERS)
}

const updateSpreadsheet = async ({ row, sheet }) => {
  console.log('APPENDING ROW', row)

  await Promise.promisify(sheet.addRow)(pages.formSubmissions, row)
}

const shorten = (url) => new Promise((resolve) => {
  isgd.shorten(url, resolve)
})

app.all('*', async (req, res) => {
  if (req.query.auth !== STATIC_AUTH_TOKEN) {
    res.status(404)
    return
  }

  await Promise.promisify(upload)(req, res)

  const json = JSON.parse(req.body.rawRequest)

  // delete req.body['rawRequest']
  // delete json['q9_photoOf9']
  //
  // console.log('\nForm Submission')
  // console.log('----------------------------------------------')
  // console.log({
  //   body: req.body,
  //   json,
  // })

  const {
    formID,
    submissionID,
  } = req.body

  const {
    q6_yourName6: name,
    q12_animalSpecies: species,
    q3_whereIs: coordinatesString,
    q4_phoneNumber4: phoneObj,
    q11_descriptionOf11: description,
  } = json

  const fullname = `${name.first} ${name.last}`

  const phoneNumber = (
    `(${phoneObj.area}) `
    + `${phoneObj.phone.slice(0, 3)}-${phoneObj.phone.slice(3)}`
  )

  const coords = coordinatesString.split(',').map(s =>
    parseFloat(s.trim())
  )

  const map = await shorten(
    `https://maps.google.com/maps?q=${coords[0]},${coords[1]}`
  )

  const sheet = await getSheet()

  const row = {
    submissiondate: new Date().toISOString(),
    gpscoordinates: coords.join(', '),
    map,
    photo: (
     'https://jotform.co/uploads/wildsunrescue/'+
     `${formID}/${submissionID}/${submissionID}_base64_9.png`
    ),
    email: json.q5_email5,
    firstname: json.q6_yourName6.first,
    lastname: json.q6_yourName6.last,
    electricalpostnumber: json.q7_whatIs7,
    nearestbusinessorlandmark: json.q10_nearestBusiness,
    descriptionoftheanimalinneed: json.q11_descriptionOf11,
    animalspecies: json.q12_animalSpecies,
    phonenumber: phoneNumber,
    ip: req.body.ip,
  }

  await updateSpreadsheet({ row, sheet })
  const managers = await getManagers({ row, sheet })

  const smsMessage = deline`
    Wildlife Electrocution Alert!\n

    A ${species} has been reported by ${fullname}
    📞 ${phoneNumber}\n

    Description: ${description}\n

    Map: ${map}

    Sheet: https://docs.google.com/spreadsheets/d/1CT9bNkZvscQnYVaKHtEP2aZm6mDD_NNQy7EGV3OmSEg/edit?usp=sharing
  `

  console.log(`\nSMS (${smsMessage.length} Bytes)`)
  console.log('----------------------------------------------')
  console.log(`${smsMessage}\n`)

  const twilio = Twilio(TWILLIO_SID, TWILLIO_AUTH_TOKEN)

  await Promise.all(
    managers.map(managerPhoneNumber =>
      twilio.messages.create({
        body: smsMessage,
        from: TWILLIO_PHONE_NUMBER,
        to: managerPhoneNumber
      })
    )
  )

  return { statusCode: 200, body: '' }
})

module.exports.handler = serverless(app)
