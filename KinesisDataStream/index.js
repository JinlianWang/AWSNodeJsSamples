const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const parquet = require('parquetjs-lite');
const fs = require('fs');
const s3Bucket = process.env.S3_BUCKET;
const outputFormat = process.env.OUTPUT_FORMAT;

exports.handler = async function (event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const date = new Date();
    const folderName = `${outputFormat}/${date.getUTCFullYear()}/${('0' + (date.getUTCMonth() + 1)).slice(-2)}/${('0' + date.getUTCDate()).slice(-2)}/${('0' + date.getUTCHours()).slice(-2)}/${('0' + date.getUTCMinutes()).slice(-2)}`;

    let records = event.Records.map(record => {
        let payload = Buffer.from(record.kinesis.data, 'base64').toString('ascii');
        let jsonPayload = JSON.parse(payload);
        if (jsonPayload.filterField !== 'value') {
            delete jsonPayload.unwantedField;
            jsonPayload.newKeyName = jsonPayload.oldKeyName;
            delete jsonPayload.oldKeyName;
            return jsonPayload;
        }
    }).filter(record => record !== undefined);

    let fileName = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;  // Create a random file name

    if (outputFormat === "json") {
        const params = {
            Body: records.map(record => JSON.stringify(record)).join('\n'),
            Bucket: s3Bucket,
            Key: `${folderName}/${fileName}.json`,
        };
        await S3.putObject(params).promise();
    } else if (outputFormat === "parquet") {
        let schema = new parquet.ParquetSchema({
            filterField: { type: 'UTF8' },
            newKeyName: { type: 'UTF8' },
        });

        let localFile = `/tmp/${fileName}.parquet`;
        let writer = await parquet.ParquetWriter.openFile(schema, localFile);
        records.forEach(record => writer.appendRow(record));
        await writer.close();

        const data = fs.readFileSync(localFile);
        const params = {
            Body: data,
            Bucket: s3Bucket,
            Key: `${folderName}/${fileName}.parquet`,
        };
        await S3.putObject(params).promise();
    }

    console.log(`Processed ${records.length} records.`);
}
