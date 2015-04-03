var bingo = angular.module('bingo', ['ngRoute']);

bingo.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl : '../pages/home.html',
        })
        .when('/new/cardset', {
        	templateUrl : '../pages/addCardSet.html',
        	controller : 'addCardSetController'
        });
});

wikiParty.controller('addCardSetController', function($scope, $http) {
	$scope.formData = {};
	$scope.msg = "";

	// Submit new page 
	$scope.addCardSet = function () {
		$http.post('/api/new/cardset', $scope.formData)
			.success(function(data){
				$scope.formData = {};
				$scope.msg = "Congratulations! You have successfully added your card set!";
			})
			.error(function(data) {
			console.log("Error: " + data);
		});
	};

});

