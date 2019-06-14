require('isomorphic-fetch')

const json = {
  coords: [
    10.1277495,
    -85.44625090000001,
  ],
  elecricalPostNumber: '',
  nearestLandmark: '',
  species: '',
  description: '',
  phoneNumber: '1231234',
  fullName: 'test',
  email: 'example@example.com',
}

const SUBMISSION_URL = 'http://localhost:34567/report'

// eslint-disable-next-line no-undef
describe('new-report-hook', () => {
  // eslint-disable-next-line no-undef
  it('returns successfully', () => (
    fetch(SUBMISSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    })
  ))
})
