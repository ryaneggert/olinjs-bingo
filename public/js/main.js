var bingo = angular.module('bingo', ['ngRoute', 'ngTouch', 'btford.socket-io', 'ngMaterial', 'ngMessages'])
  .factory('bingosockets', function(socketFactory) {
    var myIoSocket = io.connect();
    var scks = socketFactory({
      ioSocket: myIoSocket
    });
    scks.forward('test'); // makes all 'test' socket events avaliable as
    //$scope.$on('socket:test', function(ev,data) {...};)
    scks.forward('joinroom');
    scks.forward('gamestart');
    scks.forward('moveconf');
    scks.forward('leaveroom');
    scks.forward('winner'); // forward win event
    scks.forward('gameclose');
    return scks;
  })
  .factory('focus', function($timeout) {
    return function(id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
        var element = document.getElementById(id);
        if (element)
          element.focus();
      });
    };
  })
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('purple', {
        'default': '800',
      })
      .accentPalette('green', {
        'default': '800',
      })
      .warnPalette('red', {
        'default': '600'
      });
  });

bingo.directive('bsquare', function() {
  return function(scope, element, attrs) {
    /*element.height($('div.bingosquare').width());*/
  };
});

bingo.directive('eventFocus', function(focus) {
  return function(scope, elem, attr) {
    elem.on(attr.eventFocus, function() {
      focus(attr.eventFocusId);
    });

    // Removes bound events in the element itself
    // when the scope is destroyed
    scope.$on('$destroy', function() {
      elem.off(attr.eventFocus);
    });
  };
});

bingo.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '../pages/home.html',
      controller: 'homeController'
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
    .when('/game/:gameid', {
      templateUrl: '../pages/bingocard.html',
      controller: 'bingoController'
    })
    .when('/cardset/edit', {
      templateUrl: '../pages/cardseteditor.html',
      controller: 'editCardSetController'
    });
});

bingo.controller('addCardSetController', function($scope, $http, $location, $mdDialog, bingosockets, focus) {
  $scope.formData = {};
  $scope.formData.CardSetName = "";
  $scope.choices = [];

  $scope.addNewChoice = function(refocus) {
    var newItemNo = $scope.choices.length + 1;
    $scope.choices.push({
      'id': 'choice' + newItemNo
    });
    if (refocus) {
      focus('sqin_' + newItemNo);
    }
  };

  generatenewchoices = function(blanks) {
    for (var i = 0; i <= blanks; i++) {
      $scope.addNewChoice();
    }
  };
  generatenewchoices(25);

  $scope.showAddChoice = function(choice) {
    return choice.id === $scope.choices[$scope.choices.length - 1].id;
  };

  $scope.addCardSet = function() {
    cards = [];
    var dupenames = [];
    // quadratic performance, ok for small cardset, optimize if necessary
    for (var i in $scope.choices) {
      if (cards.indexOf($scope.choices[i].name) === -1) {
        if ($scope.choices[i].name != null) {
          cards.push($scope.choices[i].name);
        }
      } else {
        dupenames.push($scope.choices[i].name);
      }
    }
    if ($scope.formData.CardSetName == "") {
      confirm("Please add a card set name.");
    } else if (cards.length < 25) {
      confirm("There are not at least 25 unique squares.");
    } else {
      postdata = {
        "name": $scope.formData.CardSetName,
        "cards": cards
      };
      $http.post('/api/new/cardset', postdata)
        .success(function(data) {
          // clear form? redirect?
          $mdDialog.show(
              $mdDialog.alert()
              .title('New Card Set')
              .content('You\'ve successfully added a new card set!')
              .ariaLabel('New card set confirmation')
              .ok('Home Page')
            )
            .finally(function() {
              $location.path('/');
            });
        })
        .error(function(data) {
          console.log("Error: " + data);
        });
    }
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

    if (!$scope.formData.room || !$scope.formData.card_set_id) {
      confirm("Not enough information to create a new game.");
      return;
    }

    $http.post('/api/new/game', $scope.formData)
      .success(function(data) {
        $scope.formData = {};
        $location.path('/game/' + data._id);
      })
      .error(function(data) {
        console.log("Error: " + data);
      });
  };
});

