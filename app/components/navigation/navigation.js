// navigation.js

'use strict';

angular.module('myApp.navigation', [])
.controller('NavigationCtrl', ['$scope', '$location',
	function($scope, $location) {
		$scope.hello = "NavigationCtrl was here";
		$scope.navigation = [
			{
				pattern: '/view1',
				route: '#/view1',
				description: 'View 1',
				active: "", // set automatically in the event handler
				srClass: "", // ~
				srText: "", // ~
			},
			{
				pattern: '/view2',
				route: '#/view2',
				description: 'View 2',
				active: "",
				srClass: "", // ~
				srText: "" // ~
			}
		];

		$scope.$on('$locationChangeStart', function(event, next, current) {
			// console.log('locationChangeStart: ', event, next, current);

			var path = $location.path(), routeIndex = -1;
			$scope.navigation.forEach(function(value, index, ar) {
				// console.log('iterating: ', value, index, ar);
				if (path.indexOf(value.pattern) >= 0) {
					value.active = "active";
					value.srClass = "sr-only";
					value.srText = "(current)";
				}
				else {
					value.active = "";
					value.srClass = "";
					value.srText = "";
				}
			});

		});
	}]);
