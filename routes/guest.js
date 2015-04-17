var express = require('express');
var mongoose = require('mongoose');
var models = require('../models/models.js')

var User = models.user;

var route = {};

route.login = function(req, res) {
  req.session.user = req.body.user;

  var new_user = new User;

  new_user.save(function(err, users) {
    if (err) {
      console.error('Cant add a guest', err);
      res.status(500).send("Couldn't add new guest to db");
    }
  });

  res.send(req.session.user);
}

route.logout = function(req, res) {
  //still need implementation
  req.session.user = null;
  res.redirect('/');
}

module.exports = route;
