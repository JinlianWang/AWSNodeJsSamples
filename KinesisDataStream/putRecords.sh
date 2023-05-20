#!/bin/bash

STREAM_NAME=$1

if [ -z "$STREAM_NAME" ]
then
  echo "No stream name provided. Usage: $0 <stream-name>"
  exit 1
fi

for i in {1..30}
do
  DATA=$(echo -n "{\"filterField\": \"$(openssl rand -hex 3)\", \"oldKeyName\": \"$(openssl rand -hex 3)\", \"unwantedField\": \"$(openssl rand -hex 3)\"}" | base64)
  PARTITION_KEY="partitionKey$i"
  aws kinesis put-record --stream-name $STREAM_NAME --data $DATA --partition-key $PARTITION_KEY
done

