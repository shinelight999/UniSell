const mongoCollections = require('../config/mongoCollections');
const items = mongoCollections.items;
const users = require('./users');
const itemValidation = require('./validations/itemValidations');
const sharedValidation = require('./validations/sharedValidations');
const { ObjectId } = require('mongodb');

async function getAllByUniversityId(id) {
  sharedValidation.checkArgumentLength(arguments, 1);
  id = sharedValidation.isValidUniversityId(id);

  const itemCollection = await items();
  let itemList = await itemCollection.find({ sold: false, universityId: ObjectId(id) }).toArray();

  if (!itemList) {
    throw 'Could not get all items';
  }

  itemList.forEach(item => {
    item._id = sharedValidation.stringifyId(item._id);

    let photos = item.photos;
    item.imageURL = '/public/images/no_image_yet.jpg';

    if (photos.length > 0) {
      item.imageURL = photos[0].imageUrl;
    }

    photos.forEach(photo => {
      photo._id = sharedValidation.stringifyId(photo._id);
    })
  });

  return itemList;
}

async function getAllByUniversityIdAndKeyword(id, keyword) {
  sharedValidation.checkArgumentLength(arguments, 2);
  id = sharedValidation.isValidUniversityId(id);
  sharedValidation.checkIsString(keyword);
  keyword = sharedValidation.cleanUpString(keyword);
  sharedValidation.checkStringLength(keyword, 'keyword');

  const itemCollection = await items();
  let itemList = await itemCollection.find({ sold: false, keywords: keyword, universityId: ObjectId(id) }).toArray();

  if (!itemList) {
    throw 'No items for that keyword';
  }

  itemList.forEach(item => {
    item._id = sharedValidation.stringifyId(item._id);

    let photos = item.photos;
    item.imageURL = '/public/images/no_image_yet.jpg';

    if (photos.length > 0) {
      item.imageURL = photos[0].imageUrl;
    }

    photos.forEach(photo => {
      photo._id = sharedValidation.stringifyId(photo._id);
    })
  });

  return itemList;
}

async function getItemById(id) {
  sharedValidation.checkArgumentLength(arguments, 1);
  id = sharedValidation.isValidItemId(id);

  const itemCollection = await items();
  const item = await itemCollection.findOne({ _id: ObjectId(id) });

  if (!item) {
    throw 'Item does not exist!'
  }

  item._id = item._id.toString();

  return item;
}

async function createItem(title, description, keywords, price, username, photos, pickUpMethod) {
  sharedValidation.checkArgumentLength(arguments, 7);

  let sanitizedData = itemValidation.isValidItemParameters(title, description, keywords, price, username, photos, pickUpMethod);

  let user = await users.getUser(sanitizedData.username);

  let newItem = {
    title: sanitizedData.title,
    description: sanitizedData.description,
    keywords: sanitizedData.keywords,
    price: sanitizedData.price,
    userId: ObjectId(user._id),
    universityId: user.universityId,
    photos: [],
    pickUpMethod: sanitizedData.pickUpMethod,
    sold: false,
    bids: [],
    comments: []
  };

  const itemCollection = await items();
  const insertInfo = await itemCollection.insertOne(newItem);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw 'Could not add item!';
  }

  return { itemInserted: true, id: insertInfo.insertedId.toString() };
}

async function updateItem(id, title, description, keywords, price, photos, pickUpMethod, sold) {
  sharedValidation.checkArgumentLength(arguments, 8);

  let sanitizedData = itemValidation.isValidItemUpdateParameters(id, title, description, keywords, price, photos, pickUpMethod, sold);

  const itemCollection = await items();

  let item = await itemCollection.findOne({ _id: ObjectId(sanitizedData.id) });

  if (!item) {
    throw 'Item does not exist!'
  }

  let updateItem = {
    title: sanitizedData.title,
    description: sanitizedData.description,
    keywords: sanitizedData.keywords,
    price: sanitizedData.price,
    pickUpMethod: sanitizedData.pickUpMethod,
    sold: sanitizedData.sold
  };

  const update = await itemCollection.updateOne(
    { _id: ObjectId(sanitizedData.id) },
    { $set: updateItem }
  );

  if (!update.matchedCount && !update.modifiedCount) {
    throw 'Cannot update the item!';
  }

  return { itemUpdated: true };
}

