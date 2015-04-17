var bingo = angular.module('bingo', ['ngRoute', 'btford.socket-io', 'ngCookies'])
  .factory('bingosockets', function(socketFactory) {
    var myIoSocket = io.connect('http://localhost:3000');
    var scks = socketFactory({
      ioSocket: myIoSocket
    });
    scks.forward('test'); // makes all 'test' socket events avaliable as
    //$scope.$on('socket:test', function(ev,data) {...};)
    return scks;
  });

bingo.directive('bsquare', function() {
  return function(scope, element, attrs) {
    element.height($('div.bingosquare').width());
  };
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
    })
    .when('/new/game', {
      templateUrl: '../pages/newGame.html',
      controller: 'addGameController'
    })
    .when('/game', {
      templateUrl: '../pages/bingocard.html',
      controller: 'bingoController'
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

bingo.controller('guest_form', ['$scope', '$http', '$location', function($scope, $http, $location) {
  $scope.formData = {};
  $scope.formData.user = {};
  $scope.msg = "";

  $scope.submit = function() {
    if ($scope.guest_name) {
      $scope.formData.user.name = $scope.guest_name;
      $http.post('/guest', $scope.formData)
        .success(function(data) {
          angular.element('#username').scope().display_username = data.name;
          $location.path('/');
        })
        .error(function(data) {
          console.log("Error: " + data);
        });
    }
  };
}]);

bingo.controller('addGameController', function($scope, $http) {
  $scope.formData = {};
  $scope.formData.card_set = "default";
  $scope.msg = "";
  $scope.formText = {};

  $http.get('/api/user/cardsets')
    .success(function(data) {
      $scope.formText = data;
    })
    .error(function(data) {
      console.log("Error: " + data);
    });

  $scope.addGame = function() {
    console.log($scope.formData);
    $http.post('/api/new/game', $scope.formData)
      .success(function(data) {
        $scope.formData = {};
        $scope.msg = "Congratulations! You have successfully created a game!";
      })
      .error(function(data) {
        console.log("Error: " + data);
      });
  };
});

bingo.controller('homeController', function($scope, $http, bingosockets) {
  $scope.formText = "";

  $http.get('/api/home')
    .success(function(data) {
      console.log(data);
      $scope.formText = data;
    })
    .error(function(data) {
      console.log("Error: " + data);
    });

  $scope.$on('socket:test', function(ev, data) {
    console.log('Test Recieved');
    bingosockets.emit('response', 'this is a response');
  });

  $scope.formData = {};
  // TODO: redirect to game screen after user successfully joins game
  $scope.joinGame = function() {
    console.log($scope.formData);
    $http.post('/api/join/game', $scope.formData)
      .success(function(data) {
        console.log(data);
        $scope.formData = {};
      })
      .error(function(data) {
        console.log("Error: " + data);
      });
  };

});

bingo.controller('bingoController', function($scope, $document, $http, bingosockets) {
  // Responsive bingo card: keep squares square.
  var resizecard = function() {
    // I shouldn't have to use jQuery.
    // Future work: find how to modify directive to $scope.$apply() or something
    // like that.
    var sqwidth = $('div.bingosquare').width();
    $('div.bingorow').height(sqwidth);
    $('div.bingosquare').height(sqwidth);
    console.log('Cards have been resized');
  };

  // var toggleselect = $('div')

  $scope.sqclick = function(event) {
    console.log(event.target.id);
    bingosockets.emit('game', {
      'type': 'move',
      'data': {
        'square': event.target.id
      }
    });
  };

  $scope.gamecard = [
    [1, 2, 3, 4, 5],
    [1, 3, 2, 5, 4],
    [5, 4, 3, 2, 1],
    [1, 5, 2, 4, 3],
    [4, 3, 2, 5, 1]
  ];
  $(window).resize(function() {
    resizecard();
  });

  // $scope.$on('socket:test', function(ev, data) {
  //   console.log('Test Recieved');
  //   bingosockets.emit('response', 'this is a response');
  // });
});
