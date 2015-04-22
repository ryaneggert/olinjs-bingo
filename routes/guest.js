var express = require('express');
var mongoose = require('mongoose');
var models = require('../models/models');

var User = models.user;

var route = {};

route.login = function(req, res) {
  var new_user = new User({
    name: req.body.user.name
  });

  new_user.save(function(err, users) {
    if (err) {
      console.error('Cant add a guest', err);
      res.status(500).send("Couldn't add new guest to db");
    }
  });
  req.session.user = new_user;

  res.send(req.session.user);
};

route.logout = function(req, res) {
  //still need implementation
  req.session.user = null;
  res.redirect('/');
};

module.exports = route;