async function createComment(id, username, comment) {
  sharedValidation.checkArgumentLength(arguments, 3);

  let sanitizedData = itemValidation.isValidComment(id, username, comment);

  let user = await users.getUser(sanitizedData.username);

  const itemCollection = await items();

  let item = await itemCollection.findOne({ _id: ObjectId(sanitizedData.id) });

  if (!item) {
    throw 'Item does not exist!'
  }

  const newComment = {
    _id: ObjectId(),
    commentersUserId: ObjectId(user._id),
    text: sanitizedData.comment
  };

  const itemsCollection = await items();
  const updatedInfo = await itemsCollection.updateOne({ _id: ObjectId(item._id) }, { $addToSet: { comments: newComment } });

  if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) {
    throw 'Could not create comment successfully';
  }

  const output = {
    photo: user.profileImageUrl || '/public/images/blank.jpg',
    text: newComment.text,
    username: user.username
  }

  return output;
}

async function getCommentsForItemId(id) {
  sharedValidation.checkArgumentLength(arguments, 1);

  id = sharedValidation.isValidItemId(id);

  let item = await getItemById(id);

  let comments = item.comments;

  let output = []
  for (let i = 0; i < comments.length; i++) {
    comment = comments[i];

    let user = await users.getUserById(comment.commentersUserId.toString());

    let result = {
      photo: user.profileImageUrl || '/public/images/blank.jpg',
      username: user.username,
      text: comment.text
    };

    output.push(result);
  }

  return output;
}

async function getImagesForItemId(id) {
  sharedValidation.checkArgumentLength(arguments, 1);

  id = sharedValidation.isValidItemId(id);

  let item = await getItemById(id);

  if (!item) {
    throw 'Item does not exist!'
  }

  let photos = item.photos;

  let output = []

  for (let i = 0; i < photos.length; i++) {
    let photo = photos[i];

    let result = {
      _id: photo._id,
      description: photo.description,
      imageURL: photo.imageUrl || '/public/images/blank.jpg'
    };

    output.push(result);
  }

  return output;
}

async function getPhoto(itemId, imageId) {
  sharedValidation.checkArgumentLength(arguments, 2);

  itemId = sharedValidation.isValidItemId(itemId);
  imageId = sharedValidation.isValidItemId(imageId);

  let item = await getItemById(itemId);

  if (!item) {
    throw 'Item does not exist!'
  }

  const itemCollection = await items();

  let photo = await itemCollection.aggregate(
    [
      {
        $match:
        {
          "photos._id": ObjectId(imageId)
        }
      },
      {
        $addFields:
        {
          photos:
          {
            $filter:
            {
              input: "$photos",
              cond:
              {
                $eq: ["$$this._id", ObjectId(imageId)]
              }
            }
          }
        }
      },
      { $unwind: "$photos" },
      {
        $project:
        {
          _id: "$photos._id",
          title: "$photos.description",
          releaseDate: "$photos.imageUrl"
        }
      }
    ]).toArray();

  if (!photo || photo.length === 0) {
    throw 'Photo does not exist!'
  }

  photo[0]._id = photo[0]._id.toString();

  return photo[0];
}

