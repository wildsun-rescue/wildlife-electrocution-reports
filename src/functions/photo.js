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
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_REGION,
  STATIC_SECRET_KEY,
} = process.env

const app = express()
app.use(cors())

// AWS and S3

const s3 = new AWS.S3({
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  region: S3_REGION,
  signatureVersion: 'v4',
})


// Lambda Function

app.get('*', async (req, res) => {
  if (req.query.secret !== STATIC_SECRET_KEY) {
    res.status(404)
    res.send('')
    return
  }

  const imageURL = s3.getSignedUrl('getObject', {
    Bucket: S3_BUCKET,
    Key: req.query.key,
    Expires: 60 * 60,
  })

  /* eslint-disable-next-line no-console */
  console.log('Done')

  res.type('.html')
  res.send(`
    <html>
      <body>
        <img
          src=${imageURL}
          style="display: block; max-width: 100%; max-height: 100%; margin-left: auto; margin-right: auto;"
        />
      </body>
    </html>
  `)
})

module.exports.handler = serverless(app)
