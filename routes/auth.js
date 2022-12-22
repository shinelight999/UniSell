const express = require('express');
const router = express.Router();
const data = require('../data/index');
const users = data.users;
const universities = data.universities;
const userValidation = require('../data/validations/userValidations');
const xss = require('xss');

router.get('/login', async (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    const universitiesList = await universities.getAll();

    res.render('auth/login', {
      title: 'Login',
      universitiesList: universitiesList,
      flash: req.flash('message')
    });
});

router.post('/login', async (req, res) => {
    let body = req.body;

    const universitiesList = await universities.getAll();

    if (!body) {
        req.flash('message', 'You must provide a body to your request');
        res.redirect('/auth/login');
        return;
    }

    let { universityId, username, password } = body;
    universityId = xss(universityId);
    username = xss(username);
    password = xss(password);

    if (!universityId || !username || !password) {
        res.status(400).render('auth/login', {
            title: 'Login',
            error_status_code: 'HTTP 400 status code',
            error_messages: 'You must select a university + provide both the username and password!',
            universitiesList: universitiesList,
            universityId: universityId,
            username: username
        });
        return;
    }

    try {
        userValidation.isValidCheckUserParameters(universityId, username, password);
    } catch (e) {
        res.status(400).render('auth/login', {
            title: 'Login',
            error_status_code: 'HTTP 400 status code',
            error_messages: 'Invalid username or password!',
            universitiesList: universitiesList,
            universityId: universityId,
            username: username
        });
        return;
    }

    try {
        const response = await users.checkUser(universityId, username, password);

        if (response === null || response.authenticated !== true) {
            return res.status(500).render('auth/login', {
                title: 'Login',
                error_status_code: 'HTTP 500 status code',
                error_messages: 'Internal Server Error',
                universitiesList: universitiesList,
                universityId: universityId,
                username: username
            });
        }

        if (response.authenticated === true) {
            req.session.user = { username: username };

            res.redirect('/');
        }
    } catch (e) {
        return res.status(400).render('auth/login', {
            title: 'Login',
            error_status_code: 'HTTP 400 status code',
            error_messages: 'Invalid username or password!',
            universitiesList: universitiesList,
            universityId: universityId,
            username: username
        });
    }
})

router.get('/signup', async (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    const universitiesList = await universities.getAll();

    res.render('auth/signup', { title: 'Sign Up', universitiesList: universitiesList });
})

router.post('/signup', async (req, res) => {
    let body = req.body;

    const universitiesList = await universities.getAll();

    if (!body) {
        res.status(400).render('auth/signup', {
            title: 'Sign Up',
            error_status_code: 'HTTP 400 status code',
            error_messages: 'You must provide a body to your request',
            universitiesList: universitiesList
        });
        return;
    }

    let {
        universityId,
        username,
        password,
        password_confirmation,
        name,
        email,
        imageURL,
        bio
    } = body;

    universityId = xss(universityId);
    username = xss(username);
    password = xss(password);
    password_confirmation = xss(password_confirmation);
    name = xss(name);
    email = xss(email);
    imageURL = xss(imageURL);
    bio = xss(bio);
    
    if (!universityId || !username || !password || !password_confirmation || !name || !email || !imageURL || !bio) {
        res.status(400).render('auth/signup', {
            title: 'Sign Up',
            error_status_code: 'HTTP 400 status code',
            error_messages: 'You must provide all the form elements',
            universitiesList: universitiesList,
            universityId: universityId,
            username: username,
            name: name,
            email: email,
            bio: bio
        });
        return;
    }

    try {
        userValidation.isValidUserParameters(universityId, username, password, password_confirmation, name, email, imageURL, bio);
    } catch (e) {
        return res.status(400).render('auth/signup', {
            title: 'Sign Up',
            error_status_code: 'HTTP 400 status code',
            error_messages: e,
            universitiesList: universitiesList,
            universityId: universityId,
            username: username,
            name: name,
            email: email,
            bio: bio
        });
    }

    try {
        const response = await users.createUser(universityId, username, password, password_confirmation, name, email, imageURL, bio);

        if (response === null || response.userInserted === false) {
            return res.status(500).render('auth/signup', {
                title: 'Sign Up',
                error_status_code: 'HTTP 500 status code',
                error_messages: 'Internal Server Error: ' + e,
                universitiesList: universitiesList,
                universityId: universityId,
                username: username,
                name: name,
                email: email,
                bio: bio
            });
        }

        if (response.userInserted === true) {
            req.flash('message', 'Account created. Please login');
            res.redirect('/auth/login');
            return;
        }
    } catch (e) {
        return res.status(400).render('auth/signup', {
            title: 'Sign Up',
            error_status_code: 'HTTP 400 status code',
            error_messages: e,
            universitiesList: universitiesList,
            universityId: universityId,
            username: username,
            name: name,
            email: email,
            bio: bio
        });
    }
})

router.get('/logout', async (req, res) => {
    if (req.session.user) {
        req.session.destroy();
        res.locals.user = false;
        res.locals.superAdmin = false;

        res.render('auth/loggedout', { title: 'Logged out' });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
