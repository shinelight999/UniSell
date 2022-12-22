const express = require('express');
const router = express.Router();
const data = require('../data/index');
const users = data.users;
const userValidation = require('../data/validations/userValidations');
const xss = require('xss');

router.get('/edit', async (req, res) => {
    try {
        let user = await users.getUser(req.session.user.username);

        res.render('profile/edit', {
            title: 'Edit Profile',
            username: user.username,
            name: user.name,
            email: user.email,
            bio: user.bio,
            imageURL: user.profileImageUrl || '/public/images/blank.jpg',
            flash: req.flash('message')
        });
    } catch (e) {
        res.status(500).render('errors/500', {
            title: '500',
            message: 'Internal server error'
        });
    }
});

router.put('/edit', async (req, res) => {
    let body = req.body;

    if (!body) {
        req.flash('message', 'You must provide a body to your request');
        res.redirect('/profile/edit');
        return;
    }

    let { username, name, email, imageURL, bio } = body;
    username = xss(username);
    name = xss(name);
    email = xss(email);
    imageURL = xss(imageURL);
    bio = xss(bio);

    if (!username || !name || !email || !bio) {
        res.status(400).render('profile/edit', {
            title: 'Edit Profile',
            error_status_code: 'HTTP 400 status code',
            error_messages: 'You must provide all the fields',
            username: username,
            name: name,
            email: email,
            bio: bio
        });
        return;
    }

    try {
        userValidation.isValidUserUpdateParameters(req.session.user.username, username, name, email, bio);
    } catch (e) {
        res.status(400).render('profile/edit', {
            title: 'Edit Profile',
            error_status_code: 'HTTP 400 status code',
            error_messages: e,
            username: username,
            name: name,
            email: email,
            bio: bio
        });
        return;
    }

    try {
        let response = await users.updateUser(req.session.user.username, username, name, email, imageURL, bio);

        if (response === null || response.userUpdated !== true) {
            res.status(500).render('profile/edit', {
                title: 'Edit Profile',
                error_status_code: 'HTTP 500 status code',
                error_messages: 'Internal Server Error',
                username: username,
                name: name,
                email: email,
                bio: bio,
                imageURL: imageURL
            });
            return;
        }

        if (response.userUpdated === true) {
            // Update username since it could have changed
            req.session.user = { username: response.username };
        }

        res.redirect('/');
    } catch (e) {
        res.status(500).render('profile/edit', {
            title: 'Edit Profile',
            error_status_code: 'HTTP 500 status code',
            error_messages: e,
            username: username,
            name: name,
            email: email,
            bio: bio,
            imageURL: imageURL
        });
    }
});

router.put('/edit/password', async (req, res) => {
    let body = req.body;

    if (!body) {
        req.flash('message', 'You must provide a body to your request');
        res.redirect('/profile/edit');
        return;
    }

    let { current_password, new_password, new_password_confirmation } = body;
    current_password = xss(current_password);
    new_password = xss(new_password);
    new_password_confirmation = xss(new_password_confirmation);

    if (!current_password || !new_password || !new_password_confirmation) {
        req.flash('message', 'You must provide the current password + new password and confirmation');
        res.redirect('/profile/edit');
        return;
    }

    try {
        userValidation.validateUpdatePassword(req.session.user.username, current_password, new_password, new_password_confirmation);
    } catch (e) {
        req.flash('message', e);
        res.redirect('/profile/edit');
        return;
    }

    try {
        let response = await users.updatePassword(req.session.user.username, current_password, new_password, new_password_confirmation);

        if (response === null || response.passwordUpdated !== true) {
            req.flash('message', 'Internal Server Error');
            res.redirect('/profile/edit');
            return;
        }

        res.redirect('/');
    } catch (e) {
        req.flash('message', 'HTTP 500 status code');
        res.redirect('/profile/edit');
        return;
    }
});

module.exports = router;
