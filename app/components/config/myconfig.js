// myconfig.js

'use strict';

angular.module('myApp.config', [])
.constant('myConfig', {
  'TableName': 'Lotto_Hotbits',
  'FunctionName': 'cacherandom',
  'region': 'eu-west-1',
  'cognito': {
    'AccountId': '915133436062',
    'IdentityPoolId': 'eu-west-1:74afdbda-6525-498f-b13a-b7d940aac2bd',
    'RoleArn': 'arn:aws:iam::915133436062:role/Cognito_LambdaRandomUnauth_DefaultRole'    
  },
  'GUItimeout': '20000' // milliseconds
})
