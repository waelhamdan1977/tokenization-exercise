const loki = require('lokijs'),
    db = new loki('./data/loki.db');

const Q = require('q');

exports.findAll = function () {
    const deferred = Q.defer();

    db.loadDatabase({}, function () {

        try {
            deferred.resolve(db.getCollection('data').data);
        } catch (err) {
            deferred.reject(err);
        }
    });

    return deferred.promise;
}

exports.findByTokenized = function (tokenized) {
    const deferred = Q.defer();

    db.loadDatabase({}, function () {
        try {
            const item = db.getCollection('data')
                .find({'tokenized': {'$in': tokenized}});

            deferred.resolve(item);
        } catch (err) {
            deferred.reject(err);
        }
    });

    return deferred.promise;
}

exports.insert = function (item) {
    const deferred = Q.defer();

    try {
        db.loadDatabase({}, function () {
            const doc = db.addCollection('data').insert(item);
            db.save();
            deferred.resolve(doc);
        });
    } catch (err) {
        deferred.reject(err);
    }

    return deferred.promise;
}