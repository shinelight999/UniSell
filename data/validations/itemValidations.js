const sharedValidation = require('./sharedValidations');

function isValidItemParameters(title, description, keywords, price, username, photos, pickUpMethod) {
  sharedValidation.checkParamPresent(title, 'title');
  sharedValidation.checkParamPresent(description, 'description');
  sharedValidation.checkParamPresent(keywords, 'keywords');
  sharedValidation.checkParamPresent(price, 'price');
  sharedValidation.checkParamPresent(username, 'username');
  sharedValidation.checkParamPresent(photos, 'photos');
  sharedValidation.checkParamPresent(pickUpMethod, 'pickUpMethod');

  sharedValidation.checkIsString(title, 'title');
  sharedValidation.checkIsString(description, 'description');
  sharedValidation.checkIsString(keywords, 'keywords');
  sharedValidation.checkIsString(price, 'price');
  sharedValidation.checkIsString(username, 'username');
  // todo check photos is array of objects
  sharedValidation.checkIsString(pickUpMethod, 'pickUpMethod');

  title = sharedValidation.cleanUpString(title);
  description = sharedValidation.cleanUpString(description);
  keywords = sharedValidation.cleanUpString(keywords);
  price = sharedValidation.cleanUpString(price);
  username = sharedValidation.cleanUpString(username);
  pickUpMethod = sharedValidation.cleanUpString(pickUpMethod);

  sharedValidation.checkStringLength(title, 'title');
  sharedValidation.checkStringLength(description, 'description');
  sharedValidation.checkStringLength(keywords, 'keywords');
  sharedValidation.checkStringLength(price, 'price');
  sharedValidation.checkStringLength(username, 'username');
  sharedValidation.checkStringLength(pickUpMethod, 'pickUpMethod');

  keywords = keywords.split(',');

  keywords.forEach((keyword, index) => {
    sharedValidation.checkIsString(keyword, 'keyword');
    keyword = sharedValidation.cleanUpString(keyword);
    sharedValidation.checkStringLength(keyword, 'keyword');
    keywords[index] = keyword;
  });

  isValidPrice(price);

  return {
    title: title,
    description: description,
    keywords: keywords,
    price: price,
    username: username,
    photos: photos,
    pickUpMethod: pickUpMethod
  };
}

function isValidItemUpdateParameters(id, title, description, keywords, price, photos, pickUpMethod, sold) {
  id = sharedValidation.isValidItemId(id);

  sharedValidation.checkParamPresent(title, 'title');
  sharedValidation.checkParamPresent(description, 'description');
  sharedValidation.checkParamPresent(keywords, 'keywords');
  sharedValidation.checkParamPresent(price, 'price');
  sharedValidation.checkParamPresent(photos, 'photos');
  sharedValidation.checkParamPresent(pickUpMethod, 'pickUpMethod');
  sharedValidation.checkParamPresent(sold, 'sold');

  sharedValidation.checkIsString(title, 'title');
  sharedValidation.checkIsString(description, 'description');
  sharedValidation.checkIsString(keywords, 'keywords');
  sharedValidation.checkIsString(price, 'price');
  sharedValidation.checkIsString(photos, 'photos');
  sharedValidation.checkIsString(pickUpMethod, 'pickUpMethod');
  sharedValidation.checkIsString(sold, 'sold');

  title = sharedValidation.cleanUpString(title);
  description = sharedValidation.cleanUpString(description);
  keywords = sharedValidation.cleanUpString(keywords);
  price = sharedValidation.cleanUpString(price);
  photos = sharedValidation.cleanUpString(photos);
  pickUpMethod = sharedValidation.cleanUpString(pickUpMethod);
  sold = sharedValidation.cleanUpString(sold);

  sharedValidation.checkStringLength(title, 'title');
  sharedValidation.checkStringLength(description, 'description');
  sharedValidation.checkStringLength(keywords, 'keywords');
  sharedValidation.checkStringLength(price, 'price');
  sharedValidation.checkStringLength(photos, 'photos');
  sharedValidation.checkStringLength(pickUpMethod, 'pickUpMethod');
  sharedValidation.checkStringLength(sold, 'sold');

  keywords = keywords.split(',');

  keywords.forEach((keyword, index) => {
    sharedValidation.checkIsString(keyword, 'keyword');
    keyword = sharedValidation.cleanUpString(keyword);
    sharedValidation.checkStringLength(keyword, 'keyword');
    keywords[index] = keyword;
  });

  photos = photos.split(',');

  photos.forEach((photo, index) => {
    sharedValidation.checkIsString(photo, 'photo');
    photo = sharedValidation.cleanUpString(photo);
    sharedValidation.checkStringLength(photo, 'photo');
    photos[index] = photo;
  });

  isValidPrice(price);

  if (sold == 'true') {
    sold = true
  } else if (sold == 'false') {
    sold = false;
  } else {
    throw 'Sold is not a proper value';
  }

  return {
    id: id,
    title: title,
    description: description,
    keywords: keywords,
    price: price,
    photos: photos,
    pickUpMethod: pickUpMethod,
    sold: sold
  };
}

