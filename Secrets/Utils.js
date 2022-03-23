const utils = {};

utils.generateResponse = function (statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            "Content-Type": "text/plain; charset=UTF-8"
        },
        body: body
    };
}

utils.generateJsonResponse = function(statusCode, res, data) {
    res.accountId = data.accountId;
    res.ops = data.ops;
    res.secretName = data.secretName;

    return {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(res)
    };
}

utils.validateBody = function (body) {

    try {
        let data = JSON.parse(body);
        let statusCode, responseText;

        if (data.ops != "create" && data.ops != "delete" && data.ops != "update" && data.ops != "read") {
            statusCode = 400;
            responseText = "Operation of " + data.ops + "is not supported for POST http method.";
        }

        if (data.accountId == null || data.secretName == null) {
            statusCode = 400;
            responseText = "Either accountId or secretName is not passed in POST body.";
        }

        if (data.ops == "create" || data.ops == "update") {
            if (data.username == null || data.password == null) {
                statusCode = 400;
                responseText = "Either username or password is not passed in POST body for secret creation or update.";
            }
        }
        if (statusCode != null) {
            return utils.generateResponse(statusCode, responseText);
        }
        return null;
    } catch (err) {
        return utils.generateResponse(500, "Cannot parse request body into JSON object. ");
    }
}

module.exports = utils;