const sharedValidation = require('./sharedValidations');

function isValidUniversityParameters(name, emailDomain) {
  sharedValidation.checkParamPresent(name, 'name');
  sharedValidation.checkParamPresent(emailDomain, 'emailDomain');

  sharedValidation.checkIsString(name, 'name');
  sharedValidation.checkIsString(emailDomain, 'emailDomain');

  name = sharedValidation.cleanUpString(name);
  emailDomain = sharedValidation.cleanUpString(emailDomain);

  sharedValidation.checkStringLength(name, 'name');
  sharedValidation.checkStringLength(emailDomain, 'emailDomain');

  emailDomain = emailDomain.toLowerCase();

  if (!isValidDomain(emailDomain)) {
    throw 'Invalid email domain!';
  }

  return {
    name: name,
    emailDomain: emailDomain
  };
}

function isValidDomain(email) {
  // Check for valid email pattern and only accept .edu addresses
  // Two letter country codes accepted before .edu (e.g. string@string.uk.edu)
  let emailRegex = new RegExp(
    "(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[A-Z]{2}|edu)\\b"
  );

  return emailRegex.test(email);
}

module.exports = {
  isValidUniversityParameters
};
