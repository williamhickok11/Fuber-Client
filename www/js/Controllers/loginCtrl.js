"use strict";


app.controller('loginCtrl', function($scope, $http, $location, $ionicLoading, $ionicPlatform, authFactory, firebaseURL) {
  
  let ref = new Firebase(firebaseURL);

  $ionicPlatform.ready(function() {

  	$scope.account = {
  		email: "",
  		password: ""
  	};

		// Registers a new user and creates a new user_data object.
		$scope.register = function () {
			ref.createUser({
				// Set user with email and pw
				email: $scope.account.email,
				password: $scope.account.password
			}, function (error, userData) {
				if (error) {
					console.log(`Error creating user: ${error}`);
				} else {
					console.log(`Created user account with UID: ${userData.uid}`, userData);
					authFactory.storeUser(userData.uid, $scope.account.email);
					$scope.login();
				}
			});
		};

		// Authenticates and logs in a previously registered user.
		$scope.login = function () {
			authFactory.authenticate($scope.account)
				.then(function () {
					$location.path("/truck-main");
					$scope.$apply();
					// authFactory.getUser();
				})
		};
  // End ionicPlatform.ready()
  });

// End app.controller
});