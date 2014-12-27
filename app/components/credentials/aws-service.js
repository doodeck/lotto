// aws-service.js

'use strict';

angular.module('myApp.credentials', [])
// .factory(
.provider('AWSService', function() {
	var self = this;

	self.params = undefined;

	self.setAWSparams = function(params) {
		console.log('setting setAWSparams:', params);
		self.params = params;
	}

	self.$get = function($q, $cacheFactory) {
	var dynamoCache = $cacheFactory('dynamo'),
	    credentialsCache = $cacheFactory('credentials'),
	    credentialsDefer = $q.defer(),
	    credentialsPromise = credentialsDefer.promise;
	// console.log('AWSService initialized');
	var assumeWebIdentityCredentials = function(params, callback) {
		AWS.config.region = params.dynamoDB.region; // 'eu-west-1';
		var creds = /*AWS.config.credentials =*/ new AWS.CognitoIdentityCredentials(
			params.cognito
		);
		/*AWS.config.credentials*/ creds.get(function(err) {
			if (!err) {
				console.log("Cognito Identity Id: " + /*AWS.config.credentials*/ creds.identityId);
				callback(undefined, /*AWS.config.credentials*/ creds);

			} else {
				console.log('Cognito.get failed: ', err);
				callback(err, undefined);
			}
		});
	};

	var cacheWebIdentityCredentials = function(params, callback) {
		var creds = credentialsCache.get(JSON.stringify(params.cognito));
		if (!creds) {
			assumeWebIdentityCredentials(params, function(error, credentials) {
				if (!!error) {
					console.log('assumeWebIdentityCredentials failed: ', error);
					callback(error, credentials);
				} else {
					console.log('caching the credentials: ', credentials);
					credentialsCache.put(JSON.stringify(params.cognito), credentials);
					callback(undefined, credentials);
				}
			});
		} else {
				console.log("Cached Cognito Identity Id: " + /*AWS.config.credentials*/ creds.identityId);
				callback(undefined, /*AWS.config.credentials*/ creds);
		}
	}

	var shinyNewServiceInstance = {
		// "arn:aws:dynamodb:us-east-1:123456789012:table/books_table"
		dynamoLambdaRandom: function() {
		  console.log('AWSService: making promises with: ', self.params);

		  var d = $q.defer();
		  credentialsPromise.then(function(params) {
		  	/* params.credentials = creds; */

		  	console.log('AWSService: promise then, params: ', params);
			var table = dynamoCache.get(JSON.stringify(params.dynamoDB));
			if (!table) {
				cacheWebIdentityCredentials(params, function(error, credentials) {
				    console.log('assumeWebIdentityCredentials: ', error, credentials);
				    params.dynamoDB.credentials = credentials;	
					/*var*/ table = new AWS.DynamoDB(params.dynamoDB);
					// table.credentials = credentials;
					dynamoCache.put(JSON.stringify(params.dynamoDB), table);
					d.resolve(table);
				});
			} else {
				d.resolve(table);
			}
		  });
		  if (!!self.params)
		  	credentialsDefer.resolve(self.params);
		  return d.promise;
		}
	};

	// factory function body that constructs shinyNewServiceInstance
	return shinyNewServiceInstance;
	}

});
