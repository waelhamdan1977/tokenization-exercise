const tokenizeDb = require('../repositories/tokenizeRepository');
const tokenizeService = require('../services/tokinzeService');


exports.findAll = function (request, response, next) {
    return tokenizeDb.findAll()
        .then(function (data) {
            response.send(data);
        }).catch(function (err) {
            next(err);
        });
}


exports.tokenize = function (request, response, next) {
    let myRequest = [];
    let myResponse = [];

    const accounts = JSON.parse(request.body);
    for (let i = 0; i < accounts.length; i++) {
        const doc = {original: accounts[i], tokenized: tokenizeService.tokenizeAccount(accounts[i])};
        myRequest.push(doc);
        myResponse.push(doc.tokenized);
    }
    return tokenizeDb.insert(myRequest)
        .then(() => {
            response.status(201).send(myResponse);
        }).catch((err) => {
            next(err);
        });

}

exports.detokenize = function (request, response, next) {
    const myResponse = [];
    const accounts = JSON.parse(request.body);
    let doc;

    return tokenizeDb.findByTokenized(accounts)
        .then(function (data) {

            if (data === undefined || data.length === 0) {
                response.sendStatus(404);
                return;
            }

            doc = data;
            for (let i = 0; i < doc.length; i++) {
                myResponse.push(doc[i].original);

            }
            response.send(myResponse);

        }).catch(function (err) {
            next(err);
        });

}




