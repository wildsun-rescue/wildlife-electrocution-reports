const Yup = require('yup')
require('./yupPhone')

const WildlifeReportSchema = Yup.object().shape({
  coords: Yup.array()
    .of(Yup.number())
    .min(2)
    .max(2)
    .required(),
  // animalPhoto: Yup.string(),
  // locationPhoto: Yup.string(),
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
