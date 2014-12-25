// cacherandom.js

var getbits = require('modules/getbits');

console.log('Loading event');

exports.handler = function(event, context) {
  console.log("value1 = " + event.key1);
  console.log("value2 = " + event.key2);
  console.log("value3 = " + event.key3);
  getbits.getFreshBits(function(err, data) {
  	console.log('getFreshBits returned: ', err, data);
    context.done(null, "Lotto Lambda Exitting");  // SUCCESS with message
  });
}
