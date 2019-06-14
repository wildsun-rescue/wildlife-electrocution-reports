const Yup = require('yup')

const rePhoneNumber = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3,4}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

module.exports.rePhoneNumber = rePhoneNumber

Yup.addMethod(Yup.string, 'phone', function validatePhone() {
  return this.test('phone', 'Phone number is not valid', value => (
    rePhoneNumber.test(value)
  ))
})
