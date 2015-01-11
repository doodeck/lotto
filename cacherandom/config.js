// config.js

'use strict';

var CONFIG = {
  region: 'eu-west-1',
  dynamodb: {
    tableNames: {
        hotbits: 'Lotto_Hotbits', // 'LambdaRandom', the same name is dumplicated in frontend, file view1.js
        counters: 'Lotto_Counters'
    },
    types: { // to be obsoleted
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
    blockLen: 256 // hotbit numbers in a single hotbits Request. Do not ever set it to 402, it happens to be the length of the "quota exceeded response"
    // hotbits.blockLen / dynamodb.blockLen ratio must not exceed 25 (items are written in a single batchWriteItem)
  }
};

global.NODE_CONFIG = global.NODE_CONFIG ? global.NODE_CONFIG : CONFIG;

module.exports = global.NODE_CONFIG;

// database table

/*
aws --profile lambda dynamodb describe-table --table-name Lotto_Hotbits
{
    "Table": {
        "AttributeDefinitions": [
            {
                "AttributeName": "HotId", 
                "AttributeType": "N"
            }, 
            {
                "AttributeName": "Id", 
                "AttributeType": "N"
            }
        ], 
        "ProvisionedThroughput": {
            "NumberOfDecreasesToday": 0, 
            "WriteCapacityUnits": 4, 
            "ReadCapacityUnits": 4
        }, 
        "TableSizeBytes": 11, 
        "TableName": "Lotto_Hotbits", 
        "TableStatus": "ACTIVE", 
        "KeySchema": [
            {
                "KeyType": "HASH", 
                "AttributeName": "HotId"
            }, 
            {
                "KeyType": "RANGE", 
                "AttributeName": "Id"
            }
        ], 
        "ItemCount": 1, 
        "CreationDateTime": 1420978007.935
    }
}

aws --profile lambda dynamodb describe-table --table-name Lotto_Counters
{
    "Table": {
        "AttributeDefinitions": [
            {
                "AttributeName": "Type", 
                "AttributeType": "S"
            }
        ], 
        "ProvisionedThroughput": {
            "NumberOfDecreasesToday": 0, 
            "WriteCapacityUnits": 2, 
            "ReadCapacityUnits": 2
        }, 
        "TableSizeBytes": 0, 
        "TableName": "Lotto_Counters", 
        "TableStatus": "ACTIVE", 
        "KeySchema": [
            {
                "KeyType": "HASH", 
                "AttributeName": "Type"
            }
        ], 
        "ItemCount": 0, 
        "CreationDateTime": 1420883840.277
    }
}

aws --profile lambda dynamodb scan --table-name Lotto_Counters
{
    "Count": 2, 
    "Items": [
        {
            "Type": {
                "S": "Hotbits"
            }, 
            "Val": {
                "N": "2"
            }
        }, 
        {
            "Type": {
                "S": "Counter"
            }, 
            "Val": {
                "N": "17"
            }
        }
    ], 
    "ScannedCount": 2, 
    "ConsumedCapacity": null
}

*/