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
// app.get('/email-varify/:email', (req, res) => {
//   console.log("email-varify");
//   console.log(req.params.email);
//   quickemailverification.verify( req.params.email, function (err, response) {
//     res.setHeader('X-Frame-Options', 'ALLOWALL');
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     // Print response object
//     console.log(response);
//     if (response.body.safe_to_send === "true") {
//       res.status(200).send(response.body);
//     } else {
//       res.status(400).send(response.body);
//     }
//
//   });
// })

app.post('/todos', authenticate, async (req, res) => {
  try {
    const todo =  new Todo({
      text: req.body.text,
      _creator: req.user._id
    });
    const doc = await todo.save()
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
  // console.log(req.body);
  // var todo = new Todo({
  //   text: req.body.text,
  //   _creator: req.user._id
  // });
  //
  // todo.save().then((doc) => {
  //   res.send(doc);
  // }, (e) => {
  //   res.status(400).send(e);
  // });
});

app.get('/todos', authenticate, async (req,res) => {
  try {
    const todos = await Todo.find({
      _creator: req.user._id
    });
    res.send({
      todos
    });
  } catch (e) {
    res.status(400).send(e);
  }
  // Todo.find({
  //   _creator: req.user._id
  // }).then((todos) => {
  //   res.send({
  //     todos
  //   });
  // }, (e) => {
  //   res.status(400).send(e);
  // });
});

app.get('/todos/:id', authenticate, async (req,res) => {
  if(!ObjectID.isValid(req.params.id)) {
    console.log('Id is not valid');
    return res.status(404).send();
  }
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      _creator: req.user._id
    });
    if(!todo) {
      console.log('Id not found');
      return res.status(404).send();
    }
    res.send({todo});
  } catch (e) {
    res.status(400).send();
  }
  // Todo.findOne({
  //   _id: req.params.id,
  //   _creator: req.user._id
  // }).then((todo) => {
  //   if(!todo) {
  //     console.log('Id not found');
  //     return res.status(404).send();
  //   }
  //   console.log(JSON.stringify(todo, undefined, 2));
  //   res.send({todo});
  // }).catch((e) => {
  //   console.log(e);
  //   res.status(400).send();
  // });
});

app.delete('/todos/:id', authenticate, async (req,res) => {
  if(!ObjectID.isValid(req.params.id)) {
    return res.status(404).send();
  }
  try {
    const todo = await Todo.findOneAndRemove({
      _id: req.params.id,
      _creator: req.user._id
    });
    if(!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  } catch (e) {
    res.status(400).send();
  }
  // Todo.findOneAndRemove({
  //   _id: req.params.id,
  //   _creator: req.user._id
  // }).then((todo) => {
  //   if(!todo) {
  //     console.log('Id not found');
  //     return res.status(404).send();
  //   }
  //   console.log(JSON.stringify(todo, undefined, 2));
  //   res.send({todo});
  // }).catch((e) => {
  //   console.log(e);
  //   res.status(400).send();
  // });
});

app.patch('/todos/:id', authenticate, async (req,res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);

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

  try {
    const todo = await Todo.findOneAndUpdate({_id: id,
      _creator: req.user._id},
      {$set: body},
      {new: true});
    if(!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  } catch (e) {
    res.status(400).send();
  }

  // Todo.findOneAndUpdate(
  //   {_id: id,
  //   _creator: req.user._id},
  //   {$set: body},
  //   {new: true}
  // ).then((todo) => {
  //   if(!todo) {
  //     return res.status(404).send();
  //   }
  //   res.send({todo});
  // }).catch((e) => {
  //   res.status(400).send();
  // });
});

app.post('/users', async (req,res) => {
  try {
    const body = _.pick(req.body, ['email','password']);
    const user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
  // var body = _.pick(req.body, ['email','password']);
  // // var user = new User({
  // //   email: body.email,
  // //   password: body.password
  // // });
  // var user = new User(body);
  //
  // user.save().then(() => {
  //   return user.generateAuthToken();
  //   // res.send(data);
  // }).then((token) => {
  //   res.header('x-auth', token).send(user);
  // }).catch((e) => {
  //   res.status(400).send(e);
  // });
});

app.get('/users/me', authenticate, async (req, res) => {
  res.send(req.user);
});

app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email','password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
  // var body = _.pick(req.body, ['email','password']);
  // User.findByCredentials(body.email, body.password).then((user) => {
  //   return user.generateAuthToken().then((token) => {
  //     res.header('x-auth', token).send(user);
  //   });
  // }).catch((e) => {
  //   res.status(400).send(e);
  // });
});

app.delete('/users/me/token', authenticate, async (req,res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send('User loged out successfully.');
  } catch (e) {
    res.status(400).send();
  }
  // req.user.removeToken(req.token).then(() => {
  //   res.status(200).send('User loged out successfully.');
  // }), () => {
  //   res.status(400).send();
  // };
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

module.exports = {app};
