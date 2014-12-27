To build this custom browser distribution:

```
git clone git://github.com/aws/aws-sdk-js
cd aws-sdk-js/
git checkout v2.1.4
npm install
node dist-tools/browser-builder.js cloudwatch,cognitoidentity,cognitosync,dynamodb,kinesis,elastictranscoder,s3,sqs,sns,sts,lambda > aws-sdk-lambda.js
```
