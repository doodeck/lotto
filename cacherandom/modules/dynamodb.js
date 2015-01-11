// dynamodb.js

'use strict';

var config = require('../config');

var AWS = require('aws-sdk');
AWS.config.update({region: config.region});
var dynamodb = new AWS.DynamoDB({});

// values for "Type" field
// var typeCounter = config.dynamodb.types.counter;
// var typeItem = config.dynamodb.types.item;

var incrementId = function(params, callback) {
  var typeName = params.typeName;
  var increment = !!params.increment ? params.increment.toString() : "1";

  try {
      var item = {
          Key: {
              Type: {
                  S: typeName // config.dynamodb.types.counter
              } /*,
              Id: {
                N: config.dynamodb.counter.id
              }*/
          },
          TableName: config.dynamodb.tableNames.counters,
          UpdateExpression: 'SET ' + config.dynamodb.counter.attr +
          ' = ' + config.dynamodb.counter.attr + ' + :one' +
          ' , ' + '#t' + ' = :time',
          ExpressionAttributeNames: {
            "#t" : config.dynamodb.counter.time
          },
          ExpressionAttributeValues: {
              ":one" : { N: increment },
              ":time" : { N: new Date().getTime().toString() }
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
  incrementId({ typeName: config.dynamodb.types.counter }, function(err, data) {
    if (!err && !!data) {
      callback(undefined, { value: data.Attributes.Val.N });
    } else {
      callback(err, { status: 'dynamoId: incrementId failed' });
    }
  });
}

var dynamoIds = function(increment, callback) {
  incrementId({ typeName: config.dynamodb.types.counter, increment: increment }, function(err, data) {
    if (!err && !!data) {
      callback(undefined, { value: data.Attributes.Val.N });
    } else {
      callback(err, { status: 'dynamoIds: incrementId failed' });
    }
  });
}

exports.hotbitsId = function(callback) {
  incrementId({ typeName: config.dynamodb.types.hotbitsCounter }, function(err, data) {
    if (!err && !!data) {
      callback(undefined, { value: data.Attributes.Val.N });
    } else {
      callback(err, { status: 'hotbitsId: incrementId failed' });
    }
  });
}

exports.appendItems = function(params, callback) {
  var array = params.array;
  var srcIndex = 0;
  var hotId = params.hotId;
  var recCnt = Math.ceil(array.length / config.dynamodb.blockLen);

  dynamoIds(recCnt, function(err, data) {
    if (!err && !!data) {
      var latestWritten = data.value;
      console.log('appendItems: recCnt: ', recCnt, 'latestWritten: ', latestWritten);

      var params = {
        RequestItems: {
        }
      };
      params.RequestItems[config.dynamodb.tableNames.hotbits] = [];

      for (var i = recCnt - 1; i >= 0 && srcIndex < array.length; i--) {
        var dynamoArray = new Array();
        for (var j = 0; j < config.dynamodb.blockLen && srcIndex < array.length; j++) {
          dynamoArray.push({ N: array[srcIndex].toString() });
          srcIndex++;
        }
        params.RequestItems[config.dynamodb.tableNames.hotbits].push({
          PutRequest: {
            Item: {
                HotId: {
                  N: hotId.toString()
                },
                Id: {
                  N: (latestWritten - i).toString()
                },
                Count: {
                  N: dynamoArray.length.toString()
                },
                Array: {
                  L: dynamoArray
                } /* different table, without repetitions,
                Time: {
                  N: new Date().getTime().toString()
                }*/
            }
          }
        });
      }
      console.log('batchWriteItem: ', JSON.stringify(params));
      try {
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
    } else {
      callback(err, { status: 'dynamoIds failed' });
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
                  HotId: {
                    N: hotId.toString()
                  },
                  Id: {
                    N: data.value
                  },
                  Count: {
                    N: array.length.toString()
                  },
                  Array: {
                    L: dynamoArray
                  } /* different table, without repetitions,
                  Time: {
                    N: new Date().getTime().toString()
                  }*/
              },
              TableName: config.dynamodb.tableNames.hotbits
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

// obsolete, do not use until updated to Lambda_Hotbits table
var __obsolete_removeItem = function(Id, callback) {
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
          TableName: config.dynamodb.tableNames.hotbits
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

exports.removeItems = function(ObjArray, callback) {
  try {
    var params = {
      RequestItems: {
      }
    };
    params.RequestItems[config.dynamodb.tableNames.hotbits] = [];

    for (var id in ObjArray) {
      params.RequestItems[config.dynamodb.tableNames.hotbits].push({
        DeleteRequest: {
          Key: {
              HotId: {
                N: ObjArray[id].HotId.toString()
              },
              Id: {
                N: ObjArray[id].Id.toString()
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