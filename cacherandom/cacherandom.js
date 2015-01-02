// cacherandom.js

'use strict';

var dbase = require('modules/dynamodb');
var getbits = require('modules/getbits');

console.log('Loading event');

var removeItems = function(event, context) {
  var removeArray = [];
  if (!!event.rmIds)
    removeArray = event.rmIds;
  if (!!event.rmId)
    removeArray.push(event.rmId);
  if (removeArray.length > 0) {
    dbase.removeItems(removeArray, function(err, data) {
      console.log('removeItem returned: ', err, data);
      context.done(null, "Lotto Lambda Exitting, attempted delete");
    });
  } else {
    context.done(null, "Lotto Lambda Exitting without deleting");  // SUCCESS with message        
  }
}

/* Lambda entry point accepting following parameters:
{
  "rmId": "id1",
  "rmIds": [ "id1", "id2", "id3" ]
}
*/
exports.handler = function(event, context) {
  console.log("event = " + JSON.stringify(event));
  getbits.getFreshBits(function(err, data) {
  	console.log('getFreshBits returned: ', err, data);
    var bitsArray = data.array;
    if (!err) {
      dbase.hotbitsId(function(err, data) {
        console.log('hotbitsId returned: ', err, data);
        if (!err && !!data) {
          var hotId = data.value;

          dbase.appendItem({ hotId: hotId, array: bitsArray }, function(err, data) {
            console.log('db.appendItem returned: ', data);
            removeItems(event, context);
          });
        } else {
          removeItems(event, context);
        }
      });            
    } else { // don't apend anything if getFreshBits failed, but I guess I still should remove whatever I'm expected to remove?
      removeItems(event, context);
    }
  });
}
