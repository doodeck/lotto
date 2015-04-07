// tickets.js

'use strict';

var byteCapacity = 256; // number of distinct numbers which can be encoded on byte

function Tickets(numTickets, numNumbers, highestNumber, globallyUnique, numExtras, highestExtra) {
  this._numTickets = numTickets;
  this._numNumbers = numNumbers; // numbers per ticket
  this._highestNumber = highestNumber;
  this._globalNumbersSet = globallyUnique ? {} : undefined;
  this._numExtras = !!numExtras ? numExtras : 0; // extra per ticket
  this._highestExtra = !!highestExtra ? highestExtra : 0;
  // console.log('globallyUnique: ', globallyUnique);
  this._tickets = [];

  this._digitSep = ' - ';
}

// supposedly not needed: Tickets.prototype.constructor = Tickets;

Tickets.prototype.stringify = function() {
  var retVal = {
    "extrasVisible": false, 
    "stringified": []
  };
  for (var t in this._tickets) {
    var ticket = this._tickets[t];
    var stringItem = {};
    for (var n in ticket.numbersSet) {
      if (!stringItem.numbers)
        stringItem.numbers = n.toString();
      else
        stringItem.numbers = stringItem.numbers.concat(this._digitSep + n.toString());
    }
    for (var e in ticket.extrasSet) {
      if (!stringItem.extras) {
        stringItem.extras = e.toString();
        retVal.extrasVisible = true;
      } else
        stringItem.extras = stringItem.extras.concat(this._digitSep + e.toString());
    }
    retVal.stringified.push(stringItem);
  }

  return retVal;
}

// return the number of random numbers stll required to fill the tickets
Tickets.prototype.howManyNeeded = function() {
  var lastItemIfAny = this._tickets.length - 1;
  var retVal = (this._numTickets - this._tickets.length) * (this._numNumbers + this._numExtras);
  if (lastItemIfAny >= 0) {
    retVal += this._numNumbers - this._tickets[lastItemIfAny].numbers.length +
              this._numExtras - this._tickets[lastItemIfAny].extras.length
  }
  return retVal;
}

Tickets.prototype.moreNeeded = function() {
  var howManyNeeded = Tickets.prototype.howManyNeeded.call(this);

  return howManyNeeded > 0 ? true : false;
}

// return a number on the 1..highestNumber range inclusive, or undefined for error
Tickets.prototype.byte2number = function(byte, highestNumber) {
  var repetitions = Math.floor(byteCapacity / highestNumber);
  var releaseCandidate = 1 + Math.floor(byte / repetitions);

  return releaseCandidate > highestNumber ? undefined : releaseCandidate;
}

// feed either numbers or extras
Tickets.prototype.feedGroup = function(numArray, numSet, numNumbers, highestNumber, params) {
  var that = this;
  while (numArray.length < numNumbers  && params.srcIndex < params.srcArray.length) {
    var number = that.byte2number(params.srcArray[params.srcIndex], highestNumber);
    if (number !== undefined && !(numSet[number]) &&
        (!that._globalNumbersSet || !(that._globalNumbersSet[number]))) {
      numArray.push(number);
      numSet[number] = true;
      if (!!that._globalNumbersSet) {
        that._globalNumbersSet[number] = true;
      }
    }
    params.srcIndex++;
  }
}

Tickets.prototype.feedTicket = function(params) {
  this.feedGroup(params.currentTicket.numbers, params.currentTicket.numbersSet,
                 this._numNumbers, this._highestNumber, params);

  this.feedGroup(params.currentTicket.extras, params.currentTicket.extrasSet,
                 this._numExtras, this._highestExtra, params);
}

// feed the fresh random numbers into the Tickets collection
Tickets.prototype.feedRandom = function(array) {
  if (array.length > 0) {
    // debugger;
    // var srcIndex = 0;
    var params = {
      // currentTicket: this._tickets[t],
      srcArray: array,
      srcIndex: 0
    };

    var firstTicket = this._tickets.length > 0 ? this._tickets.length - 1 : 0;
    for (var t = firstTicket; t < this._numTickets && params.srcIndex < params.srcArray.length; t++) {
      if (this._tickets.length <= t)
        this._tickets.push({ numbers: [], // the actual location of numbers
          numbersSet: {}, // keep track to avoid duplicates
          extras: [],
          extrasSet: {}
        });

      params.currentTicket = this._tickets[t];

      Tickets.prototype.feedTicket.call(this, params);
    }
  }
}

// used by the testing code, not the browser
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Tickets;
}
