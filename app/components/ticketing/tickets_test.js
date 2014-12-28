// tickets_test.js
//
// to run:
// node tickets_test.js
//

'use strict';

/* doesn't work
var fs = require('fs');

function read(f) {
  return fs.readFileSync(f).toString();
}

function include(f) {
  eval.apply(global, [read(f)]);
}

include('./tickets.js');

console.log('byteCapacity: ', byteCapacity);
*/

var highestNumber = 49;

var Tickets = require('./tickets.js');

var tickets = new Tickets(1 /*numTickets*/, 6 /*numNumbers*/, highestNumber/*, numExtras, highestExtra*/);

for (var i = 0; i < 256; i++) {
  console.log('byte2number(' + i.toString() + ', ' + highestNumber.toString() + '): ', tickets.byte2number(i, highestNumber));
}
