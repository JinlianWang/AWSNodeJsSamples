exports.handler = async (event, context) => {
    // Filter out records where 'filterField' equals 'filterValue'
    const filteredRecords = event.records.filter(record => {
        const payload = new Buffer.from(record.data, 'base64').toString('utf8');
        let obj = JSON.parse(payload);
        
        return obj.filterField !== 'filterValue';
    });

    filteredRecords.forEach(record => {
        console.log(`Processing record with id: ${record.recordId}`);

        // Kinesis Firehose data is base64 encoded
        const payload = new Buffer.from(record.data, 'base64').toString('utf8');
        
        let obj = JSON.parse(payload);
        
        // rename key "oldKeyName" to "newKeyName"
        if(obj.hasOwnProperty('oldKeyName')) {
            obj['newKeyName'] = obj['oldKeyName'];
            delete obj['oldKeyName'];
        }

        // remove unwanted field
        delete obj.unwantedField;
        
        let newPayload = JSON.stringify(obj);
        
        // encode and assign the transformed data back to the record
        record.data = Buffer.from(newPayload).toString('base64');
        
        // update the result status
        record.result = 'Ok';
    });
    return {records: filteredRecords};
};
