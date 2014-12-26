// dynamodb.js

var config = require('../config');

var AWS = require('aws-sdk');
AWS.config.update({region: config.region});
var dynamodb = new AWS.DynamoDB({});

// values for "Type" field
var typeCounter = config.dynamodb.types.counter;
var typeItem = config.dynamodb.types.item;

var incrementId = function(callback) {
  try {
      var item = {
          Key: {
              Type: {
                  S: config.dynamodb.types.counter
              },
              Id: {
                N: config.dynamodb.counter.id
              }
          },
          TableName: config.dynamodb.tableName,
          UpdateExpression: 'SET ' + config.dynamodb.counter.attr +
          ' = ' + config.dynamodb.counter.attr + ' + :one',
          ExpressionAttributeValues: {
              ":one" : { N: "1" }
          },
          ReturnValues: "UPDATED_NEW"
      };
      console.log('update item: ', item);
      dynamodb.updateItem(item, function(err, data) {
          if (err) {
              console.log(err, err.stack); // an error occurred
              callback(err, {});
          } else {
              console.log('Update ok: ', data);           // successful response
              callback(err, data);
          }
      });
  } catch(e) {
      console.log('updateItem exception: ', e);
      callback(e, {});
  }
}

exports.appendItem = function(array, callback) {
  incrementId(callback);
  // callback(undefined, {data: 'OK'});
}