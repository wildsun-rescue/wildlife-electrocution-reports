const request = require('request')

const json = {
  slug: 'submit/91316277717866/',
  q3_whereIs: '\r\n10.11655, -85.49662',
  q7_whatIs7: 'Pole 123',
  q10_nearestBusiness: 'The Grocery Store',
  q12_animalSpecies: 'Howler  Monkey',
  q11_descriptionOf11: 'A howler monkey is in a tree',
  q6_yourName6: { first: 'Test', last: 'McTestFace' },
  q4_phoneNumber4: { area: '416', phone: '1231234' },
  q5_email5: 'example@example.com',
  event_id: '1558896953914_91316277717866_Vi0roOC',
}

const body = {
  formID: '91316277717866',
  submissionID: '4347061645428010153',
  webhookURL: 'https://lazy-hound-67.localtunnel.me/new-report-hook/',
  ip: '201.202.113.245',
  formTitle: 'Wildlife Electrocution Report',
  username: 'wildsunrescue',
  type: 'WEB',
  rawRequest: JSON.stringify(json),
}

const auth = process.env.STATIC_AUTH_TOKEN

describe('new-report-hook', () => {
  it('returns successfully', async () => {
    await new Promise((resolve, reject) => {
      request.post({
        url: `http://localhost:34567/new-report-hook/?auth=${auth}`,
        formData: body,
      })
    })
  })
})
