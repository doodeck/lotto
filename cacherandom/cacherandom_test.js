// cacherandom_test.js
/*
This dummy Lambda "execution environment" is very handy
 in finding the syntactic error, which otherwise are usually
 not reported by the actual framework.
 */
var cacherandom = require('./cacherandom');

var event = {
  // "rmIds": [ "519", 520 ] obsolete
  "rmObj": {
      "HotId": "4",
      "Id": "34"
  }
};

var context = {
  done: function() {
    console.log('context.done called: ', JSON.stringify(arguments));
  }
}
cacherandom.handler(event, context);

