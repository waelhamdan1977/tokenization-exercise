const express = require('express')


const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.text());

tokenizeController = require('./controllers/tokenizeController');


app.get('/findAll', tokenizeController.findAll);

app.post('/tokenize', tokenizeController.tokenize);
app.post('/detokenize', tokenizeController.detokenize);

app.listen(3000, function () {
    console.log('Web api is listening on port 3000');
});