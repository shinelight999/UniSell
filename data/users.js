const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const items = mongoCollections.items;
const universities = require('./universities');
const bcrypt = require('bcrypt');
const userValidation = require('./validations/userValidations');
const sharedValidation = require('./validations/sharedValidations');
const { ObjectId } = require('mongodb');
const SALT_ROUNDS = 10;

/**
 * Adds a user to the Users collection.
 *
 * @param {String} universityId
 * @param {String} username
 * @param {String} password
 * @param {String} passwordConfirmation
 * @param {String} name
 * @param {String} email
 * @param {String} imageURL
 * @param {String} bio
 * @returns An object containing { userInserted: true } if successful.
 * @throws Will throw if parameters are invalid, user already exists,
 *         or there is an issue with the db.
 */
async function createUser(universityId, username, password, passwordConfirmation, name, email, imageURL, bio) {
  sharedValidation.checkArgumentLength(arguments, 8);

  let sanitizedData = userValidation.isValidUserParameters(
    universityId,
    username,
    password,
    passwordConfirmation,
    name,
    email,
    imageURL,
    bio
  );

  let university = await universities.getUniversityById(sanitizedData.universityId);

  let emailDomain = userValidation.getEmailDomain(sanitizedData.email);

  userValidation.validateDomainsMatch(university.emailDomain, emailDomain);

  await checkUsernameDoesntExist(sanitizedData.username)

  const hash = await bcrypt.hash(sanitizedData.password, SALT_ROUNDS);

  let newUser = {
    universityId: ObjectId(sanitizedData.universityId),
    username: sanitizedData.username,
    name: sanitizedData.name,
    email: sanitizedData.email,
    profileImageUrl: sanitizedData.imageURL,
    bio: sanitizedData.bio,
    passwordHash: hash,
    super_admin: false,
    ratings: [],
  };

  const userCollection = await users();
  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw 'Could not add user!';
  }

  return { userInserted: true };
}

/**
 * Retrieve user from Users collection.
 *
 * @param {String} username
 * @returns The user as an object.
 * @throws Will throw if username parameter is invalid.
 */
async function getUser(username) {
  sharedValidation.checkArgumentLength(arguments, 1);

  username = userValidation.validateUsername(username);

  const userCollection = await users();
  const user = await userCollection.findOne({ username: username });

  if (!user) {
    throw 'User does not exist!'
  }

  user._id = user._id.toString();

  return user;
}

/**
 * Check if username already exists.
 *
 * @param {String} username
 * @returns The user as an object.
 * @throws Will throw if username is taken.
 */
async function checkUsernameDoesntExist(username) {
  sharedValidation.checkArgumentLength(arguments, 1);

  username = userValidation.validateUsername(username);

  const userCollection = await users();
  const user = await userCollection.findOne({ username: username });

  if (user) {
    throw 'User with username already exists!'
  }

  return true;
}

async function getUserById(id) {
  sharedValidation.checkArgumentLength(arguments, 1);

  id = sharedValidation.isValidUserId(id);

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: ObjectId(id) });

  if (!user) {
    throw 'User does not exist!'
  }

  user._id = user._id.toString();

  return user;
}

async function getAvgRating(id) {
  sharedValidation.checkArgumentLength(arguments, 1);

  id = sharedValidation.isValidUserId(id);

  let user = await getUserById(id);

  let sumRating = 0;

  let ratings = user.ratings;

  if (ratings.length == 0) {
    return sumRating;
  } else {
    for (let i = 0; i < ratings.length; i++) {
      let rating = ratings[i];

      sumRating += rating.rating;
    }

    return (Math.round((sumRating / ratings.length) * 10) / 10);
  }
}

/**
 * Checks if the user's credentials are valid.
 *
 * @param {String} universityId
 * @param {String} username
 * @param {String} password
 * @returns An object containing { authenticated: true } if successful.
 * @throws Will throw if the parameters are invalid, username doesn't
 *         exist, or the credentials do not match.
 */
async function checkUser(universityId, username, password) {
  sharedValidation.checkArgumentLength(arguments, 3);

  let sanitizedData = userValidation.isValidCheckUserParameters(
    universityId,
    username,
    password
  )

  let user = await getUser(username);

  let university = await universities.getUniversityById(sanitizedData.universityId);

  let emailDomain = userValidation.getEmailDomain(user.email);

  userValidation.validateDomainsMatch(university.emailDomain, emailDomain);

  let passwordsMatch = false;

  try {
    passwordsMatch = await bcrypt.compare(password, user.passwordHash);
  } catch (e) {
    throw 'Exception occurred when comparing passwords!';
  }

  if (!passwordsMatch) {
    throw 'Passwords do not match!';
  }

  return { authenticated: true };
}

