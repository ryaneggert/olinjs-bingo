var bingo = angular.module('bingo', ['ngRoute', 'btford.socket-io'])
  .factory('bingosockets', function(socketFactory) {
    var myIoSocket = io.connect('http://localhost:3000');
    var scks = socketFactory({
      ioSocket: myIoSocket
    });
    scks.forward('test'); // makes all 'test' socket events avaliable as
    //$scope.$on('socket:test', function(ev,data) {...};)
    scks.forward('card');
    scks.forward('winner'); // forward win event
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
    // .when('/login', {
    //   templateUrl: '../pages/login.html',
    // })
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
    .when('/game/:gameid', {
      templateUrl: '../pages/bingocard.html',
      controller: 'bingoController'
    })
    .when('/gameroom', {
      templateUrl: '../pages/gameroom.html',
      controller: 'gameroomController'
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

bingo.controller('guest_form', function($scope, $http, $location) {
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
});

bingo.controller('gameroomController', function($scope, $http, $location) {
  $scope.formData = {};
  $scope.msg = "";

  $scope.formData.host = $location.search().host;
  $scope.formData.roomname = $location.search().roomname;

  $scope.host_name = $scope.formData.host.name;
  $scope.roomname = $scope.formData.roomname;

});

bingo.controller('addGameController', function($scope, $http, $location) {
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
    $scope.formData.host = angular.element('#username').scope().display_username;
    $http.post('/api/new/game', $scope.formData)
      .success(function(data) {
        $scope.formData = {};
        $location.path('/gameroom').search({
          host: data.host,
          roomname: data.room
        });
      })
      .error(function(data) {
        console.log("Error: " + data);
      });
  };
});

bingo.controller('homeController', function($scope, $http, $location, bingosockets) {
  $scope.formText = "";
  $scope.isNotLoggedIn = false;

  $http.get('/api/home')
    .success(function(data) {
      console.log(data);
      if (data === "Must be logged in!") {
        $scope.isNotLoggedIn = true;
      } else {
        $scope.formText = data;
      }
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
        console.log('joined the following game');
        console.log(data);
        $scope.formData = {};
        $location.path('/game/' + data._id);
      })
      .error(function(data) {
        console.log("Error: " + data);
      });
  };

});

bingo.controller('bingoController', function($scope, $document, $http, $routeParams, bingosockets) {
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

  var initializegame = function() {
    // Socket to server to join room, get card/game info
    $http.post('/api/game/initialize', {
        gameid: $routeParams.gameid
      })
      .success(function(data) {
        $scope.gamecard = data.card.squares;
        $scope.cardid = data.card._id;
        // NOTE: You will recieve a ng-repeat DUPES error if your bingo card
        // has repeated squares. There is a way to prevent this error, but I
        // have left this behavior in place because we do not want to serve
        // bingo cards with repetition. We must validate card sets

        // To-do: ng-class to conditionally apply highlight class based on
        // boolean array in data.card.score.
      })
      .error(function(data, status, headers, config) {
        console.log("Error: " + status);
      });
  };
  initializegame();
  //TODO: add winner detection on backend, so as to prompt sending of winner message
  //TODO: send and show winning bingo card?
  $scope.$on('socket:winner', function(ev, data) {
    if (!hasBingo($scope.gamescore)) {
      $scope.winnertext = data.username + " has gotten a bingo!";
      $scope.bingo_popup = true;
      console.log('Winner!');
    }
  });

  // var toggleselect = $('div')
  $scope.sqclick = function(event) {
    console.log(event.target.id);
    console.log(typeof(event.target.id));
    coords = event.target.id.split(/,|\[|\]/).slice(1, 3);
    for (var i = 0; i < coords.length; i++) {
      coords[i] = parseInt(coords[i], 10);
    }
    console.log($scope.gamescore[coords[0]][coords[1]]);
    $scope.gamescore[coords[0]][coords[1]] = !$scope.gamescore[coords[0]][coords[1]];
    if ($scope.gamescore[coords[0]][coords[1]]) {
      event.target.className += " squaretoggle";
    } else {
      event.target.className = event.target.className.replace(" squaretoggle", "");
    }

    if (hasBingo($scope.gamescore)) {
      $scope.winnertext = "You have a bingo!";
      $scope.bingo_popup = true;
    } else { // Remove bingo win condition if card no longer has bingo
      // $scope.winnertext = null;
      $scope.bingo_popup = false;
    }

    bingosockets.emit('game', {
      'type': 'move',
      'data': {
        'card_id': $scope.cardid,
        'square': coords,
        'selected': $scope.gamescore[coords[0]][coords[1]],
      }
    });
  };

  $scope.winnertext = "Bingo!";

  $scope.gamescore = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false]
  ]; // will connect to db soon.

  $(window).resize(function() {
    resizecard();
  });

  //Helper functions for bingo

  function hasBingo(arr) {
    return (check_rows(arr) ||
      check_cols(arr) ||
      check_diag_forw(arr) ||
      check_diag_back(arr));
  }

  function all_true(arr) {
    for (var elem in arr) {
      if (arr[elem] === false) {
        return false;
      }
    }
    return true;
  }

  function check_rows(arr) {
    for (var row in arr) {
      if (all_true(arr[row])) {
        return true;
      }
    }
    return false;
  }

  function check_cols(arr) {
    for (var i in arr) {
      var col = [];
      for (var j in arr) {
        col.push(arr[j][i]);
      }
      if (all_true(col)) {
        return true;
      }
    }
    return false;
  }

  function check_diag_forw(arr) {
    var diag = [];
    for (var i in arr) {
      diag.push(arr[i][i]);
    }
    return all_true(diag);
  }

  function check_diag_back(arr) {
    var diag = [];
    for (var i in arr) {
      diag.push(arr[i][arr.length - i - 1]);
    }
    return all_true(diag);
  }

  // $scope.$on('socket:test', function(ev, data) {
  //   console.log('Test Recieved');
  //   bingosockets.emit('response', 'this is a response');
  // });
});
