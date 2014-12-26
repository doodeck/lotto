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

// feed the fresh random numbers into the Tickets collection
Tickets.prototype.feedRandom = function(array) {
  if (array.length > 0) {
    // debugger;
    var srcIndex = 0;
    var firstTicket = this._tickets.length > 0 ? this._tickets.length - 1 : 0;
    for (var t = firstTicket; t < this._numTickets && srcIndex < array.length; t++) {
      if (this._tickets.length <= t)
        this._tickets.push({ numbers: [], extras: [] });

      while (this._tickets[t].numbers.length < this._numNumbers  && srcIndex < array.length) {
        this._tickets[t].numbers.push(array[srcIndex]);
        srcIndex++;
      }

      while (this._tickets[t].extras.length < this._numExtras  && srcIndex < array.length) {
        this._tickets[t].extras.push(array[srcIndex]);
        srcIndex++;
      }
    }
  }
}
