Deploying the lambda function:

```
zip -r tmp/index.zip *.js modules/ node_modules/ ; aws --profile lambda lambda upload-function --region eu-west-1 --function-name cacherandom --function-zip tmp/index.zip  --role 'arn:aws:iam::915133436062:role/lotto_lambda_exec_role' --mode event --handler cacherandom.handler --runtime nodejs --timeout 10
```
