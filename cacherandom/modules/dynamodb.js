// dynamodb.js

'use strict';

var config = require('../config');

var AWS = require('aws-sdk');
AWS.config.update({region: config.region});
var dynamodb = new AWS.DynamoDB({});

// values for "Type" field
// var typeCounter = config.dynamodb.types.counter;
// var typeItem = config.dynamodb.types.item;

var incrementId = function(typeName, callback) {
  try {
      var item = {
          Key: {
              Type: {
                  S: typeName // config.dynamodb.types.counter
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
              callback(err, { status: 'updateItem failed' });
          } else {
              console.log('Update ok: ', data);           // successful response
              callback(undefined, data);
          }
      });
  } catch(e) {
      console.log('updateItem exception: ', e);
      callback(e, { status: 'updateItem exception' });
  }
}

var dynamoId = function(callback) {
  incrementId(config.dynamodb.types.counter, function(err, data) {
    if (!err && !!data) {
      callback(undefined, { value: data.Attributes.Val.N });
    } else {
      callback(err, { status: 'incrementId failed' });
    }
  });
}

exports.hotbitsId = function(callback) {
  incrementId(config.dynamodb.types.hotbitsCounter, function(err, data) {
    if (!err && !!data) {
      callback(undefined, { value: data.Attributes.Val.N });
    } else {
      callback(err, { status: 'incrementId failed' });
    }
  });
}

exports.appendItem = function(params, callback) {
  var array = params.array;
  var hotId = params.hotId;

  var dynamoArray = [];
  for (var item in array) {
    dynamoArray.push({ N: array[item].toString() });
  }

  dynamoId(function(err, data) {
    if (!err && !!data) {
      try {
          var item = {
              Item: {
                  Type: {
                      S: config.dynamodb.types.item
                  },
                  Id: {
                    N: data.value
                  },
                  Count: {
                    N: array.length.toString()
                  },
                  Array: {
                    L: dynamoArray
                  },
                  HotId: {
                    N: hotId.toString()
                  }
              },
              TableName: config.dynamodb.tableName
          };
          console.log('putItem item: ', item);
          dynamodb.putItem(item, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            callback(err, data);
          });
      } catch(e) {
          console.log('putItem exception: ', e);
          callback(e, { status: 'putItem exception' });
      }
    } else {
      callback(err, { status: 'dynamoId failed' });
    }
  });
}

exports.removeItem = function(Id, callback) {
  try {
      var item = {
          Key: {
              Type: {
                  S: config.dynamodb.types.item
              },
              Id: {
                N: Id.toString()
              }
          },
          TableName: config.dynamodb.tableName
      };
      console.log('delete item: ', item);
      dynamodb.deleteItem(item, function(err, data) {
          if (err) {
              console.log(err, err.stack); // an error occurred
              callback(err, { status: 'deleteItem failed' });
          } else {
              console.log('Delete ok: ', data);           // successful response
              callback(undefined, data);
          }
      });
  } catch(e) {
      console.log('deleteItem exception: ', e);
      callback(e, { status: 'deleteItem exception' });
  }
}

exports.removeItems = function(IdArray, callback) {
  try {
    var params = {
      RequestItems: {
        /*
        LambdaRandom: [ // config.dynamodb.tableName: 
        ]
        */
      }
    };
    params.RequestItems[config.dynamodb.tableName] = [];

    for (var id in IdArray) {
      params.RequestItems.LambdaRandom.push({
        DeleteRequest: {
          Key: {
              Type: {
                  S: config.dynamodb.types.item
              },
              Id: {
                N: IdArray[id].toString()
              }
          }
        }
      });
    }
    console.log('batchWriteItem: ', JSON.stringify(params));

    dynamodb.batchWriteItem(params, function(err, data) {
      /* TODO: tak care of "UnprocessedItems":{}
      http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ErrorHandling.html#BatchOperations */
      if (err) {
          console.log(err, err.stack); // an error occurred
          callback(err, { status: 'batchWriteItem failed' });
      } else {
          console.log('batchWriteItem ok: ', JSON.stringify(data));           // successful response
          callback(undefined, data);
      }
    });

  } catch(e) {
      console.log('batchWriteItem exception: ', e);
      callback(e, { status: 'batchWriteItem exception' });
  }
}