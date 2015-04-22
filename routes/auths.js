var express = require('express');
var request = require('request');
var mongoose = require('mongoose');
var models = require('../models/models');
var tools = require('../utils/utils');

var router = express.Router();
var User = models.user;
// inspired by https://github.com/EvanDorsky/riot-woko/blob/master/routes/olinauth.js

router.get('/login', function(req, res) {
  res.sendfile('./views/login.html');
});

router.get('/login/olin', function(req, res) {
  res.redirect('http://www.olinapps.com/external?callback=' + 'http://localhost:3000/auth/login/olin/cb');
});

router.get('/logout', function(req, res) {
  req.session.user = null;
  res.redirect('/');
});

router.post('/login/olin/cb', function(req, res) {
  req.session.user = {};
  request('http://www.olinapps.com/api/me?sessionid=' + req.body.sessionid, function(err, response, body) {
    body = JSON.parse(body);
    var userid = body.user.id;
    var username = tools.capitalizeName(userid.replace(".", " "));
    var olinsesid = req.body.sessionid; //olinapps session id
    User.findOrCreate({
      name: username,
      guest: false
    }, {}, {}, function(err, data) {
      if (err) {
        console.log('authentication error');
        req.session.user = null; // Auth has gone wrong, clear user.
        res.redirect('/login'); // Back to the login poge.
      } else {
        req.session.user.sessionid = olinsesid;
        req.session.user.name = userid.replace(".", " ");
        req.session.user.guest = false;
      }
    });
    res.redirect('/');
  });
});

module.exports = router;

module.exports.isAuth_pg = function(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/auth/login'); // If not authenticated, redirect to /login.
    // This could potentially be /home, if we want one.
  }
};

module.exports.isAuth_api = function(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.json(null); // send blank JSON (or add your behavior here)
  }
};
