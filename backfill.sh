#/bin/sh

python3 ddb_to_es.py \
  --rn 'ap-northeast-2' \
  --tn 'Company-xxxxxxxx-dev' \
  --lf 'arn:aws:lambda:ap-northeast-2:youraccountid:function:DdbToEsFn-xxxxxx-dev' \
  --esarn 'arn:aws:dynamodb:ap-northeast-2:youraccountid:table/Company-xxxxxx-dev/stream/2021-05-07T05:09:45.698'