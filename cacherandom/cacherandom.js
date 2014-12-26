// cacherandom.js

var dbase = require('modules/dynamodb');
var getbits = require('modules/getbits');

console.log('Loading event');

/* Lambda entry point accepting following parameters:
{
  "rmId": "id1",
  "rmIds": [ "id1", "id2", "id3" ]
}
*/
exports.handler = function(event, context) {
  var removeArray = [];
  console.log("event = " + JSON.stringify(event));
  getbits.getFreshBits(function(err, data) {
  	console.log('getFreshBits returned: ', err, data);
    dbase.appendItem(data.array, function(err, data) {
      console.log('db.appendItem returned: ', data);
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
    });
  });
}
