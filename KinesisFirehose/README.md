This project is to play with Kinesis Firehose. 

1. Create a Lambda function called "KensisFirehoseTransformer" using code as in index.js; 
2. Create a firehose called "KinesisFirehosePlayground" and set up its transformation Lambda function to be the function created above; Also set the target destination of firehose to be a S3 bucket; 
3. Run putRecords.sh to put 10 records to the firehouse. 
4. Wait for a few minutes (depending on the buffer time/size of firehose), there is some json file created in S3 bucket with folder structure of `/prefix/YYYY/MM/DD/HH/` in the following format: 

```
{"filterField":"1CE1DC46-B9E3-4A2B-9945-524610337A99","newKeyName":"0E709EAD-A492-43CB-BFF3-382B783907C2"}
```


