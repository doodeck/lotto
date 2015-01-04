// getbits_test.js

// figure out how big is the daily quota of hotbits service

/*
Figured it out experimentally and only later discovered that the daily quota
is reported explicitly when requesting XML format:
<quota-requests-remaining>120</quota-requests-remaining>
<quota-bytes-remaining>12288</quota-bytes-remaining>

The experimental results:
+---------+---------+
|BlockLen | NumGets |
+---------+---------+
|  16     |   120   |
|  64     |   120   |
| 512     |    24   |
|2048     |     6   |
+---------+---------+
 */

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
