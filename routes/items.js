const express = require('express');
const router = express.Router();
const data = require('../data/index');
const items = data.items;
const users = data.users;
const itemValidation = require('../data/validations/itemValidations');
const sharedValidation = require('../data/validations/sharedValidations');
const xss = require('xss');

router.get('/new', async (req, res) => {
    res.render('items/new', { title: 'New Item', flash: req.flash('message') });
});

router.post('/', async (req, res) => {
    let body = req.body;

    if (!body) {
        req.flash('message', 'You must provide a body to your request');
        res.redirect('/items/new');
        return;
    }

    let { item_title, description, keywords, price, photos, pickUpMethod } = body;
    item_title = xss(item_title);
    description = xss(description);
    keywords = xss(keywords);
    price = xss(price);
    photos = xss(photos);
    pickUpMethod = xss(pickUpMethod);

    // temp until we get photos working
    photos = 'imag1, image2, image3';

    if (!item_title || !description || !keywords || !price || !photos || !pickUpMethod) {
        res.status(400).render('items/new', {
            title: 'New Item',
            error_status_code: 'HTTP 400 status code',
            error_messages: 'You must provide all fields',
            item_title: item_title,
            description: description,
            keywords: keywords,
            price: price,
            pickUpMethod: pickUpMethod
        });
        return;
    }

    let username = req.session.user.username;

    try {
        itemValidation.isValidItemParameters(item_title, description, keywords, price, username, photos, pickUpMethod);
    } catch (e) {
        res.status(400).render('items/new', {
            title: 'New Item',
            error_status_code: 'HTTP 400 status code',
            error_messages: e,
            item_title: item_title,
            description: description,
            keywords: keywords,
            price: price,
            pickUpMethod: pickUpMethod
        });
        return;
    }

    try {
        let response = await items.createItem(item_title, description, keywords, price, username, photos, pickUpMethod);

        if (response === null || response.itemInserted !== true) {
            res.status(500).render('items/new', {
                title: 'New Item',
                error_status_code: 'HTTP 500 status code',
                error_messages: 'Internal Server Error',
                item_title: item_title,
                description: description,
                keywords: keywords,
                price: price,
                pickUpMethod: pickUpMethod
            });
            return;
        }

        res.redirect('/items/' + response.id);
    } catch (e) {
        res.status(500).render('items/new', {
            title: 'New Item',
            error_status_code: 'HTTP 500 status code',
            error_messages: e,
            item_title: item_title,
            description: description,
            keywords: keywords,
            price: price,
            pickUpMethod: pickUpMethod
        });
    }
});

router.get('/:id', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        req.flash('message', 'No ID param provided!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidItemId(itemId);
    } catch (e) {
        req.flash('message', 'Bad item ID!');
        res.redirect('/');
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        req.flash('message', 'Could not find that item!');
        res.redirect('/');
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        req.flash('message', 'Could not find item owner!');
        res.redirect('/');
        return;
    }

    let comments = await items.getCommentsForItemId(itemId);
    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    let bids = await items.getBidsForBuyer(itemId, currentUser._id);

    if (currentUser._id == item.userId.toString()) {
        // get bids for seller instead
        bids = await items.getBidsForSeller(itemId);
    }

    let highest_bid;

    try {
        highest_bid = await items.getHighestBid(itemId);
    } catch (e) {
        req.flash('message', 'Something went wrong with highest bid');
        res.redirect('/');
        return;
    }

    let avgRating;

    try {
        avgRating = await users.getAvgRating(user._id);
    } catch (e) {
        req.flash('message', 'Something went wrong with overall rating');
        res.redirect('/');
        return;
    }

    let hasAcceptedBid;

    try {
        hasAcceptedBid = await items.hasAcceptedBidFor(itemId, currentUser._id);
    } catch (e) {
        req.flash('message', 'Something went wrong with hasAcceptedBid');
        res.redirect('/');
        return;
    }

    res.render('items/show', {
        title: item.title,
        item: item,
        canEdit: req.session.user.username == user.username,
        itemId: itemId,
        user: user,
        keywords: item.keywords.join(', '),
        comments: comments,
        bids: bids,
        highest_bid: highest_bid,
        avgRating: avgRating,
        hasAcceptedBid: hasAcceptedBid
    });
});

