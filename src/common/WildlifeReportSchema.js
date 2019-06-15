const Yup = require('yup')

const rePhoneNumber = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3,4}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

module.exports.rePhoneNumber = rePhoneNumber

Yup.addMethod(Yup.string, 'phone', function validatePhone() {
  return this.test('phone', 'Phone number is not valid', value => (
    rePhoneNumber.test(value)
  ))
})

const WildlifeReportSchema = Yup.object().shape({
  photoCount: Yup.number(),
  coords: Yup.array()
    .of(Yup.number())
    .min(2)
    .max(2)
    .required(),
  elecricalPostNumber: Yup.string(),
  nearestLandmark: Yup.string(),
  species: Yup.string(),
  description: Yup.string(),
  phoneNumber: Yup.string()
    .phone()
    .required('Required'),
  fullName: Yup.string()
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
})

module.exports = WildlifeReportSchema