async function createPhotoForItem(id, description, imageURL) {
  sharedValidation.checkArgumentLength(arguments, 3);

  let sanitizedData = itemValidation.isValidPhoto(id, description, imageURL);

  const itemCollection = await items();

  let item = await itemCollection.findOne({ _id: ObjectId(sanitizedData.id) });

  if (!item) {
    throw 'Item does not exist!'
  }

  let newPhoto = {
    _id: ObjectId(),
    description: sanitizedData.description,
    imageUrl: sanitizedData.imageURL
  };

  const itemsCollection = await items();
  const updatedInfo = await itemsCollection.updateOne({ _id: ObjectId(item._id) }, { $addToSet: { photos: newPhoto } });

  if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) {
    throw 'Could not create photo successfully';
  }

  return { photoAdded: true };
}

async function editPhotoForItem(itemId, imageId, description, imageURL) {
  sharedValidation.checkArgumentLength(arguments, 4);

  let sanitizedData = itemValidation.isValidPhoto(itemId, description, imageURL);
  imageId = sharedValidation.isValidItemId(imageId);

  const itemCollection = await items();

  let item = await itemCollection.findOne({ _id: ObjectId(sanitizedData.id) });

  if (!item) {
    throw 'Item does not exist!'
  }

  let photo = await getPhoto(sanitizedData.id, imageId);

  const updatedInfo = await itemCollection.updateOne(
    {
      "_id": ObjectId(sanitizedData.id),
      "photos._id": ObjectId(photo._id)
    },
    {
      $set: {
        "photos.$.description": sanitizedData.description,
        "photos.$.imageUrl": sanitizedData.imageURL
      }
    }
  );

  if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) {
    throw 'Could not update photo successfully';
  }

  return { photoUpdated: true };
}

async function createBid(itemId, price, userId) {
  sharedValidation.checkArgumentLength(arguments, 3);
  let sanitizedData = itemValidation.isValidBid(itemId, price, userId);

  let user = await users.getUserById(sanitizedData.userId);
  let item = await getItemById(sanitizedData.itemId)

  const newBid = {
    _id: ObjectId(),
    itemId: ObjectId(sanitizedData.itemId),
    price: sanitizedData.price,
    userId: ObjectId(sanitizedData.userId),
    accepted: false
  };

  const itemCollection = await items();

  const updatedInfo = await itemCollection.updateOne({ _id: ObjectId(item._id) }, { $addToSet: { bids: newBid } });

  if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) {
    throw 'Could not create bid successfully!';
  }

  return {
    photo: user.profileImageUrl || '/public/images/blank.jpg',
    price: newBid.price,
    username: user.username
  };
}

async function getBidsForSeller(itemId) {
  sharedValidation.checkArgumentLength(arguments, 1);
  itemId = sharedValidation.isValidItemId(itemId);

  let item = await getItemById(itemId);

  let bids = item.bids;

  let output = []

  for (let i = 0; i < bids.length; i++) {
    let bid = bids[i];

    let user = await users.getUserById(bid.userId.toString());
    let rating = await users.getAvgRating(user._id);

    let result = {
      id: item._id,
      bidId: bid._id.toString(),
      photo: user.profileImageUrl || '/public/images/blank.jpg',
      username: user.username,
      price: bid.price,
      rating: rating
    };

    output.push(result);
  }

  return output;
}

async function getBidsForBuyer(itemId, userId) {
  sharedValidation.checkArgumentLength(arguments, 2);
  itemId = sharedValidation.isValidItemId(itemId);
  userId = sharedValidation.isValidUserId(userId);

  let item = await getItemById(itemId);
  let user = await users.getUserById(userId);

  let bids = item.bids;

  let output = []

  for (let i = 0; i < bids.length; i++) {
    let bid = bids[i];

    if (userId == bid.userId.toString()) {
      let result = {
        photo: user.profileImageUrl || '/public/images/blank.jpg',
        username: user.username,
        price: bid.price
      };

      output.push(result);
    }
  }

  return output;
}

async function getHighestBid(itemId) {
  sharedValidation.checkArgumentLength(arguments, 1);
  let bids = await getBidsForSeller(itemId);

  let max = 0;

  for (let i = 0; i < bids.length; i++) {
    let bid = bids[i];

    price = parseInt(bid.price);

    if (price > max) {
      max = price
    }
  }

  return max;
}

