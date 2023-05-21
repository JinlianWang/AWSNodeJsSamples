StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
StreamTableEnvironment tableEnv = StreamTableEnvironment.create(env);
tableEnv.executeSql(
    "CREATE TABLE kinesis_source (" +
    "   userId STRING," +
    "   timestamp AS TO_TIMESTAMP_LTZ(timestamp, 3)," +
    "   url STRING" +
    ") WITH (" +
    "   'connector' = 'kinesis'," +
    "   'stream' = '<your-stream-name>'," +
    "   'aws.region' = '<aws-region>'," +
    "   'scan.startup.mode' = 'earliest-offset'," +
    "   'format' = 'json'" +
    ")"
);
tableEnv.executeSql(
    "CREATE TABLE kinesis_sink (" +
    "   url STRING," +
    "   cnt BIGINT" +
    ") WITH (" +
    "   'connector' = 'kinesis'," +
    "   'stream' = '<your-sink-stream-name>'," +
    "   'aws.region' = '<aws-region>'," +
    "   'format' = 'json'" +
    ")"
);
tableEnv.executeSql(
    "INSERT INTO kinesis_sink" +
    "SELECT url, COUNT(url) as cnt" +
    "FROM kinesis_source" +
    "GROUP BY url, TUMBLE(timestamp, INTERVAL '10' MINUTE)"
);
