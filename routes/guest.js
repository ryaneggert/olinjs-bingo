var express = require('express');
var mongoose = require('mongoose');
var models = require('../models/models.js')

var User = models.user;

var route = {};

route.login = function(req, res) {
  req.session.user = req.body.user;

  newCardSet.save(function(err, cardset) {
    if (err) {
      console.error('Cant add a guest', err);
      res.status(500).send("Couldn't add new guest to db");
    }
  });
  res.redirect('/');
}

route.logout = function(req, res) {
  req.session.user = null;
  res.redirect('/');
}

module.exports = route;
