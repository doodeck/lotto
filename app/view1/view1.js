'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$http', 'AWSService', function($scope, $http, AWSService) {
	$scope.pickCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50 ];
	$scope.currentCount = $scope.pickCounts[0];
	$scope.viewName = "view 1";

	AWSService.dynamoLambdaRandom().then(function(table) {
		console.log('describingTable using table: ', table);
		table.describeTable({TableName: 'LambdaRandom'}, function(err, data) { // TODO: Table name elsewhere
			if (err)
				console.error(err, err.stack); // an error occurred
			else {
				console.log(data);           // successful response
			}
		});
	});

	$scope.pickCount = function(count) {
		// console.log('pickCount: ', count);
		$scope.currentCount = count;
	}

	$scope.pickTickets = function() {
		console.log('picking tickets: ', $scope.currentCount);

		/* CORS of course
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
		*/

		var tickets = new Tickets($scope.currentCount /*numTickets*/, 6 /*numNumbers*/, 49 /*highestNumber, numExtras, highestExtra*/);

		console.log('howManyNeeded: ', tickets.howManyNeeded());
    console.log('moreNeeded: ', tickets.moreNeeded());
    console.log('Tickets before: ', tickets);

    var recursiveDbRefresh = function(arrayIds) {
      
    }

    var recursiveFeed = function(recursionParams) {
      AWSService.dynamoLambdaRandom().then(function(table) {
        var params = {
          TableName: 'LambdaRandom',  // TODO: Table name elsewhere
          Limit: recursionParams.scanLimit
        };
        if (!!recursionParams.LastEvaluatedKey)
          params.ExclusiveStartKey = recursionParams.LastEvaluatedKey;

        console.log('scan using params: ', params);
        table.scan(params, function(err, data) {
          if (err)
            console.log(err, err.stack); // an error occurred
          else {
            console.log(data);           // successful response
            recursionParams.LastEvaluatedKey = data.LastEvaluatedKey;
            for (var r = 0; r < data.Count; r++) { // loop over db records
              var arrayIds = [];
              for (var a = 0; a < data.Items[r].Count.N; a++) {
                arrayIds.push(data.Items[r].Array.L[a].N);
              }
              tickets.feedRandom(arrayIds);
              recursionParams.dbRecordsConsumedIds.push(data.Items[r].Id.N);
            }

            console.log('howManyNeeded afterwards: ', tickets.howManyNeeded());
            console.log('Tickets afterwards: ', tickets);
            if (tickets.moreNeeded()) {
              // TODO: ideally recursionParams.scanLimit should be set here
              recursiveFeed(recursionParams);
            } else {
              console.log('recursionParams afterwards: ', JSON.stringify(recursionParams));
            }
          }
        });
      });
    }

    var recursionParams = {
      dbRecordsConsumedIds: [],
      scanLimit: 1
    };
    
    recursiveFeed(recursionParams);
	}
}]);