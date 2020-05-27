const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.listen(9999, () => {
  console.log('Started on PORT 9999');
});

app.use(bodyParser.json());

app.get('/', function (req, res) {
  console.log("Got request", req.originalUrl)
  res.sendFile('/home/web/index.html');
});

app.get('/script/test', function (req, res) {
  res.send('<a href="mk1://ext-script/https://mk1a.catto.io/s/test?id=0&name=HardcodedTest&trigger=DEVICE-LOCK" style="font-size: 48;">Click here to test</a>')
});

app.get('/s/c/0', function (req, res) {
  res.send('alert("Success")\n')
});

app.get('/', function (req, res) {
  res.sendFile('index.html');
});

app.post('/s/api/new', function (req, res) {
  console.log("Got request", req.originalUrl)
  console.log(req.body);
  res.send('test');
});
