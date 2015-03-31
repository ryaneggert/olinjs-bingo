var bingo = angular.module('bingo', ['ngRoute']);

bingo.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl : '../pages/home.html',
        });

});

