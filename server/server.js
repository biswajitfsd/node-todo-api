require('./config/config');

// lib Imprts
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

// local imports
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./modles/todo');
var {User} = require('./modles/user');

var app = express();
app.use(bodyParser.json());

var port = process.env.PORT;

app.post('/todos', (req, res) => {
  console.log(req.body);
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req,res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req,res) => {
  if(!ObjectID.isValid(req.params.id)) {
    console.log('Id is not valid');
    return res.status(404).send();
  }
  Todo.findById(req.params.id).then((todo) => {
    if(!todo) {
      console.log('Id not found');
      return res.status(404).send();
    }
    console.log(JSON.stringify(todo, undefined, 2));
    res.send({todo});
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });
});

app.delete('/todos/:id', (req,res) => {
  if(!ObjectID.isValid(req.params.id)) {
    console.log('Id is not valid');
    return res.status(404).send();
  }
  Todo.findByIdAndRemove(req.params.id).then((todo) => {
    if(!todo) {
      console.log('Id not found');
      return res.status(404).send();
    }
    console.log(JSON.stringify(todo, undefined, 2));
    res.send({todo});
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });
});

app.patch('/todos/:id', (req,res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)) {
    console.log('Id is not valid');
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if(!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/users', (req,res) => {
  var body = _.pick(req.body, ['email','password']);
  // var user = new User({
  //   email: body.email,
  //   password: body.password
  // });
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
    // res.send(data);
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

module.exports = {app};
