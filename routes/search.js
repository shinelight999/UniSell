const express = require('express');
const router = express.Router();
const data = require('../data/index');
const items = data.items;
const users = data.users;
const sharedValidation = require('../data/validations/sharedValidations');
const xss = require('xss');

router.post('/', async (req, res) => {
    let body = req.body;

    if (!body) {
        req.flash('message', 'You must provide a body to your request');
        res.redirect('/');
        return;
    }

    let { search_term } = body;
    search_term = xss(search_term);

    if (!search_term) {
        req.flash('message', 'You must provide all fields');
        res.redirect('/');
        return;
    }

    let id;
    let user = await users.getUser(req.session.user.username);

    try {
        id = sharedValidation.isValidUniversityId(user.universityId.toString());
        sharedValidation.checkIsString(search_term);
        search_term = sharedValidation.cleanUpString(search_term);
        sharedValidation.checkStringLength(search_term, 'search_term');
    } catch (e) {
        req.flash('message', e);
        res.redirect('/');
        return;
    }

    try {
        let response = await items.getAllByUniversityIdAndKeyword(id, search_term);

        if (response === null) {
            req.flash('message', 'Internal Server Error');
            res.redirect('/');
            return;
        }

        res.render('search/index', {
            title: 'Search Results for ' + search_term,
            itemsList: response,
            searchTerm: search_term
        });
    } catch (e) {
        req.flash('message', 'Internal Server Error');
        res.redirect('/');
    }
});

module.exports = router;
