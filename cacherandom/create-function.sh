#

mkdir -p tmp
zip -r tmp/index.zip *.js modules/ node_modules/
aws --profile lambda lambda create-function --region eu-west-1 \
  --function-name cacherandom \
  --runtime nodejs \
  --role 'arn:aws:iam::915133436062:role/lotto_lambda_exec_role' \
  --handler 'cacherandom.handler' \
  --timeout 10 \
  --memory-size 128 \
  --zip-file fileb://tmp/index.zip
