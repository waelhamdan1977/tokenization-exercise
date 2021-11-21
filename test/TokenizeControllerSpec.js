require('mocha');
let
    expect = require('chai').expect,
    httpMocks = require('node-mocks-http'),
    proxy = require('proxyquire'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');
expect = require('chai').use(sinonChai).expect;

let tokenizeController = require('../controllers/tokenizeController');
const tokenizeService = require('../services/tokinzeService');

describe('tokenizeController', () => {

    let repoStub;
    let request, response, testData;
    beforeEach(() => {

        request = httpMocks.createRequest();
        response = httpMocks.createResponse();

        testData = [
            {
                "original": "4111-1111-1111-1111",
                "tokenized": "39c24cac64a8cccff45",
                "meta": {
                    "revision": 0,
                    "created": 1637446948565,
                    "version": 0
                },
                "$loki": 1
            },
            {
                "original": "4444-3333-2222-1111",
                "tokenized": "4b582f0bec80aefa52f",
                "meta": {
                    "revision": 0,
                    "created": 1637446948565,
                    "version": 0
                },
                "$loki": 2
            },
            {
                "original": "4444-1111-2222-3333",
                "tokenized": "4f4d887724e0856b02f",
                "meta": {
                    "revision": 0,
                    "created": 1637446948565,
                    "version": 0
                },
                "$loki": 3
            }
        ];

        const findAll = sinon.stub().resolves(testData);
        const findByTokenized = sinon.stub().resolves(testData);
        const insert = sinon.stub();

        repoStub = {
            findAll: findAll,
            findByTokenized: findByTokenized,
            insert: insert
        };


        tokenizeController = proxy('../controllers/tokenizeController', {'../repositories/tokenizeRepository': repoStub});
    })


    describe('detoknize', () => {

        describe('when account is found', () => {

            const body = '["726e84e575e64bd9699", "d6556e9a15c81ab24d0", "360e60ec77cef2b836c"]';
            const expectedResponse = [
                "4111-1111-1111-1111",
                "4444-3333-2222-1111",
                "4444-1111-2222-3333"
            ];


            beforeEach(() => {
                request = httpMocks.createRequest({body: body});
                repoStub.insert.resolves(body);
            });

            it('should return 200 ok', () => {
                return tokenizeController.detokenize(request, response)
                    .then(() => {
                        expect(response.statusCode).to.equal(200);
                    }).catch((err) => {
                        throw err;
                    });
            });

            it('should only return the expected account', () => {
                return tokenizeController.detokenize(request, response)
                    .then(() => {
                        const actual = response._getData();
                        expect(actual).to.deep.equal(expectedResponse);
                    }).catch((err) => {
                        throw err;
                    });
            });
        });

        describe('when account is not found', () => {
            const body = '["726e84e575e64bd9699", "d6556e9a15c81ab24d0", "360e60ec77cef2b836c"]';

            beforeEach(() => {
                request = httpMocks.createRequest({body: body});
                repoStub.insert.resolves(body);
            });

            it('should return 404 not found', () => {
                repoStub.findByTokenized.resolves([]);

                return tokenizeController.detokenize(request, response)
                    .then(() => {
                        expect(response.statusCode).to.equal(404);
                    }).catch((err) => {
                        throw err;
                    });
            });
        });

    });

    describe('tokenize', () => {
        describe('when successful', () => {

            const body = '["4111-1111-1111-1111", "4444-3333-2222-1111", "4444-1111-2222-3333"]';
            const expectedResponse = [
                "37d1b598bb32aa4ce5c",
                "85b0deabfc9a1a56602",
                "c64e8f5456ff3637179"
            ]
            const insertedBody = [
                {original: '4111-1111-1111-1111', tokenized: '37d1b598bb32aa4ce5c'},
                {original: '4444-3333-2222-1111', tokenized: '85b0deabfc9a1a56602'},
                {original: '4444-1111-2222-3333', tokenized: 'c64e8f5456ff3637179'}
            ];

            sinon.stub(tokenizeService, "tokenizeAccount").withArgs("4111-1111-1111-1111").returns("37d1b598bb32aa4ce5c").
            withArgs("4444-3333-2222-1111").returns("85b0deabfc9a1a56602").
            withArgs("4444-1111-2222-3333").returns("c64e8f5456ff3637179");

            beforeEach(() => {
                request = httpMocks.createRequest({body: body});
                repoStub.insert.resolves(body);
            });

            it('inserts to the database', () => {
                return tokenizeController.tokenize(request, response)
                    .then(() => {
                        expect(repoStub.insert).to.have.been.calledOnce;
                        expect(repoStub.insert).to.have.been.calledWith(insertedBody);
                    }).catch((err) => {
                        throw err;
                    });
            });

            it('returns the new tokenized account in the response body', () => {
                return tokenizeController.tokenize(request, response)
                    .then(() => {
                        expect(response._getData()).to.deep.equal(expectedResponse);
                    }).catch((err) => {
                        throw err;
                    });
            });

            it('returns 201 created', () => {
                return tokenizeController.tokenize(request, response)
                    .then(() => {
                        expect(response.statusCode).to.equal(201);
                    }).catch((err) => {
                        throw err;
                    });
            });


        });

    });

});