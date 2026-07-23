  const validator = require('validator');

  const validate = (data) => {
    const mandatoryFields = ['firstname','emailId','password'];
    const isAllowed = mandatoryFields.every(( k) => Object.keys(data).includes(k));
    if(!isAllowed) throw new Error('Missing mandatory fields');

    if(!validator.isEmail(data.emailId)) throw new Error('Invalid emailId');
    if(!validator.isStrongPassword(data.password)) throw new Error('Weak password');

  }

module.exports = validate;