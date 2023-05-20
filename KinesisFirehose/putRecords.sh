for i in {1..5}
do
  RECORD=$(jq -n \
    --arg ff $(uuidgen) \
    --arg okn $(uuidgen) \
    --arg uf $(uuidgen) \
    '{filterField: $ff, oldKeyName: $okn, unwantedField: $uf}' | base64)

  aws firehose put-record \
    --delivery-stream-name KinesisFirehosePlayground \
    --record \
      Data=$RECORD
done