router.get('/:id/edit', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        req.flash('message', 'No ID param provided!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidItemId(itemId);
    } catch (e) {
        req.flash('message', 'Bad item ID!');
        res.redirect('/');
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        req.flash('message', 'Could not find that item!');
        res.redirect('/');
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        req.flash('message', 'Could not find item owner!');
        res.redirect('/');
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    if (req.session.user.username != user.username) {
        req.flash('message', 'Cannot edit that item because you are not the owner!');
        res.redirect('/');
        return;
    }

    res.render('items/edit', {
        title: 'Edit ' + item.title,
        id: item._id,
        item_title: item.title,
        description: item.description,
        keywords: item.keywords,
        price: item.price,
        pickUpMethod: item.pickUpMethod,
        flash: req.flash('message')
    });
});

router.get('/:id/editPhotos', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        req.flash('message', 'No ID param provided!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidItemId(itemId);
    } catch (e) {
        req.flash('message', 'Bad item ID!');
        res.redirect('/');
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        req.flash('message', 'Could not find that item!');
        res.redirect('/');
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        req.flash('message', 'Could not find item owner!');
        res.redirect('/');
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    if (req.session.user.username != user.username) {
        req.flash('message', 'Cannot edit that item because you are not the owner!');
        res.redirect('/');
        return;
    }

    res.render('items/editPhotos', {
        title: 'Photos for ' + item.title,
        id: item._id,
        flash: req.flash('message')
    });
});

router.get('/:id/photos', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        req.flash('message', 'No ID param provided!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidItemId(itemId);
    } catch (e) {
        req.flash('message', 'Bad item ID!');
        res.redirect('/');
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        req.flash('message', 'Could not find that item!');
        res.redirect('/');
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        req.flash('message', 'Could not find item owner!');
        res.redirect('/');
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    if (req.session.user.username != user.username) {
        req.flash('message', 'Cannot edit that item because you are not the owner!');
        res.redirect('/');
        return;
    }

    let photos;

    try {
        photos = await items.getImagesForItemId(itemId);
        res.status(200).json(photos);
    } catch (e) {
        res.status(500).json(e);
        return;
    }
});

router.put('/:id/update', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        req.flash('message', 'No ID param provided!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidItemId(itemId);
    } catch (e) {
        req.flash('message', 'Bad item ID!');
        res.redirect('/');
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        req.flash('message', 'Could not find that item!');
        res.redirect('/');
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        req.flash('message', 'Could not find item owner!');
        res.redirect('/');
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    if (req.session.user.username != user.username) {
        req.flash('message', 'Cannot edit that item because you are not the owner!');
        res.redirect('/');
        return;
    }

    let body = req.body;

    if (!body) {
        req.flash('message', 'You must provide a body to your request');
        res.redirect('/items/' + itemId);
        return;
    }

    let { item_title, description, keywords, price, photos, pickUpMethod, sold } = body;
    item_title = xss(item_title);
    description = xss(description);
    keywords = xss(keywords);
    price = xss(price);
    photos = xss(photos);
    pickUpMethod = xss(pickUpMethod);
    sold = xss(sold);

    // temp until we have photos
    photos = 'item1, item2, item3';

    if (!item_title || !description || !keywords || !price || !photos || !pickUpMethod || !sold) {
        res.status(400).render('items/edit', {
            title: 'Edit',
            error_status_code: 'HTTP 400 status code',
            error_messages: 'You must provide all attributes',
            id: itemId,
            item_title: item_title,
            description: description,
            keywords: keywords,
            price: price,
            photos: photos,
            pickUpMethod: pickUpMethod,
            sold: sold
        });
        return;
    }

    try {
        itemValidation.isValidItemUpdateParameters(itemId, item_title, description, keywords, price, photos, pickUpMethod, sold);
    } catch (e) {
        res.status(400).render('items/edit', {
            title: 'Edit',
            error_status_code: 'HTTP 400 status code',
            error_messages: e,
            id: itemId,
            item_title: item_title,
            description: description,
            keywords: keywords,
            price: price,
            photos: photos,
            pickUpMethod: pickUpMethod,
            sold: sold
        });
        return;
    }

    try {
        let response = await items.updateItem(itemId, item_title, description, keywords, price, photos, pickUpMethod, sold);

        if (response === null || response.itemUpdated !== true) {
            res.status(500).render('items/edit', {
                title: 'Edit',
                error_status_code: 'HTTP 500 status code',
                error_messages: 'Internal Server Error',
                id: itemId,
                item_title: item_title,
                description: description,
                keywords: keywords,
                price: price,
                photos: photos,
                pickUpMethod: pickUpMethod,
                sold: sold
            });
            return;
        }

        res.redirect('/items/' + itemId);
    } catch (e) {
        res.status(500).render('items/edit', {
            title: 'Edit',
            error_status_code: 'HTTP 500 status code',
            error_messages: e,
            id: itemId,
            item_title: item_title,
            description: description,
            keywords: keywords,
            price: price,
            photos: photos,
            pickUpMethod: pickUpMethod,
            sold: sold
        });
    }
});

