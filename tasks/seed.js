const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;
const universities = data.universities;
const items = data.items;

async function testUniversities() {
  try {
    let university = await universities.createUniversity(
      'Stevens Institute',
      'stevens.edu'
    );
  } catch (e) {
    console.log(e);
  }

  try {
    await universities.createUniversity(
      'Fashion Institute of Technology',
      'fit.edu'
    );
  } catch (e) {
    console.log(e);
  }

  try {
    let universityList = await universities.getAll();
    let university = universityList[0];

    await universities.updateUniversity(
      university['_id'],
      'Stevens Institute of Technology',
      'stevens.edu'
    );
  } catch (e) {
    console.log(e);
  }
}

async function testUsers() {
  try {
    let universityList = await universities.getAll();
    let university = universityList[0];

    await users.createUser(
      university['_id'],
      'superadmin',
      'super_admin_password',
      'super_admin_password',
      'Super Admin User',
      'super_admin@stevens.edu',
      'https://cs546-ws-final-project-images.s3.amazonaws.com/1651856921475successful-college-student-lg.png',
      'This is my bio. I am an admin.'
    );
  } catch (e) {
    console.log(e);
  }

  try {
    let user = await users.getUser('superadmin');
    await users.makeSuperAdmin(user.username);
  } catch (e) {
    console.log(e);
  }
}

async function testItems() {

  const photos = [{
    _id: '933f9e946b766435325t424354',
    description: 'Front shot of futon - flat',
    imageUrl: 'https://cs546-ws-final-project-images.s3.amazonaws.com/1651857177915dacb8aeb-a57d-457f-af4c-a1ca8ad49545.89ea393db35e9dda0dac13ab644cc422.jpeg'
  },
  {
    _id: '933f9e946b766435325t424355',
    description: 'Front shot of futon - regular',
    imageUrl: 'https://cs546-ws-final-project-images.s3.amazonaws.com/1651857224514630e3b02-55d2-4958-b75f-d640bdf26476.c54b41d458cf89d2f92df908e9717f02.jpeg'
  },
  {
    _id: '933f9e946b766435325t424356',
    description: 'Futon no background - flat',
    imageUrl: 'https://cs546-ws-final-project-images.s3.amazonaws.com/165185725714321291a86-862c-46c6-bcc6-40da57cb55ef.d5698a62ff02d0018775bd51540fb26c.jpeg'
  },
  {
    _id: '933f9e946b766435325t424357',
    description: 'Side shot of futon',
    imageUrl: 'https://cs546-ws-final-project-images.s3.amazonaws.com/16518572834506e40a9bc-179e-41b8-a310-90f164ce6a96.85d926d8107ebb97b13ee0c19173b09a.jpeg'
  },
  {
    _id: '933f9e946b766435325t424358',
    description: 'Leg of futon',
    imageUrl: 'https://cs546-ws-final-project-images.s3.amazonaws.com/1651857309792b0652921-0ece-4a17-b65e-b51a61674a27.4ca14558e66a5ca3670520a3f09f617e.jpeg'
  },
  {
    _id: '933f9e946b766435325t424359',
    description: 'One side up',
    imageUrl: 'https://cs546-ws-final-project-images.s3.amazonaws.com/1651857324350c516b030-3581-4043-9ba2-dc9780059403.e2bfc8ec4edcc6f9b327e4875d8685ca.jpeg'
  },
  {
    _id: '933f9e946b766435325t424361',
    description: 'Dimensions',
    imageUrl: 'https://cs546-ws-final-project-images.s3.amazonaws.com/165185736230914d470ae-e27d-43de-96dc-84548681269c.6225b4203e6e9e8bd6a0c784fb3c8fd3.jpeg'
  }]

  let itemId;

  try {
    let user = await users.getUser('superadmin');

    const result = await items.createItem(
      'Black futon',
      'A black futon that can serve as a couch or bed. Futon is 72x34x32. Originally paid 170 for it.',
      'futon, black, couch, bed, furniture',
      '100',
      user.username,
      photos,
      'Need to grab it from Dorm E Room 204. Call me at 215-245-2002'
    );

    itemId = result.id;

  } catch (e) {
    console.log(e);
  }

  try {

    for (let i = 0; i < photos.length; ++i) {

      let photo = photos[i];

      await items.createPhotoForItem(itemId, photo.description, photo.imageUrl);
    }
  } catch (e) {
    console.log(e);
  }
}

async function main() {
  console.log('Database Connected');
  const db = await dbConnection.dbConnection();
  await db.dropDatabase();

  await testUniversities();
  await testUsers();
  await testItems();

  console.log('Done seeding database');
  await dbConnection.closeConnection();
}

main();
