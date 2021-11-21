const crypto = require("crypto");

exports.tokenizeAccount = function (account) {
        return crypto.randomBytes(20).toString('hex').substr(0, account.length);
}

