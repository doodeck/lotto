// cacherandom.js

var request = require('request');

console.log('Loading event');

var getFreshBits = function(callback) {
	request('http://www.google.com', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body); // Print the google web page.
	    callback(undefined, { status: 'OK' });
	  } else {
	  	callback(error, response);
	  }
	});
}

exports.handler = function(event, context) {
  console.log("value1 = " + event.key1);
  console.log("value2 = " + event.key2);
  console.log("value3 = " + event.key3);
  getFreshBits(function(err, data) {
  	console.log('getFreshBits returned: ', err, data);
    context.done(null, "Hello World");  // SUCCESS with message
  });
}
