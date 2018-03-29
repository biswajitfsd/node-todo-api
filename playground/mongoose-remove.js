const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/modles/todo');
const {User} = require('./../server/modles/user');

//These are 3 kind of remove methods
//Todo.remove
// Todo.findOneAndRemove
// Todo.findByIdAndRemove

// To remove all from a specific collection
// Todo.remove({}).then((result) => {
//   console.log(result);
// });

// To remove element by id which will be the first one
var id = '5abcb9d2e23fbf24b072679c';
Todo.findOneAndRemove({_id: id}).then((todo) => {
  console.log(todo);
});

// To remove specific element by id
var id = '5abcb91227baea26f07783f2';
Todo.findByIdAndRemove(id).then((todo) => {
  console.log(todo);
});
