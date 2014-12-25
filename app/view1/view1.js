'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$http', function($scope, $http) {
	$scope.pickCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50 ];
	$scope.currentCount = $scope.pickCounts[0];
	$scope.viewName = "view 1";

	$scope.pickCount = function(count) {
		// console.log('pickCount: ', count);
		$scope.currentCount = count;
	}

	$scope.pickTickets = function() {
		console.log('picking tickets: ', $scope.currentCount);

		$http.get("https://www.fourmilab.ch/cgi-bin/Hotbits?nbytes=16&fmt=xml&npass=1&lpass=8&pwtype=3").
			success(function(data, status, headers, config) {
				console.log('$http.success: ', data, status, headers, config);
				// this callback will be called asynchronously
				// when the response is available
				}).
			error(function(data, status, headers, config) {
				console.log('$http.error: ', data, status, headers, config);
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
	}
}]);