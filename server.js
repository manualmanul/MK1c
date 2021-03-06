const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const shortid = require('shortid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const { check, validationResult } = require('express-validator');

// Set some defaults (required if your JSON file is empty)
db.defaults({ scripts: [], count: 0 }).write();

app.listen(9999, () => {
  console.log('Started on PORT 9999');
});

app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
  const count = db.get('count').value();
  res.render('index', { count: count });
});

app.get('/s/c/:scriptId', function (req, res) {
  const script = db.get('scripts').find({ id: req.params.scriptId }).value();
  if (Object.is(script, undefined)) {
    res.sendStatus(404);
  } else {
    db.get('scripts')
      .find({ id: req.params.scriptId })
      .update('downloads', (n) => n + 1)
      .write();
    res.send(script.code);
  }
});

app.get('/s/:scriptId', function (req, res) {
  const script = db.get('scripts').find({ id: req.params.scriptId }).value();
  if (Object.is(script, undefined)) {
    res.sendStatus(404);
  } else {
    res.render('get', { script: script });
  }
});

app.post('/s/api/new', [
    check('trigger').isLength({ min: 3 }).trim().escape(),
    check('name').isLength({ min: 3 }).trim().escape(),
    check('description').isLength({ min: 3 }).trim().escape()
  ],function (req, res) {
  const newId = shortid.generate();
  db.get('scripts')
    .push({
      id: newId,
      ip:
        req.headers['cf-connecting-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress,
      downloads: 0,
      date: new Date(),
      trigger: req.body.trigger,
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
    })
    .write();
  db.update('count', (n) => n + 1).write();
  res.send(newId);
});
