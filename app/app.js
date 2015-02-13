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
  'myApp.countries'
])
.config(function(AWSServiceProvider) { // is providing the .provider('AWSService', ...
  AWSServiceProvider
    .setAWSparams({
      dynamoDB: {
        TableName: 'Lotto_Hotbits', // TODO: unify the location of that table
        region: 'eu-west-1',
      },
      cognito: {
        AccountId: '915133436062',
        IdentityPoolId: 'eu-west-1:74afdbda-6525-498f-b13a-b7d940aac2bd',
        RoleArn: 'arn:aws:iam::915133436062:role/Cognito_LambdaRandomUnauth_DefaultRole'
      },
      lambda: {
        region: 'eu-west-1'
      }
  });
})
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
