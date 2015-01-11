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
  $scope.progress = {
    max: 100, // it cannot be changed dynamically
    dynamic: 0,
    visible: false
  };
  $scope.tickets = {
    extrasVisible: false,
    stringified: []
  };

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

		var tickets = new Tickets($scope.currentCount /*numTickets*/, 6 /*numNumbers*/, 49 /*highestNumber*/, 0 /*numExtras*/, 10/*highestExtra*/);

    var howManyNeededMax = tickets.howManyNeeded();

		console.log('howManyNeeded: ', howManyNeededMax);
    console.log('moreNeeded: ', tickets.moreNeeded());
    console.log('Tickets before: ', tickets);

    // $scope.progress.max = howManyNeededMax;
    $scope.progress.dynamic = 0; // howManyNeededMax - tickets.howManyNeeded()
    $scope.progress.visible = true;
    // $scope.$apply();

    var recursiveDbRefresh = function(recursiveDbParams) {
      if (recursiveDbParams.currentIndex < recursiveDbParams.arrayIds.length) {
        AWSService.invokeLambdaRandom().then(function(lambda) {
          var params = {
            FunctionName: 'cacherandom', // TODO: function name from a config
            InvokeArgs: '{ "rmId": ' + recursiveDbParams.arrayIds[recursiveDbParams.currentIndex].toString() + ' }'
          };
          recursiveDbParams.currentIndex++
          console.log('lambda.invokeAsync: ', params);

          lambda.invokeAsync(params, function(err, data) {
            if (err)
              console.log(err, err.stack); // an error occurred
            else
              console.log(data);           // successful response
            recursiveDbRefresh(recursiveDbParams); // recurse anyway, maybe other calls will succeed
          });
        });
      } else {
        console.log('recursiveDbRefresh: removed everything possible');
        if (!!recursiveDbParams.callback)
          recursiveDbParams.callback(undefined, { status: "OK"} );
      }
    }

    var recursiveFeed = function(recursionParams) {
      AWSService.dynamoLambdaRandom().then(function(table) {
        var params = {
          /* back to scan() ... KeyConditions: {
            Type: {
              ComparisonOperator: 'EQ',
              AttributeValueList: [
                { S: 'Item' } // TODO: ../cacherandom/config.js
              ],
            }
          }, */
          TableName: 'LambdaRandom',  // TODO: Table name elsewhere
          Limit: recursionParams.scanLimit
        };
        if (!!recursionParams.LastEvaluatedKey)
          params.ExclusiveStartKey = recursionParams.LastEvaluatedKey;

        console.log('scan using params: ', params);
        table.scan /*query*/(params, function(err, data) {
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

            $scope.progress.dynamic = $scope.progress.max * Math.floor((howManyNeededMax - tickets.howManyNeeded()) / howManyNeededMax);
            // $scope.$apply();

            if (tickets.moreNeeded()) {
              if (!data.LastEvaluatedKey) {
                console.log('Got out of random DB records before filling the tickets');
                // try to generate some additional records without deleting anything
                var recursiveDbParams = {
                  arrayIds: [0,0,0,0,0,0,0,0,0,0],
                  currentIndex: 0
                };
                recursiveDbRefresh(recursiveDbParams);
              } else {
                // TODO: ideally recursionParams.scanLimit should be increased here
                recursiveFeed(recursionParams);                
              }
            } else {
              var recursiveDbParams = {
                arrayIds: recursionParams.dbRecordsConsumedIds,
                currentIndex: 0,
                callback: function(err, status) {
                            if (!err) {
                              $scope.tickets = tickets.stringify();
                              $scope.progress.visible = false;
                              $scope.$apply();
                            }
                          }
              };
              console.log('recursionParams afterwards: ', JSON.stringify(recursionParams));
              recursiveDbRefresh(recursiveDbParams);
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