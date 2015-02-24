'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'ui.bootstrap',
  'myApp.navigation',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'myApp.credentials',
  'myApp.ticketing',
  'myApp.countries',
  'myApp.config'
])
.config(function(AWSServiceProvider, myConfig) { // is providing the .provider('AWSService', ...
  AWSServiceProvider
    .setAWSparams({
      dynamoDB: {
        TableName: myConfig.TableName, // 'Lotto_Hotbits',
        region: myConfig.region // 'eu-west-1',
      },
      cognito: {
        AccountId: myConfig.cognito.AccountId,
        IdentityPoolId: myConfig.cognito.IdentityPoolId,
        RoleArn: myConfig.cognito.RoleArn
      },
      lambda: {
        region: myConfig.region // 'eu-west-1'
      }
  });
})
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
