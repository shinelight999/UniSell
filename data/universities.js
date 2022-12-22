const mongoCollections = require('../config/mongoCollections');
const universities = mongoCollections.universities;
const universityValidation = require('./validations/universityValidations');
const sharedValidation = require('./validations/sharedValidations');
const { ObjectId } = require('mongodb');

async function getAll() {
    sharedValidation.checkArgumentLength(arguments, 0);

    const universityCollection = await universities();
    let universitiesList = await universityCollection.find({}).toArray();

    if (!universitiesList) {
        throw 'Could not get all universities';
    }

    universitiesList.forEach(university => {
      university._id = sharedValidation.stringifyId(university._id);
    });

    return universitiesList;
}

async function getUniversityById(id) {
  sharedValidation.checkArgumentLength(arguments, 1);
  id = sharedValidation.isValidUniversityId(id);

  const universityCollection = await universities();
  const university = await universityCollection.findOne({ _id: ObjectId(id) });

  if (!university) {
    throw 'University does not exist!'
  }
  
  university._id = university._id.toString();

  return university;
}

async function createUniversity(name, emailDomain) {
  sharedValidation.checkArgumentLength(arguments, 2);

  let sanitizedData = universityValidation.isValidUniversityParameters(name, emailDomain);

  await verifyUniversityIsUnique(sanitizedData.name, sanitizedData.emailDomain);

  let newUniversity = {
    name: sanitizedData.name,
    emailDomain: sanitizedData.emailDomain
  };

  const universityCollection = await universities();

  const insertInfo = await universityCollection.insertOne(newUniversity);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw 'Could not add university!';
  }

  return { universityInserted: true };
}

async function updateUniversity(id, name, emailDomain) {
  sharedValidation.checkArgumentLength(arguments, 3);

  id = sharedValidation.isValidUniversityId(id);
  let sanitizedData = universityValidation.isValidUniversityParameters(name, emailDomain);

  await verifyUniversityIsUniqueExisting(id, sanitizedData.name, sanitizedData.emailDomain);

  let updateUniversity = {
    name: sanitizedData.name,
    emailDomain: sanitizedData.emailDomain
  };

  const universityCollection = await universities();

  const update = await universityCollection.updateOne(
    { _id: ObjectId(id) },
    { $set: updateUniversity }
  );

  if (!update.matchedCount && !update.modifiedCount) {
    throw 'Cannot update the university!';
  }

  return { universityUpdated: true };
}

async function verifyUniversityIsUnique(name, emailDomain) {
  sharedValidation.checkArgumentLength(arguments, 2);

  let sanitizedData = universityValidation.isValidUniversityParameters(name, emailDomain);

  const universityCollection = await universities();

  let university = await universityCollection.findOne({
    name: sanitizedData.name
  });

  if (university != null) {
    throw 'Cannot create university since name is taken!';
  }

  university = await universityCollection.findOne({
    emailDomain: sanitizedData.emailDomain
  });

  if (university != null) {
    throw 'Cannot create university since emailDomain is taken!';
  }
}

async function verifyUniversityIsUniqueExisting(id, name, emailDomain) {
  sharedValidation.checkArgumentLength(arguments, 3);

  id = sharedValidation.isValidUniversityId(id);
  let sanitizedData = universityValidation.isValidUniversityParameters(name, emailDomain);

  const universityCollection = await universities();

  let universityOriginal = await universityCollection.findOne({
    _id: ObjectId(id)
  });

  if (!universityOriginal) {
    throw 'University does not exist!'
  }

  let university = await universityCollection.findOne({
    name: sanitizedData.name
  });

  if (university != null && university._id.toString() != universityOriginal._id.toString()) {
    throw 'Cannot update university since name is taken!';
  }

  university = await universityCollection.findOne({
    emailDomain: sanitizedData.emailDomain
  });

  if (university != null && university._id.toString() != universityOriginal._id.toString()) {
    throw 'Cannot update university since emailDomain is taken!';
  }
}

// async function deleteUniversity(id) {
//   const universitiesCollection = await universities();
//   const university = await universities.findOne({ _id: id });

//   if (!university) {
//     throw 'No university with given id exists!';
//   }

//   const deleteUniversity = await universitiesCollection.deleteOne({
//     _id: id
//   });

//   if (deleteUniversity.deletedCount == 0) {
//     throw 'Cannot delete university';
//   }
//   return { universityDeleted: true };
// }

module.exports = {
  getAll,
  getUniversityById,
  createUniversity,
  updateUniversity,
  // deleteUniversity
};
