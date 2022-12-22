const express = require('express');
const router = express.Router();
const data = require('../data/index');
const users = data.users;
const sharedValidation = require('../data/validations/sharedValidations');
const xss = require('xss');

router.post('/:raterId/:ratingId', async (req, res) => {
    let params = req.params;

    if (!params) {
        req.flash('message', 'No params provided!');
        res.redirect('/');
        return;
    }

    let raterId = params.raterId;
    raterId = xss(raterId);

    if (!raterId) {
        req.flash('message', 'No raterId param provided!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidUserId(raterId);
    } catch (e) {
        req.flash('message', 'Bad raterId ID!');
        res.redirect('/');
        return;
    }

    let ratingId = params.ratingId;
    ratingId = xss(ratingId);

    if (!ratingId) {
        req.flash('message', 'No ratingId param provided!');
        res.redirect('/');
        return;
    }

    try {
        sharedValidation.isValidUserId(ratingId);
    } catch (e) {
        req.flash('message', 'Bad ratingId ID!');
        res.redirect('/');
        return;
    }

    let body = req.body;

    if (!body) {
        req.flash('message', 'You must provide a body to your request');
        res.redirect('/');
        return;
    }

    let { rating } = body;
    rating = xss(rating);

    if (!rating) {
      req.flash('message', 'You must provide a rating with your request');
      res.redirect('/');
      return;
    }

    try {
        sharedValidation.isValidRating(rating);
    } catch (e) {
        req.flash('message', 'Invalid rating!');
        res.redirect('/');
        return;
    }

    try {
        let response = await users.createRating(raterId, ratingId, rating)

        if (response === null || response !== true) {
          req.flash('message', 'Could not create rating!');
          res.redirect('/');
          return;
        }

        res.redirect('/');
    } catch (e) {
      req.flash('message', 'Could not create rating!');
      res.redirect('/');
      return;
    }
});

module.exports = router;