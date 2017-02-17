const jwt = require('jsonwebtoken');
const { renderWidgetTemplates, getWidgets } = require('../widgets');

function renderDashboard(req, res) {
  // Expires in a year (temp)
  const token = jwt.sign(req.user, 'interfacesecret', { expiresIn: '5h' });

  res.render('dashboard', {
    token,
    layout: false,
    widgetTemplates: renderWidgetTemplates(),
    widgetList: JSON.stringify(getWidgets())
  });
}

function renderLogin(req, res) {
  res.render('login');
}

function renderHalbert(req, res) {
  res.render('halbert', { layout: false });
}

function renderHomescreen(req, res) {
  res.render('homescreen', { layout: false });
}

module.exports = {
  renderDashboard,
  renderLogin,
  renderHalbert,
  renderHomescreen
};
