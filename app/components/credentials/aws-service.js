// aws-service.js

'use strict';

angular.module('myApp.credentials', [])
// .factory(
.provider('AWSService', function() {
	var self = this;

	self.params = undefined;

	self.setAWSparams = function(params) {
		self.params = params;
		console.log('setting setAWSparams:', self.params);
	}

	self.$get = function($q, $cacheFactory) {
	var dynamoCache = $cacheFactory('dynamo'),
	    lambdaCache = $cacheFactory('lambda'),
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
				    console.log('dynamo cacheWebIdentityCredentials: ', error, credentials);
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
		},
		invokeLambdaRandom: function() {
		  console.log('AWSService: making invoke lamba promises with: ', self.params);

		  var d = $q.defer();
		  credentialsPromise.then(function(params) {
		  	/* params.credentials = creds; */

		  	console.log('AWSService: invoke lambda promise then, params: ', params);
			var lambda = lambdaCache.get(JSON.stringify(params.lambda));
			if (!lambda) {
				cacheWebIdentityCredentials(params, function(error, credentials) {
				    console.log('lambda cacheWebIdentityCredentials: ', error, credentials);
				    params.lambda.credentials = credentials;	
					/*var*/ lambda = new AWS.Lambda(params.lambda);
					// lambda.credentials = credentials;
					lambdaCache.put(JSON.stringify(params.lambda), lambda);
					d.resolve(lambda);
				});
			} else {
				d.resolve(lambda);
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
