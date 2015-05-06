#

zip -r tmp/index.zip *.js modules/ node_modules/
# As of CLI 1.7 upload-function option has been discontinued. Use update-function-code instead
# aws --profile lambda lambda upload-function --region eu-west-1 --function-name cacherandom --function-zip tmp/index.zip  --role 'arn:aws:iam::915133436062:role/lotto_lambda_exec_role' --mode event --handler cacherandom.handler --runtime nodejs --timeout 10
aws --profile lambda lambda update-function-code --region eu-west-1 --function-name cacherandom --zip-file fileb://tmp/index.zip
