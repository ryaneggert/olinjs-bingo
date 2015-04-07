var socket = io.connect('http://localhost:3000');

var bingo = angular.module('bingo', ['ngRoute', 'btford.socket-io'])
  .factory('bingosockets', function(socketFactory) {
    var myIoSocket = io.connect('http://localhost:3000');
    var scks = socketFactory({
      ioSocket: myIoSocket
    });
    scks.forward('error'); // makes all 'error' socket events avaliable as $scope.$on('socket:error', function(ev,data) {...};)
    return scks;
  });

bingo.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '../pages/home.html',
    })
    .when('/new/cardset', {
      templateUrl: '../pages/addCardSet.html',
      controller: 'addCardSetController'
    });
});

bingo.controller('addCardSetController', function($scope, $http, bingosockets) {
  $scope.formData = {};
  $scope.msg = "";

  // Submit new page
  $scope.addCardSet = function() {
    $http.post('/api/new/cardset', $scope.formData)
      .success(function(data) {
        $scope.formData = {};
        $scope.msg = "Congratulations! You have successfully added your card set!";
      })
      .error(function(data) {
        console.log("Error: " + data);
      });
  };
});
