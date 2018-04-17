const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

var {Todo} = require('./../../modles/todo');
var {User} = require('./../../modles/user');

const userOneid = new ObjectID();
const userTwoid = new ObjectID();

const users = [{
  _id: userOneid,
  email: "bjipt@webe.co",
  password: "Biswak",
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneid, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoid,
  email: "bjipit@webe.co",
  password: "Biswaku",
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoid, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

const todos = [{
  _id: new ObjectID(),
  text: 'first test todo',
  _creator: userOneid
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoid
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
};

const populateUser = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  populateTodos,
  todos,
  users,
  populateUser
};
