// getbits_test.js

// figure out how big is the daily quota of hotbits service

var getbits = require('./getbits');

var count = 0;

var iterate = function() {
  getbits.getFreshBits(function(err, data) {
    if (!err) {
      count++;
      iterate();
    } else {
      console.log('getbits failed at count: ', count, err, data);
    }
  });
}

iterate();
console.log('exitting with count: ', count);
