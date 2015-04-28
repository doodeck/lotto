'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.factory('LastEvalKey', function($cacheFactory) {
  var lastKeyCacheKey = 'lastKeyCache8347ryfhekj';
  var lastKeyCache = $cacheFactory('lastkey');
  var serviceInstance = {
    getLast: function() {
      var key = lastKeyCache.get(lastKeyCacheKey);
      console.log('retrieved cached lastKey: ', key);
      return key;
    },
    setLast: function(key) {
      lastKeyCache.put(lastKeyCacheKey, key);
      console.log('cached lastKey: ', key);
    }
  };

  return serviceInstance;
})

.controller('View1Ctrl', ['$rootScope', '$scope', '$http', '$timeout',
                          'AWSService', 'LastEvalKey', 'Country', 'myConfig',
                  function($rootScope,   $scope,   $http,   $timeout,
                           AWSService,   LastEvalKey,   Country,   myConfig) {
  $scope.globallyUnique = 0;
	$scope.pickCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50 ];
  $scope.currentCount = $scope.pickCounts[0];
  $scope.pickNumbers = [1,2,3,4,5,6,7,8,9,10,12,15,16,17,18];
  // $scope.currentNumber = $scope.pickNumbers[0];
  $scope.pickHighNumbers = [15,19,20,22,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,
                            40,41,42,43,44,45,46,47,48,49,50,52,53,54,55,56,58,59,60,70,
                            75,77,80,81,90];
  // $scope.currentHighNumber = $scope.pickHighNumbers[0];
  $scope.pickExtras = [0,1,2,4,5,6,7,10];
  // $scope.currentExtra = $scope.pickExtras[0];
  $scope.pickHighExtras = [0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,
                           25,26,27,31,35,39,42,43,45,46,49,52,70,80];
  // $scope.currentHighExtra = $scope.pickHighExtras[0];

  $scope.countries = Country.query();
  console.log('Here are my countries: ', $scope.countries);
  // $scope.currentCountry = $scope.countries[1]; ... see below
  // not so quickly ..., see below $scope.pickCountry(0);

  // $scope.viewName = "view 1";
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
		table.describeTable({TableName: myConfig.TableName}, function(err, data) {
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

  $scope.pickCountry = function(index) {
    console.log('pickCountry: ', index);
    // $scope.currentCountryIndex = index;
    $scope.currentCountry = $scope.countries[index];
    $scope.currentCountryJson = Country.get({countryId: $scope.countries[index].id}, function(country) {
      console.log('Country.get callback: ', country);
      $scope.pickGame(0);
    });
    console.log('$scope.currentCountryJson: ', $scope.currentCountryJson);
  }

  $scope.countries.$promise.then(function(hgw) {
    console.log('hgw: ', hgw);
    $scope.pickCountry(0);
  });

  $scope.pickGame = function(index) {
    console.log('picking game: ', index);
    $scope.currentGameIndex = index;
    // $scope.pickNumber($scope.currentCountryJson.games[$scope.currentGameIndex].numbers);
  }

  $scope.pickNumber = function(number) { // this should be changed only for Any country/game, otherwise the UI is disabled
    console.log('pickNumber: ', number);
    // $scope.currentNumber = number;
    $scope.currentCountryJson.games[$scope.currentGameIndex].numbers = number;
  }

  $scope.pickHighNumber = function(number) {
    $scope.currentCountryJson.games[$scope.currentGameIndex].numbersPool = number;    
  }

  $scope.pickExtra = function(extra) {
    $scope.currentCountryJson.games[$scope.currentGameIndex].extras = extra;
  }

  $scope.pickHighExtra = function(extra) {
    $scope.currentCountryJson.games[$scope.currentGameIndex].extrasPool = extra;
  }


	$scope.pickTickets = function() {
		console.log('picking tickets: ', $scope.currentCount);

    // sanity check
    if ($scope.globallyUnique) {
      var numbersPool = $scope.currentCountryJson.games[$scope.currentGameIndex].numbersPool;
      var extrasPool = $scope.currentCountryJson.games[$scope.currentGameIndex].extrasPool || 0;
      var numbers = $scope.currentCountryJson.games[$scope.currentGameIndex].numbers;
      var extras = $scope.currentCountryJson.games[$scope.currentGameIndex].extras || 0;
      var maxPool = numbersPool > extrasPool ? numbersPool : extrasPool;
      if (($scope.currentCount * (numbers + extras)) > maxPool) {
        var msg = 'Too many bets in Globally Unique mode requested';
        console.error(msg);
        $rootScope.addAlert(msg, 'danger');
        return;
      }
    }

    $scope.timeLimitPromise = $timeout(function() {
      console.log("Time's up, if you haven't gotten your lucky numbers yet, there is little hope you ever will");
      return 666;
    }, myConfig.GUItimeout);

		var tickets = new Tickets($scope.currentCount /*numTickets*/,
      $scope.currentCountryJson.games[$scope.currentGameIndex].numbers /*numNumbers*/,
      $scope.currentCountryJson.games[$scope.currentGameIndex].numbersPool /*highestNumber*/,
      $scope.globallyUnique,
      $scope.currentCountryJson.games[$scope.currentGameIndex].extras /*numExtras*/,
      $scope.currentCountryJson.games[$scope.currentGameIndex].extrasPool /*highestExtra*/);

    var howManyNeededMax = tickets.howManyNeeded();

		console.log('howManyNeeded: ', howManyNeededMax);
    console.log('moreNeeded: ', tickets.moreNeeded());
    console.log('Tickets before: ', tickets);

    $scope.abortRequested = false;
    // $scope.progress.max = howManyNeededMax;
    $scope.progress.dynamic = 0; // howManyNeededMax - tickets.howManyNeeded()
    $scope.progress.visible = true;
    // $scope.$apply();

    var cleanupCallback = function(err, status) {
      $scope.abortRequested = true;
      $scope.progress.visible = false;
      if (!!$timeout.cancel($scope.timeLimitPromise)) {
        console.log('Managed to cancel the timeout on time');
      } else {
        console.log('Tried cancelling timeout but it was already too late');
      }

      if (!err) {
        $scope.tickets = tickets.stringify();
        $scope.$apply();
      } else {
        $scope.tickets = {
          extrasVisible: false,
          stringified: []
        };
      }
    }

    $scope.timeLimitPromise.then(function(retVal) {
      console.log('timeLimitPromise resolved to: ', retVal);
      cleanupCallback( { err: 'timeout'}, { status: false, msg: 'timeout'} );
    });

    var recursiveDbRefresh = function(recursiveDbParams) {
      if (recursiveDbParams.currentIndex < recursiveDbParams.arrayIds.length) {
        AWSService.invokeLambdaRandom().then(function(lambda) {
          var params = {
            FunctionName: myConfig.FunctionName, // TODO: function name from a config
            InvokeArgs: '{ ' +
                           '"rmId": ' + recursiveDbParams.arrayIds[recursiveDbParams.currentIndex].toString() + ', ' +
                           '"rmObj": ' +
                               JSON.stringify(recursiveDbParams.arrayObjs[recursiveDbParams.currentIndex]) +
                        '}'
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
          TableName: myConfig.TableName,
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
              recursionParams.dbRecordsConsumedObjs.push({
                HotId: data.Items[r].HotId.N,
                Id: data.Items[r].Id.N
              });
            }

            console.log('howManyNeeded afterwards: ', tickets.howManyNeeded());
            console.log('Tickets afterwards: ', tickets);

            $scope.progress.dynamic = $scope.progress.max * Math.floor((howManyNeededMax - tickets.howManyNeeded()) / howManyNeededMax);
            // $scope.$apply();

            if ($scope.abortRequested) {
              console.log('Aborting picking, probably due to timeout');
            } else if (tickets.moreNeeded()) {
              if (!data.LastEvaluatedKey) {
                console.log('Got out of random DB records before filling the tickets');
                // try to generate some additional records without deleting anything
                var recursiveDbParams = {
                  arrayIds: [0,0,0],
                  arrayObjs: [
                    { HotId: 0, Id: 0 },
                    { HotId: 0, Id: 0 },
                    { HotId: 0, Id: 0 }
                  ],
                  currentIndex: 0
                };
                recursiveDbRefresh(recursiveDbParams);
              } else {
                // TODO: ideally recursionParams.scanLimit should be increased here
                recursiveFeed(recursionParams);                
              }
            } else {
              if (!!data.LastEvaluatedKey)
                LastEvalKey.setLast(data.LastEvaluatedKey);

              var recursiveDbParams = {
                arrayIds: recursionParams.dbRecordsConsumedIds,
                arrayObjs: recursionParams.dbRecordsConsumedObjs,
                currentIndex: 0,
                callback: cleanupCallback
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
      dbRecordsConsumedObjs: [],
      scanLimit: 1
    };
    
    var lastKey = LastEvalKey.getLast();
    if (!!lastKey)
      recursionParams.LastEvaluatedKey = lastKey

    recursiveFeed(recursionParams);
	}
}]);