async function makeSuperAdmin(username) {
  sharedValidation.checkArgumentLength(arguments, 1);

  username = userValidation.validateUsername(username);

  const user = await getUser(username);

  let updateUser = {
    super_admin: true
  };

  const userCollection = await users();
  const update = await userCollection.updateOne(
    { _id: ObjectId(user._id) },
    { $set: updateUser }
  );

  if (!update.matchedCount && !update.modifiedCount) {
    throw 'Cannot update the user to super admin!';
  }

  return { userUpdated: true };
}

/**
* Updates a user in the Users collection.
*
* @param {String} currentUsername
* @param {String} username
* @param {String} name
* @param {String} email
* @param {String} imageURL
* @param {String} bio
* @returns An object containing { userUpdated: true } if successful.
* @throws Will throw if parameters are invalid, user doesn't exist,
*         or there was an issue with the db.
*/
async function updateUser(currentUsername, username, name, email, imageURL, bio) {
  sharedValidation.checkArgumentLength(arguments, 6);

  let sanitizedData = userValidation.isValidUserUpdateParameters(
    currentUsername,
    username,
    name,
    email,
    bio
  )

  let sanitizedDataImageURL = '';

  try {
    sanitizedDataImageURL = userValidation.isValidImageURL(imageURL);
  } catch (e) {
    // do nothing
  }

  let user = await getUser(sanitizedData.currentUsername);

  if (sanitizedData.currentUsername !== sanitizedData.username) {

    // Check if new username already exists
    await checkUsernameDoesntExist(sanitizedData.username);
  }

  let university = await universities.getUniversityById(user.universityId.toString());

  let emailDomain = userValidation.getEmailDomain(sanitizedData.email);

  userValidation.validateDomainsMatch(university.emailDomain, emailDomain);

  let updatedUser = {
    username: sanitizedData.username,
    name: sanitizedData.name,
    email: sanitizedData.email,
    profileImageUrl: sanitizedDataImageURL,
    bio: sanitizedData.bio
  };

  if (sanitizedDataImageURL === '') {
    delete updatedUser.profileImageUrl;
  }

  const userCollection = await users();
  const updateInfo = await userCollection.updateOne(
    { _id: ObjectId(user._id) },
    { $set: updatedUser }
  );

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw 'Could not update user!';
  }

  return { userUpdated: true, username: sanitizedData.username };
}

/**
* Updates a user's password in the Users collection.
*
* @param {String} username
* @param {String} currentPassword
* @param {String} newPassword
* @param {String} newPasswordConfirmation
* @returns An object containing { passwordUpdated: true } if successful.
* @throws Will throw if parameters are invalid, user doesn't exist,
*         or there was an issue with the db.
*/
async function updatePassword(username, currentPassword, newPassword, newPasswordConfirmation) {
  sharedValidation.checkArgumentLength(arguments, 4);

  sanitizedData = userValidation.validateUpdatePassword(username, currentPassword, newPassword, newPasswordConfirmation);

  let user = await getUser(sanitizedData.username);

  let passwordsMatch = false;

  try {
    passwordsMatch = await bcrypt.compare(sanitizedData.currentPassword, user.passwordHash);
  } catch (e) {
    throw 'Exception occurred when comparing passwords!';
  }

  if (!passwordsMatch) {
    throw 'Your password does not match your account password!';
  }

  const hash = await bcrypt.hash(sanitizedData.newPassword, SALT_ROUNDS);

  let updatedUser = {
    passwordHash: hash
  };

  const userCollection = await users();
  const updateInfo = await userCollection.updateOne(
    { _id: ObjectId(user._id) },
    { $set: updatedUser }
  );

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw 'Could not update user password!';
  }

  return { passwordUpdated: true };
}

async function hasAcceptedBids(id) {
  sharedValidation.checkArgumentLength(arguments, 1);

  id = sharedValidation.isValidUserId(id);

  let user = await getUserById(id);

  const itemCollection = await items();
  const itemsList = await itemCollection.find({ 'bids.userId': ObjectId(user._id), 'bids.accepted': true, sold: false }).toArray();

  if (itemsList.length == 0) {
    return false;
  } else {
    return itemsList;
  }
}

async function createRating(raterId, rateeId, rating) {
  sharedValidation.checkArgumentLength(arguments, 3);

  raterId = sharedValidation.isValidUserId(raterId);
  rateeId = sharedValidation.isValidUserId(rateeId);
  rating = sharedValidation.isValidRating(rating);

  let rater = await getUserById(raterId);
  let ratee = await getUserById(rateeId);

  const newRating = {
    _id: ObjectId(),
    ratersUserId: ObjectId(rater._id),
    rating: rating
  };

  const userCollection = await users();
  const updatedInfo = await userCollection.updateOne({ _id: ObjectId(ratee._id) }, { $addToSet: { ratings: newRating } });

  if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) {
    throw 'Could not create rating successfully';
  }

  return true;
}

module.exports = {
  createUser,
  getUser,
  checkUser,
  makeSuperAdmin,
  updateUser,
  updatePassword,
  getUserById,
  getAvgRating,
  hasAcceptedBids,
  createRating
};