function isValidComment(id, username, comment) {
  id = sharedValidation.isValidItemId(id);

  sharedValidation.checkParamPresent(id, 'id');
  sharedValidation.checkParamPresent(username, 'username');
  sharedValidation.checkParamPresent(comment, 'comment');

  sharedValidation.checkIsString(id, 'id');
  sharedValidation.checkIsString(username, 'username');
  sharedValidation.checkIsString(comment, 'comment');

  id = sharedValidation.cleanUpString(id);
  username = sharedValidation.cleanUpString(username);
  comment = sharedValidation.cleanUpString(comment);

  sharedValidation.checkStringLength(id, 'id');
  sharedValidation.checkStringLength(username, 'username');
  sharedValidation.checkStringLength(comment, 'comment');

  return {
    id: id,
    username: username,
    comment: comment
  }
}

function isValidPhoto(id, description, imageURL) {
  id = sharedValidation.isValidItemId(id);

  sharedValidation.checkParamPresent(id, 'id');
  sharedValidation.checkParamPresent(description, 'description');
  sharedValidation.checkParamPresent(imageURL, 'imageURL');

  sharedValidation.checkIsString(id, 'id');
  sharedValidation.checkIsString(description, 'description');
  sharedValidation.checkIsString(imageURL, 'imageURL');

  id = sharedValidation.cleanUpString(id);
  description = sharedValidation.cleanUpString(description);
  imageURL = sharedValidation.cleanUpString(imageURL);

  sharedValidation.checkStringLength(id, 'id');
  sharedValidation.checkStringLength(description, 'description');
  sharedValidation.checkStringLength(imageURL, 'imageURL');

  return {
    id: id,
    description: description,
    imageURL: imageURL
  }
}

function isValidBid(itemId, price, userId) {
  sharedValidation.checkParamPresent(itemId, 'itemId');
  sharedValidation.checkParamPresent(userId, 'userId');
  sharedValidation.checkParamPresent(price, 'price');

  itemId = sharedValidation.isValidItemId(itemId);
  userId = sharedValidation.isValidUserId(userId);

  sharedValidation.checkIsString(itemId, 'itemId');
  sharedValidation.checkIsString(userId, 'userId');
  sharedValidation.checkIsString(price, 'price');

  itemId = sharedValidation.cleanUpString(itemId);
  userId = sharedValidation.cleanUpString(userId);
  price = sharedValidation.cleanUpString(price);

  sharedValidation.checkStringLength(itemId, 'itemId');
  sharedValidation.checkStringLength(userId, 'userId');
  sharedValidation.checkStringLength(price, 'price');

  isValidPrice(price);

  return {
    itemId: itemId,
    price: price,
    userId: userId
  }
}

function isValidPrice(price){
  if (isNaN(price)) {
    throw 'Must be a number'
  }

  price = parseInt(price);

  if (price < 0) {
    throw 'price cannot be below 0 (free)';
  }
}

module.exports = {
  isValidItemParameters,
  isValidItemUpdateParameters,
  isValidComment,
  isValidPhoto,
  isValidBid
};