router.post('/:id/comment', async (req, res) => {
    let params = req.params;

    if (!params) {
        res.json({ error: 'No params provided!' });
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        res.json({ error: 'No ID param provided!' });
        return;
    }

    let body = req.body;

    if (!body) {
        res.json({ error: 'You must supply a body to your request!' });
        return;
    }

    let { comment } = body;
    comment = xss(comment);

    if (!comment) {
        res.json({ error: 'You must supply a comment!' });
        return;
    }

    try {
        itemValidation.isValidComment(itemId, req.session.user.username, comment);
    } catch (e) {
        res.json({ error: 'Your param/body is not vaild!' });
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        res.json({ error: 'Could not find that item!' });
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        res.json({ error: 'Could not find item owner!' });
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    try {
        const commentResult = await items.createComment(itemId, req.session.user.username, comment);

        res.render('partials/comment', { layout: null, ...commentResult });
    } catch (e) {
        res.json({ error: 'Internal error!' });
    }
});

router.post('/:id/photo', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        req.flash('message', 'No ID param provided!');
        res.redirect('/');
        return;
    }

    let body = req.body;

    if (!body) {
        req.flash('message', 'You must supply a body to your request!');
        res.redirect('/');
        return;
    }

    let { description, imageURL } = body;
    description = xss(description);
    imageURL = xss(imageURL);

    if (!description) {
        req.flash('message', 'You must supply a description!');
        res.redirect('/');
        return;
    }

    if (!imageURL) {
        req.flash('message', 'You must supply a image url!');
        res.redirect('/');
        return;
    }

    try {
        itemValidation.isValidPhoto(itemId, description, imageURL);
    } catch (e) {
        req.flash('message', 'Your param/body is not vaild!');
        res.redirect('/');
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        req.flash('message', 'Could not find that item!');
        res.redirect('/');
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        req.flash('message', 'Could not find item owner!');
        res.redirect('/');
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    try {
        const photoResult = await items.createPhotoForItem(itemId, description, imageURL);
        res.status(200).json(photoResult);
    } catch (e) {
        res.status(500).json({ error: e });
    }
});

router.put('/:id/photo', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        req.flash('message', 'No ID param provided!');
        res.redirect('/');
        return;
    }

    let body = req.body;

    if (!body) {
        req.flash('message', 'You must supply a body to your request!');
        res.redirect('/');
        return;
    }

    let { imageId, description, imageURL } = body;
    imageId = xss(imageId);
    description = xss(description);
    imageURL = xss(imageURL);

    if (!imageId) {
        req.flash('message', 'You must supply an image id!');
        res.redirect('/');
        return;
    }

    if (!description) {
        req.flash('message', 'You must supply a description!');
        res.redirect('/');
        return;
    }

    if (!imageURL) {
        req.flash('message', 'You must supply a image url!');
        res.redirect('/');
        return;
    }

    try {
        itemValidation.isValidPhoto(itemId, description, imageURL);
    } catch (e) {
        req.flash('message', 'Your param/body is not vaild!');
        res.redirect('/');
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        req.flash('message', 'Could not find that item!');
        res.redirect('/');
        return;
    }

    try {
        let photo = await items.getPhoto(itemId, imageId);
    } catch (e) {
        req.flash('message', 'Could not find that photo!');
        res.redirect('/');
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        req.flash('message', 'Could not find item owner!');
        res.redirect('/');
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    try {
        const photoResult = await items.editPhotoForItem(itemId, imageId, description, imageURL);
        res.status(200).json(photoResult);
    } catch (e) {
        res.status(500).json({ error: e });
    }
});

