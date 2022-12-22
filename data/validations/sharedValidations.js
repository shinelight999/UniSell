const { ObjectId } = require('mongodb');

function stringifyId(id) {
    return id.toString();
}

function validateObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw 'invalid object ID';
    }
}

function checkArgumentLength(args, length) {
    let argLength = args.length;

    if (argLength > length) {
        throw `Too many arguments passed to function. Expecting ${length}, got ${argLength}`;
    } else if (argLength < length) {
        throw `Too few arguments passed to function. Expecting ${length}, got ${argLength}`;
    }
}

function checkParamPresent(variable, variableName) {
    if (!variable || variable === undefined) {
        throw `${variableName || 'provided variable'} is not present`;
    }
}

function checkIsString(string, variableName) {
    if (typeof string !== 'string') {
        throw `${variableName || 'provided variable'} is not a string`;
    }
}

function cleanUpString(string) {
    return string.trim();
}

function checkStringLength(string, variableName, minLength) {
    if (string.length === 0) {
        throw `${variableName || 'provided variable'} is empty or only contains spaces`;
    }

    minLength = minLength || 1;
    if (string.length < minLength) {
        throw `${variableName || 'provided variable'} must be more than ${minLength} characters`;
    }
}

function isValidUserId(id) {
  checkParamPresent(id, 'user id');
  checkIsString(id);
  id = cleanUpString(id);
  checkStringLength(id, 'user id');
  validateObjectId(id);

  return id;
}

function isValidUniversityId(id) {
  checkParamPresent(id, 'university id');
  checkIsString(id);
  id = cleanUpString(id);
  checkStringLength(id, 'university id');
  validateObjectId(id);

  return id;
}

function isValidItemId(id) {
  checkParamPresent(id, 'item id');
  checkIsString(id);
  id = cleanUpString(id);
  checkStringLength(id, 'item id');
  validateObjectId(id);

  return id;
}

function isValidUrlString(url) {
  checkParamPresent(url, 'url');
  checkIsString(url);
  url = cleanUpString(url);
  checkStringLength(url, 'url');

  return id;
}

function isValidRating(rating){
  if (isNaN(rating)) {
    throw 'Must be a number'
  }

  rating = parseInt(rating);

  if (rating < 1) {
    throw 'rating cannot be below 1';
  } else if (rating > 5) {
    throw 'rating cannot be greater than 5'
  }
    
  return rating;
}

module.exports = {
    stringifyId,
    validateObjectId,
    checkArgumentLength,
    checkParamPresent,
    checkIsString,
    cleanUpString,
    checkStringLength,
    isValidUniversityId,
    isValidItemId,
    isValidUserId,
    isValidUrlString,
    isValidRating
}
