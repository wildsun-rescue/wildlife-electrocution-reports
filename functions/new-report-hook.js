const Promise = require('bluebird')
const serverless = require('serverless-http')
const express = require('express')
const multer = require('multer')

const deline = require('deline')
const Twilio = require('twilio')
const isgd = require('isgd')
const GoogleSpreadsheet = require('google-spreadsheet')

const {
  STATIC_AUTH_TOKEN,
  TWILLIO_SID,
  TWILLIO_AUTH_TOKEN,
  TWILLIO_PHONE_NUMBER,
  GOOGLE_CREDENTIALS,
  GOOGLE_SPREADSHEET_ID,
  NODE_ENV,
} = process.env

const authToken = NODE_ENV === 'development' ? '123' : STATIC_AUTH_TOKEN

const pages = {
  instructions: 1,
  formSubmissions: 2,
  managers: 3,
}

const app = express()

const upload = multer().none()

const getSheet = async () => {
  // spreadsheet key is the long id in the sheets URL
  const sheet = new GoogleSpreadsheet(GOOGLE_SPREADSHEET_ID)

  // see notes below for authentication instructions!
  var creds = JSON.parse(GOOGLE_CREDENTIALS)

  await Promise.promisify(sheet.useServiceAccountAuth)(creds)

  return sheet
}

const getManagers = async ({ row, sheet }) => {
  const managerRows = await Promise.promisify(sheet.getRows)(pages.managers)

  return managerRows
    .filter(row => row.active.trim() === 'Y')
    .map(row => row.cellphone.trim())
    .filter(cellphone => cellphone.length > 0)
}

const updateSpreadsheet = async ({ row, sheet }) => {
  // console.log('APPENDING ROW', row)
  await Promise.promisify(sheet.addRow)(pages.formSubmissions, row)
}

const shorten = (url) => new Promise((resolve) => {
  isgd.shorten(url, resolve)
})

app.all('*', async (req, res) => {
  if (req.query.auth !== authToken) {
    console.error('Unauthorized')
    res.status(404)
    return
  }

  await Promise.promisify(upload)(req, res)

  const unformattedJSON = JSON.parse(req.body.rawRequest)

  const json = Object.entries(unformattedJSON).reduce((acc, [k, v]) => {
    const formattedKey = k.replace(/(^q[0-9]+_|[0-9]+$)/g, '')
    acc[formattedKey] = v
    return acc
  }, {})

  // delete req.body['rawRequest']
  // delete json['q9_photoOf9']
  //
  console.log('\nForm Submission')
  console.log('----------------------------------------------')
  console.log('body')
  console.log(req.body)
  console.log('json')
  console.log(JSON.stringify(json, null, 2))

  const {
    formID,
    submissionID,
  } = req.body

  const {
    whereIs: coordinatesString,
    phoneNumber: phoneObj,
    email: email,
    yourName: name,
    whatIs: electricalPostNumber,
    nearestBusiness,
    descriptionOf: description,
    animalSpecies: species,
  } = json

  const fullname = `${name.first} ${name.last}`

  const phoneNumber = phoneObj.phone.length === 0 ? '' : (
    `(${phoneObj.area}) `
    + `${phoneObj.phone.slice(0, 3)}-${phoneObj.phone.slice(3)}`
  )

  const coords = coordinatesString.split(',').map(s =>
    parseFloat(s.trim())
  )

  const map = await shorten(
    `https://maps.google.com/maps?q=${coords[0]},${coords[1]}`
  )

  console.log('Connecting to Google Sheets')
  const sheet = await getSheet()

  const row = {
    confirmed: 'N',
    submissiondate: new Date().toISOString(),
    gpscoordinates: coords.join(', '),
    map,
    animalphoto: (
     'https://jotform.co/uploads/wildsunrescue/'+
     `${formID}/${submissionID}/${submissionID}_base64_9.png`
    ),
    locationphoto: (
     'https://jotform.co/uploads/wildsunrescue/'+
     `${formID}/${submissionID}/${submissionID}_base64_15.png`
    ),
    email,
    firstname: name.first,
    lastname: name.last,
    electricalpostnumber: electricalPostNumber,
    nearestbusinessorlandmark: nearestBusiness,
    descriptionoftheanimalinneed: description,
    animalspecies: species,
    phonenumber: phoneNumber,
    ip: req.body.ip,
  }

  console.log('Adding Form Data')
  await updateSpreadsheet({ row, sheet })
  console.log('Getting Managers')
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

  console.log('Sending Texts')
  await Promise.all(
    managers.map(managerPhoneNumber =>
      twilio.messages.create({
        body: smsMessage,
        from: TWILLIO_PHONE_NUMBER,
        to: managerPhoneNumber
      })
    )
  )

  console.log('Done')
  return { statusCode: 200, body: '' }
})

module.exports.handler = serverless(app)