async function getBidForItem(itemId, bidId) {
  sharedValidation.checkArgumentLength(arguments, 2);
  itemId = sharedValidation.isValidItemId(itemId);
  bidId = sharedValidation.isValidItemId(bidId);

  let item = await getItemById(itemId);

  let bids = item.bids;

  if (bids.length == 0) {
    throw 'No bids for that item!'
  }

  let matches = bids.filter(entry => entry._id.toString() == bidId);

  if (matches.length == 0) {
    throw 'Bid is not under that item';
  }

  let bid = matches[0];

  let user = await users.getUserById(bid.userId.toString());

  return {
    username: user.username,
    email: user.email,
    bidOwner: bid.userId.toString(),
    price: bid.price
  }
}

async function acceptBid(itemId, bidId) {
  sharedValidation.checkArgumentLength(arguments, 2);
  itemId = sharedValidation.isValidItemId(itemId);
  bidId = sharedValidation.isValidItemId(bidId);

  // make sure bid exists
  await getBidForItem(itemId, bidId);

  let item = await getItemById(itemId);

  let bids = item.bids;

  if (bids.length == 0) {
    throw 'No bids for that item!';
  }

  for (let i = 0; i < bids.length; i++) {
    let bid = bids[i];

    await resetBid(bid.itemId.toString(), bid._id.toString());
  }

  const itemCollection = await items();
  const update = await itemCollection.updateOne(
    { "_id": ObjectId(itemId), "bids._id": ObjectId(bidId) },
    { $set: { "bids.$.accepted": true } }
  );

  if (!update.matchedCount && !update.modifiedCount) {
    throw 'Cannot update the item!';
  }

  return { bidAccepted: true };
}

async function resetBid(itemId, bidId) {
  sharedValidation.checkArgumentLength(arguments, 2);
  itemId = sharedValidation.isValidItemId(itemId);
  bidId = sharedValidation.isValidItemId(bidId);

  const itemCollection = await items();
  let item = await getItemById(itemId);

  // make sure bid exists
  await getBidForItem(itemId, bidId);

  const bid = await itemCollection.findOne({ '_id': ObjectId(item._id), 'bids._id': ObjectId(bidId) });

  if (!bid) {
    throw 'No bid with that ID exists';
  }

  const update = await itemCollection.updateOne(
    { "_id": ObjectId(itemId), "bids._id": ObjectId(bidId) },
    { $set: { "bids.$.accepted": false } }
  );

  if (!update.matchedCount && !update.modifiedCount) {
    throw 'Cannot update the item!';
  }

  return { bidReset: true };
}

async function hasAcceptedBidFor(itemId, userId) {
  sharedValidation.checkArgumentLength(arguments, 2);
  itemId = sharedValidation.isValidItemId(itemId);
  userId = sharedValidation.isValidUserId(userId);

  let item = await getItemById(itemId);

  let bids = item.bids;

  let matches = bids.filter(entry => entry.userId.toString() == userId && entry.accepted == true);

  if (matches.length == 0) {
    return false;
  }

  let bid = matches[0];

  let user = await users.getUserById(item.userId.toString());

  return {
    username: user.username,
    email: user.email,
    userGettingRatedId: user._id,
    userGivingRatingId: bid.userId.toString(),
    price: bid.price
  }
}

module.exports = {
  getAllByUniversityId,
  getAllByUniversityIdAndKeyword,
  getItemById,
  createItem,
  updateItem,
  createComment,
  getCommentsForItemId,
  getImagesForItemId,
  getPhoto,
  createPhotoForItem,
  editPhotoForItem,
  createBid,
  getBidsForBuyer,
  getBidsForSeller,
  getHighestBid,
  getBidForItem,
  acceptBid,
  hasAcceptedBidFor
};
