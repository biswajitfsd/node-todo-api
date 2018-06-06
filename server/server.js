require('./config/config');

// lib Imprts
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const quickemailverification = require('quickemailverification').client('71b1f275b8c406910f7ea8fc76f16de79bd1d0ba011b79449b2a4be8bf1f').quickemailverification();

// local imports
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./modles/todo');
var {User} = require('./modles/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
app.use(bodyParser.json());

var port = process.env.PORT;

// app.use(express.static(publicPath));

// Email validation
app.post('/email-varify', (req, res) => {  
  console.log("email-varify");
  console.log(req.body);
  quickemailverification.verify( req.body.email, function (err, response) {
    // Print response object
    console.log(response);
    res.status(200).send(response.body);
  });
})

app.post('/todos', authenticate, (req, res) => {
  // console.log(req.body);
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req,res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({
      todos
    });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req,res) => {
  if(!ObjectID.isValid(req.params.id)) {
    console.log('Id is not valid');
    return res.status(404).send();
  }
  Todo.findOne({
    _id: req.params.id,
    _creator: req.user._id
  }).then((todo) => {
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

app.delete('/todos/:id', authenticate, (req,res) => {
  if(!ObjectID.isValid(req.params.id)) {
    console.log('Id is not valid');
    return res.status(404).send();
  }
  Todo.findOneAndRemove({
    _id: req.params.id,
    _creator: req.user._id
  }).then((todo) => {
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

app.patch('/todos/:id', authenticate, (req,res) => {
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

  Todo.findOneAndUpdate(
    {_id: id,
    _creator: req.user._id},
    {$set: body},
    {new: true} 
  ).then((todo) => {
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

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email','password']);
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.delete('/users/me/token', authenticate, (req,res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send('User loged out successfully.');
  }), () => {
    res.status(400).send();
  };
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

module.exports = {app};