bingo.controller('homeController', function($scope, $http, $location, bingosockets) {
  $scope.currentgames = []; // variable to hold list of current bingo games
  $http.get('/api/home')
    .success(function(data) {
      console.log(data);
      $scope.currentgames = data.games;
      $scope.cardsets = data.cardsets;
      $scope.currentUser = data.currUser;
    })
    .error(function(data) {
      console.log("Error: " + data);
    });

  $scope.$on('socket:test', function(ev, data) {
    console.log('Test Recieved');
    bingosockets.emit('response', 'this is a response');
  });

  $scope.new_game = function() {
    if ($scope.currentUser.guest) {
      confirm("Only registered user can create a new game");
      return;
    }

    $location.path('/new/game');
  };

  $scope.new_card_set = function() {
    if ($scope.currentUser.guest) {
      confirm("Only registered user can create a new card set");
      return;
    }

    $location.path('/new/cardset');
  };

  // TODO: redirect to game screen after user successfully joins game
  $scope.joinGame = function(bgameid) {
    console.log('bgameid =', bgameid);
    $http.post('/api/join/game', {
        game_id: bgameid
      })
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
  $scope.editCardSet = function(cardsetid) {
    //$location.path('/cardset/edit') //Make API more "RESTful" (e.g. /<object>/<action>)
    $http.post('/api/edit/cardset', {
      cardsetid: cardsetid
    })
    .success(function(data) {
      if (!data.restrict) {
        $location.path('/cardset/edit');
      } else {
        confirm("Sorry, you don't have permisson to edit that cardset");
      }
    })
    .error(function(data) {
      console.log("Error: " + data);
    });
  };

  $scope.deleteCardSet = function(cardsetid) {
    //$http.post(...)
    console.log('Go write a "delete card set" controller');
  };
});

bingo.controller('bingoController', function($scope, $document, $http, $location, $routeParams, $mdDialog, $mdToast, $animate, bingosockets) {

  // Make sure that we warn the user before they leave the gameroom
  $scope.$on('$locationChangeStart', function(event, next, current) {
    if ($scope.gameopen) {
      var answer = confirm('Are you sure you want to leave the game room?');
      if (!answer) {
        event.preventDefault();
      } else {
        bingosockets.emit('leave', {
          game: $routeParams.gameid
        });
      }
    }
  });

  $scope.showSimpleToast = function(msg) {
    $mdToast.show(
      $mdToast.simple()
      .content(msg)
      .position('bottom right')
      .hideDelay(3000)
    );
  };

  //Initialize room information
  var initializegame = function() {
    // POST to server to join room, get card/game info
    $http.post('/api/game/initialize', {
        gameid: $routeParams.gameid
      })
      .success(function(data) {
        console.log(data);
        $scope.gamecard = data.card.squares;
        $scope.cardid = data.card._id;
        $scope.displayNumber = 1;
        $scope.gamescore = data.card.score;
        $scope.gameopen = data.game.isOpen;
        $scope.winners = data.game.winners;

        var startTime = data.game.start_time;
        //Convert to datetime object
        var d = new Date(startTime);
        console.log(d);
        var d_ms = d.getTime();

        var currTime = new Date();
        var currTime_ms = currTime.getTime();

        // The number of milliseconds
        var diff_ms = d_ms - currTime_ms;
        $scope.countdown = diff_ms;

        $scope.roomname = data.game.room;
        $scope.currentUser = data.user;
        $scope.host = data.game.host;
        $scope.host_name = data.game.host.name;

        $scope.players = []; // This value is populated using sockets.

        $scope.ishost = $scope.currentUser._id == $scope.host._id;

        $scope.showstartbutton = !data.game.isOpen && $scope.ishost;
        $scope.showstopbutton = $scope.winners.length > 0 && $scope.ishost;

        bingosockets.emit('game', {
          'type': 'join',
          'data': {
            'game': data.game._id,
            'user': data.user,
          }
        });

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


  //Start button
  $scope.start_func = function(event) {
    bingosockets.emit('game', {
      'type': 'start',
      'data': {
        'game': $routeParams.gameid,
      }
    });
  };

  //End button
  $scope.endgame = function(event) {
    console.log('END', $routeParams.gameid);
    bingosockets.emit('game', {
      'type': 'end',
      'data': {
        'game': $routeParams.gameid,
      }
    });
  };

  $scope.$on('socket:gamestart', function(ev, data) {
    $scope.showstartbutton = false;
    $scope.gameopen = true;
    $scope.showSimpleToast('The game has started!');
  });

  $scope.$on('socket:joinroom', function(ev, data) {
    $scope.players = data.players;
  });

  $scope.$on('socket:moveconf', function(ev, data) {
    $scope.gamescore = data.newscore;
  });

  $scope.$on('socket:leaveroom', function(ev, data) {
    $scope.players = data.players;
  });

  $scope.$on('socket:winner', function(ev, data) {
    // $scope.bingo_popup = true;
    $scope.winners = data.winnerlist;
    $scope.showstopbutton = $scope.winners.length > 0 && $scope.ishost;
    if (data.winner) {
      $scope.showSimpleToast('WIN! ' + data.winner.name + ' has won.');
    }
  });

  $scope.$on('socket:gameclose', function(ev, data) {
    $mdDialog.show(
        $mdDialog.alert()
        .title('Game Over')
        .content('The host has ended this game. Thanks for playing!')
        .ariaLabel('Game over')
        .ok('Home Page')
        .targetEvent(ev)
      )
      .finally(function() {
        $scope.gameopen = false;
        $location.path('/');
      });
  });
  // var toggleselect = $('div')
  $scope.sqclick = function(event) {
    if (!$scope.gameopen) {
      $scope.showSimpleToast('The game has not started yet. Please wait.');
      return;
    }

    coords = event.target.id.split(/,|\[|\]/).slice(1, 3);

    bingosockets.emit('game', {
      'type': 'move',
      'data': {
        'card_id': $scope.cardid,
        'square': coords,
        'selected': $scope.gamescore[coords[0]][coords[1]],
        'gameid': $routeParams.gameid,
      }
    });
  };

  $scope.winnertext = "Bingo!";

});

// Saving dialog code for later.
// $mdDialog.show({
//         controller: WinDialogController,
//         templateUrl: './pages/templates/windialog.tmpl.html',
//         locals: {
//           winner: data.winner.name
//         }
//       })
//       .then(function(answer) {
//         // This function is called after the user presses a button in the dialog
//         $location.path('/');
//       }, function() {
//         // This function is called if the user presses 'ESCAPE' or clicks
//         // outside of the dialog
//       });

// function WinDialogController($scope, $mdDialog, winner) {
//   $scope.winner = winner;
//   $scope.win_interact = function(answer) {
//     $mdDialog.hide(answer);
//   };
// }
