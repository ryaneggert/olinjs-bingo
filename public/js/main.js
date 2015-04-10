var bingo = angular.module('bingo', ['ngRoute', 'btford.socket-io'])
  .factory('bingosockets', function(socketFactory) {
    var myIoSocket = io.connect('http://localhost:3000');
    var scks = socketFactory({
      ioSocket: myIoSocket
    });
    scks.forward('test'); // makes all 'test' socket events avaliable as
                    //$scope.$on('socket:test', function(ev,data) {...};)
    return scks;
  });

bingo.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '../pages/home.html',
      controller: 'homeController'
    })
    .when('/login', {
      templateUrl: '../pages/login.html',
    })
    .when('/guest_login', {
      templateUrl: '../pages/guest.html',
      controller: 'guest_form'
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

bingo.controller('guest_form', function($scope, $http) {
  $scope.formData = {};
  $scope.msg = "";

  $scope.submit = function() {
    if ($scope.guest_name) {
      $scope.formData.user = $scope.guest_name;
      $http.post('/guest', $scope.formData)
        .success(function(data) {
          console.log('lalala');
        })
        .error(function(data) {
          console.log("Error: " + data);
        });
    }
  }

bingo.controller('homeController', function($scope, $http, bingosockets) {
  $scope.$on('socket:test', function(ev, data) {
    console.log('Test Recieved');
    bingosockets.emit('response', 'this is a response');
  });
});
