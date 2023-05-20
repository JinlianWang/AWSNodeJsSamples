
### Context

This project is to play with Kinesis Data Stream. 

1. Create a Lambda function called "KinesisLambdaConsumerPlayground" using code as in index.js; 
2. Create a data stream called "KinesisStreamPlayground" and set up event source mapping so that Lambda function would be a consumer of the Kinesis data stream and called when there is any new records; 
3. Run putRecords.sh to put 10 records to the data stream. 
4. Wait for a few minutes (depending on the buffer time/size of even source mapping config), there is some json file created in S3 bucket with folder structure of `/{$outputformat}/YYYY/MM/DD/HH/` in the following format: 

```
{"filterField":"1CE1DC46-B9E3-4A2B-9945-524610337A99","newKeyName":"0E709EAD-A492-43CB-BFF3-382B783907C2"}
```
5. Set up Glue crawler to craw the output folder (pending on whether it is json or parquet, the table name would be json or parquet by default), and run the crawler. The result would create a table to a database in Glue data catalog; 
6. Run Athena query like the following and make sure it works. Notice that partition name is not using year or month, you have to edit them manually from something like "partition_4" to minute. 

```
SELECT * FROM "AwsDataCatalog"."my_database"."json" where "partition_4"='19' limit 2;
```


### Commands


* ``` aws kinesis create-stream --stream-name KinesisStreamPlayground --shard-count 1 √
* ``` zip -r function_package.zip . ```
* ``` aws lambda update-function-code --function-name arn:aws:lambda:us-east-1:804462227831:function:KinesisLambdaConsumerPlayground --zip-file fileb://function_package.zip ```
* ``` aws lambda update-function-configuration --function-name arn:aws:lambda:us-east-1:804462227831:function:KinesisLambdaConsumerPlayground --environment "Variables={OUTPUT_FORMAT=json,S3_BUCKET=glueplayground-05-16-2023}" ```
* ``` aws lambda update-function-configuration --function-name arn:aws:lambda:us-east-1:804462227831:function:KinesisLambdaConsumerPlayground --environment "Variables={OUTPUT_FORMAT=parquet,S3_BUCKET=glueplayground-05-16-2023}" ```
* ``` aws lambda create-event-source-mapping --function-name KinesisLambdaConsumerPlayground --event-source-arn arn:aws:kinesis:us-east-1:804462227831:stream/KinesisStreamPlayground --starting-position LATEST ```
* ``` ./putRecords.sh KinesisStreamPlayground ```

### Misc

Sunnys-iMac:KinesisDataStream jinlianwang$ aws kinesis create-stream --stream-name KinesisStreamPlayground --shard-count 1
Sunnys-iMac:KinesisDataStream jinlianwang$ aws lambda create-event-source-mapping --function-name KinesisLambdaConsumerPlayground --event-source-arn arn:aws:kinesis:us-east-1:804462227831:stream/KinesisStreamPlayground --starting-position LATEST
{
    "UUID": "32913be6-a2b0-47a0-b325-75b3e85fc5ea",
    "StartingPosition": "LATEST",
    "BatchSize": 100,
    "MaximumBatchingWindowInSeconds": 0,
    "ParallelizationFactor": 1,
    "EventSourceArn": "arn:aws:kinesis:us-east-1:804462227831:stream/KinesisStreamPlayground",
    "FunctionArn": "arn:aws:lambda:us-east-1:804462227831:function:KinesisConsumerPlayground",
    "LastModified": "2023-05-20T09:50:52.631000-04:00",
    "LastProcessingResult": "No records processed",
    "State": "Creating",
    "StateTransitionReason": "User action",
    "DestinationConfig": {
        "OnFailure": {}
    },
    "MaximumRecordAgeInSeconds": -1,
    "BisectBatchOnFunctionError": false,
    "MaximumRetryAttempts": -1,
    "TumblingWindowInSeconds": 0,
    "FunctionResponseTypes": []
}
Sunnys-iMac:KinesisDataStream jinlianwang$ ./putRecords.sh KinesisStreamPlayground
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425371285803117693577348513794"
}
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425372494728937308206523219970"
}
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425373703654756922973136879618"
}
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425374912580576537671031062530"
}
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425376121506396152300205768706"
}
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425377330432215766929380474882"
}
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425378539358035381627274657794"
}
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425379748283854996325168840706"
}
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425380957209674610954343546882"
}
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49640939152828312488948265425382166135494225720957206530"
}


