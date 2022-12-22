const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const session = require('express-session');
const exphbs = require('express-handlebars');
const configRoutes = require('./routes');
const data = require('./data/index');
const users = data.users;
const flash = require('connect-flash');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'AuthCookie',
  secret: 'fb44e8e6-70b8-40b2-8a5e-bd54387831cc',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number')
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    }
  },
  partialsDir: ['views/partials/']
});

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

app.use('*', async (req, res, next) => {
  if (req.session.user) {
    res.locals.user = true;

    try {
      let user = await users.getUser(req.session.user.username);

      if (user.super_admin) {
        res.locals.superAdmin = true;
      }
      res.locals.headerImageUrl = user.profileImageUrl || '/public/images/blank.jpg'
    } catch (e) {
      next();
      return;
    }
  }

  next();
});

app.use(rewriteUnsupportedBrowserMethods);

app.use('/profile', async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.redirect('/');
  }
});

app.use('/items', async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.redirect('/');
  }
});

app.use('/search', async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.redirect('/');
  }
});

app.use('/rate', async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.redirect('/');
  }
});

app.use('/admin', async (req, res, next) => {
  if (req.session.user) {

    try {
      let user = await users.getUser(req.session.user.username);

      if (user.super_admin) {
        res.locals.inAdmin = true;

        next();
      } else {
        return res.status(403).render('errors/403', {
          title: '403',
          message: 'Admin permission required!'
        });
      }
    } catch (e) {
      next();
      return;
    }
  } else {
    return res.redirect('/');
  }
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