router.post('/:id/bid', async (req, res) => {
    let params = req.params;
    let user = await users.getUser(req.session.user.username);

    if (!params) {
        res.json({ error: 'No params provided!' });
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        res.json({ error: 'No ID param provided!' });
        return;
    }

    let body = req.body;

    if (!body) {
        res.json({ error: 'You must supply a body to your request!' });
        return;
    }

    let { bid } = body;
    bid = xss(bid);

    if (!bid) {
        res.json({ error: 'You must supply a bid!' });
        return;
    }

    let item;

    try {
        itemValidation.isValidBid(itemId, bid, user._id);
    } catch (e) {
        res.json({ error: 'Your param/body is not vaild!' });
        return;
    }

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        res.json({ error: 'Could not find that item!' });
        return;
    }

    try {
        await users.getUserById(item.userId.toString());
    } catch (e) {
        res.json({ error: 'Could not find item owner!' });
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    try {
        const bidResult = await items.createBid(itemId, bid, user._id);

        res.render('partials/bid', { layout: null, ...bidResult });
    } catch (e) {
        res.status(500).json({ error: e });
    }
});

router.get('/:id/manage_bids', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let itemId = params.id;
    itemId = xss(itemId);

    if (!itemId) {
        req.flash('message', 'No ID param provided!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidItemId(itemId);
    } catch (e) {
        req.flash('message', 'Bad item ID!');
        res.redirect('/');
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        req.flash('message', 'Could not find that item!');
        res.redirect('/');
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        req.flash('message', 'Could not find item owner!');
        res.redirect('/');
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    if (req.session.user.username != user.username) {
        req.flash('message', 'Cannot edit that item because you are not the owner!');
        res.redirect('/');
        return;
    }

    let bids;

    try {
        bids = await items.getBidsForSeller(itemId);
    } catch (e) {
        req.flash('message', 'Something went wrong getting bids!');
        res.redirect('/');
        return;
    }

    res.render('items/manage_bids', {
        title: 'Bids for ' + item.title,
        id: item._id,
        bids: bids,
        flash: req.flash('message')
    });
});

router.get('/:id/bids/:bidId/accept', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let itemId = params.id;
    let bidId = params.bidId;
    itemId = xss(itemId);
    bidId = xss(bidId);

    if (!itemId) {
        req.flash('message', 'No ID param provided!');
        res.redirect('/');
        return;
    }

    if (!bidId) {
        req.flash('message', 'No bid ID param provided!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidItemId(itemId);
    } catch (e) {
        req.flash('message', 'Bad item ID!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidItemId(bidId);
    } catch (e) {
        req.flash('message', 'Bad bid ID!');
        res.redirect('/');
        return;
    }

    let item;

    try {
        item = await items.getItemById(itemId);
    } catch (e) {
        req.flash('message', 'Could not find that item!');
        res.redirect('/');
        return;
    }

    let user;

    try {
        user = await users.getUserById(item.userId.toString());
    } catch (e) {
        req.flash('message', 'Could not find item owner!');
        res.redirect('/');
        return;
    }

    let currentUser = await users.getUser(req.session.user.username);

    if (item.universityId.toString() != currentUser.universityId.toString()) {
        req.flash('message', 'Cannot view that item because it belongs to another school!');
        res.redirect('/');
        return;
    }

    if (req.session.user.username != user.username) {
        req.flash('message', 'Cannot edit that item because you are not the owner!');
        res.redirect('/');
        return;
    }

    let bid;

    try {
        bid = await items.getBidForItem(itemId, bidId);
    } catch (e) {
        req.flash('message', 'Something went wrong getting the bid!');
        res.redirect('/');
        return;
    }

    try {
        await items.acceptBid(itemId, bidId);
    } catch (e) {
        req.flash('message', 'Something went wrong accepting the bid!');
        res.redirect('/');
        return;
    }

    res.render('items/accepted_bid', {
        title: 'Woo, you accepted a bid for ' + item.title,
        id: item._id,
        acceptedUsername: bid.username,
        acceptedEmail: bid.email,
        acceptedPrice: bid.price,
        userGettingRatedId: bid.bidOwner,
        userGivingRatingId: currentUser._id,
    });
});

module.exports = router;
