const utils = {};

utils.generateResponse = function(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            "Content-Type": (statusCode == 200 ? "application/json" : "text/plain; charset=UTF-8")
        },
        body: body
    };
}

utils.validateBody = function(body) {

    try {
        let data = JSON.parse(body);
        let statusCode=200, responseText;

        if(data.ops != "create" && data.ops != "delete" && data.ops != "update") {
            statusCode = 400;
            responseText = "Operation of " + data.ops + "is not supported for POST http method.";
        }

        if(data.accountId == null || data.secretName == null) {
            statusCode = 400;
            responseText = "Either accountId or secretName is not passed in POST body.";
        }

        if(data.ops == "create" || data.ops == "update") {
            if(data.userName == null || data.password == null) {
                statusCode = 400;
                responseText = "Either userName or password is not passed in POST body for secret creation or update.";
            }
        }
        if(statusCode != 200) {
            return exports.generateResponse(statusCode, responseText);
        }
        return data;
    } catch(err) {
        return exports.generateResponse(500, "Cannot parse request body into JSON object. ");
    }
}

module.exports = utils;