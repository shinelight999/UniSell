const adminRoutes = require('./admin');
const authRoutes = require('./auth');
const itemsRoutes = require('./items');
const profileRoutes = require('./profile');
const searchRoutes = require('./search');
const rateRoutes = require('./rate');
const data = require('../data/index');
const users = data.users;
const universities = data.universities;
const items = data.items;

const constructorMethod = (app) => {

  app.get('/', async (req, res) => {

    let title = 'Welcome to Unisell';
    let universityName;
    let itemsList;
    let universityList = [];
    let imageUrl = '';
    let acceptedBids;

    try {
      if (req.session.user) {
        title += ', ' + req.session.user.username;

        let user = await users.getUser(req.session.user.username);
        let university = await universities.getUniversityById(user.universityId.toString());
        universityName = university.name;
        itemsList = await items.getAllByUniversityId(user.universityId.toString());
        acceptedBids = await users.hasAcceptedBids(user._id);
      }
      else {
        let universityCollection = await universities.getAll();
        universityCollection.forEach(university => universityList.push(university.name));
      }

      res.render('index', {
        title: title,
        user: req.session.user,
        universityName: universityName,
        universityList: universityList,
        itemsList: itemsList,
        imageUrl: imageUrl,
        acceptedBids: acceptedBids,
        flash: req.flash('message')
      });
    } catch (e) {
      res.status(500).render('errors/500', {
        title: '500',
        message: 'Internal server error'
      });
    }
  });

  app.use('/admin', adminRoutes);
  app.use('/auth', authRoutes);
  app.use('/items', itemsRoutes);
  app.use('/profile', profileRoutes);
  app.use('/search', searchRoutes);
  app.use('/rate', rateRoutes);

  app.use('*', (req, res) => {
    res.status(404).render('errors/404', {
      title: '404',
      message: 'Not found'
    });
  });
};

module.exports = constructorMethod;
