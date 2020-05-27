const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const shortid = require('shortid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ scripts: [], count: 0 }).write();

app.listen(9999, () => {
  console.log('Started on PORT 9999');
});

app.use(bodyParser.json());

app.get('/script/test', function (req, res) {
  res.send(
    '<a href="mk1://ext-script/https://mk1a.catto.io/s/test?id=0&name=HardcodedTest&trigger=DEVICE-LOCK" style="font-size: 48;">Click here to test</a>'
  );
});

app.get('/s/c/:scriptId', function (req, res) {
  const script = db.get('scripts').find({ id: req.params.scriptId }).value();
  if (Object.is(script, undefined)) {
    res.sendStatus(404);
  } else {
    db.get('scripts')
      .find({ id: req.params.scriptId })
      .update('downloads', n => n + 1)
      .write();
    res.send(script.code);
  }
});

app.get('/s/:scriptId', function (req, res) {
  const script = db.get('scripts').find({ id: req.params.scriptId }).value();
  if (Object.is(script, undefined)) {
    res.sendStatus(404);
  } else {
    res.send(
      `<p><a href="mk1://ext-script/https://mk1a.catto.io/s/${script.id}?id=${script.id}&name=${script.name}&trigger=${script.trigger}" style="font-size: 48;">Click here to install ${script.name}</a> (${script.downloads} downloads)</p>`
    );
  }
});

app.post('/s/api/new', function (req, res) {
  const newId = shortid.generate();
  db
    .get('scripts')
    .push({
      id: newId,
      ip:
        req.headers['cf-connecting-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress,
      downloads: 0,
      trigger: req.body.trigger,
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
    })
    .write();
  db.update('count', n => n + 1)
    .write();
  res.send(newId);
});

app.get('/', function (req, res) {
  res.sendFile('index.html');
});
