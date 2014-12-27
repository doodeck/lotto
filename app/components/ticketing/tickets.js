// tickets.js

'use strict';

function Tickets(numTickets, numNumbers, highestNumber, numExtras, highestExtra) {
  this._numTickets = numTickets;
  this._numNumbers = numNumbers; // numbers per ticket
  this._highestNumber = highestNumber;
  this._numExtras = !!numExtras ? numExtras : 0; // extra per ticket
  this._highestExtra = !!highestExtra ? highestExtra : 0;

  this._tickets = [];// each item:  { numbers: [], extras: [] }
}

// supposedly not needed: Tickets.prototype.constructor = Tickets;

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

// feed either numbers or extras
Tickets.prototype.feedGroup = function(numArray, numNumbers, params) {
  while (numArray.length < numNumbers  && params.srcIndex < params.srcArray.length) {
    numArray.push(params.srcArray[params.srcIndex]);
    params.srcIndex++;
  }
}

Tickets.prototype.feedTicket = function(params) {
  this.feedGroup(params.currentTicket.numbers, this._numNumbers, params);

  this.feedGroup(params.currentTicket.extras, this._numExtras, params);
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
        this._tickets.push({ numbers: [], extras: [] });

      params.currentTicket = this._tickets[t];

      Tickets.prototype.feedTicket.call(this, params);
    }
  }
}
