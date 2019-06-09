const request = require('request')

const body = {
  formID: '91316277717866',
  submissionID: '4359113237427372574',
  webhookURL: 'https://tender-noether-e25cce.netlify.com/.netlify/functions/new-report-hook?auth=El95LojvoobAOCK368DoyIEkv8y35NZmkEJ0J7vCG69Rvev4rQDodeJ4',
  ip: '201.192.212.47',
  formTitle: 'Wildlife Electrocution Report',
  pretty: 'Where is the animal located? If you allowed your location to be read by this program, it will be reflected below. If not, or if you are already in a different location, please move the pin to the correct location. / ¿Por dónde se encuentra el animal? Si has permitido que este programa lea tu ubicación debe ser reflejado en el mapa. Si no, o si ya estás en otro lugar, mueve el pin a la ubicación correcta.:\r\n10.62674, -85.44367, Nearest Business or Landmark / Negocio o Algo Llamativo Mas Cercano:test, Animal Species / La espcie Del Animal:test, Description of the event / Descripción del acontacimiento:test, Your Name / Tú Nombre:test test, Phone Number / Número Telefónico:1123 1231234',
  username: 'wildsunrescue',
  rawRequest: '{"slug":"submit\\/91316277717866\\/","q3_whereIs3":"\\r\\n10.62674, -85.44367","q9_photoOf9":"","q7_whatIs7":"","q10_nearestBusiness":"test","q12_animalSpecies":"test","q11_descriptionOf":"test","q6_yourName6":{"first":"test","last":"test"},"q4_phoneNumber4":{"area":"1123","phone":"1231234"},"q5_email5":"","event_id":"1560102058628_91316277717866_GY31sbO"}',
  type: 'WEB'
}

const auth = process.env.STATIC_AUTH_TOKEN

describe('new-report-hook', () => {
  it('returns successfully', async () => {
    await new Promise((resolve, reject) => {
      request.post({
        url: `http://localhost:34567/new-report-hook?auth=${auth}`,
        formData: body,
      })
    })
  })
})
