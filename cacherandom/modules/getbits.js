// getbits.js

'use strict';

var config = require('../config');

var request = require('request');
var parseString = require('xml2js').parseString;

exports.getFreshBits = function(callback) {
  var useXml = false;
  if (useXml) {
    request(
      // 'http://www.google.com',
      'https://www.fourmilab.ch/cgi-bin/Hotbits?nbytes=16&fmt=xml&npass=1&lpass=8&pwtype=3',
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          parseString(body, function (err, result) {
            console.log(result);
            console.log(result.hotbits['random-data']);
            callback(undefined, { status: 'OK' });
          });
        } else {
          callback(error, response);
        }
      }
    );
  } else {
    var requestSettings = {
       method: 'GET',
       url: 'https://www.fourmilab.ch/cgi-bin/Hotbits?nbytes=' + config.hotbits.blockLen.toString() + '&fmt=bin&npass=1&lpass=8&pwtype=3',
       encoding: null
    };

    request(requestSettings,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
          console.log('body.length: ', body.length);
          if (body.length == config.hotbits.blockLen) {
            var byteArray = new Uint8Array(body),
                array = [];
            for (var i = 0; i < byteArray.byteLength; i++) {
              // do something with each byte in the array
              // console.log('byte[', i, ']: ', byteArray[i]);
              array.push(byteArray[i]);
            }
            callback(undefined, { status: 'OK', array: array });
          } else {
            console.log('The returned block length mismatch: ', body.length, ' vs. ', config.hotbits.blockLen);
            console.log(body.toString());
            callback({ error: 'block length mismatch' }, undefined);
          }
        } else {
          callback(error, response);
        }
      }
    );
  }
}
