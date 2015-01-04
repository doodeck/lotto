// config.js

'use strict';

var CONFIG = {
  region: 'eu-west-1',
  dynamodb: {
    tableName: 'LambdaRandom',
    types: {
      counter: 'Counter',
      item: 'Item',
      hotbitsCounter: 'Hotbits'
    },
    counter: {
      type: 'Counter', // or 'Hotbits'
      id: '1',
      attr: 'Val'
    },
    blockLen: 16 // hotbit numbers in a single DB item
  },
  hotbits: {
    blockLen: 45 // hotbit numbers in a single hotbits Request
  }
};

global.NODE_CONFIG = global.NODE_CONFIG ? global.NODE_CONFIG : CONFIG;

module.exports = global.NODE_CONFIG;

// database table

/*
aws --profile lambda dynamodb describe-table --table-name LambdaRandom
{
    "Table": {
        "AttributeDefinitions": [
            {
                "AttributeName": "Id", 
                "AttributeType": "N"
            }, 
            {
                "AttributeName": "Type", 
                "AttributeType": "S"
            }
        ], 
        "ProvisionedThroughput": {
            "NumberOfDecreasesToday": 0, 
            "WriteCapacityUnits": 5, 
            "ReadCapacityUnits": 5
        }, 
        "TableSizeBytes": 0, 
        "TableName": "LambdaRandom", 
        "TableStatus": "ACTIVE", 
        "KeySchema": [
            {
                "KeyType": "HASH", 
                "AttributeName": "Type"
            }, 
            {
                "KeyType": "RANGE", 
                "AttributeName": "Id"
            }
        ], 
        "ItemCount": 0, 
        "CreationDateTime": 1419579048.059
    }
}

aws --profile lambda dynamodb scan --table-name LambdaRandom
{
    "Count": 1, 
    "Items": [
        {
            "Type": {
                "S": "Counter"
            }, 
            "Id": {
                "N": "1"
            }, 
            "Val": {
                "N": "7"
            }
        }
    ], 
    "ScannedCount": 1, 
    "ConsumedCapacity": null
}
*/