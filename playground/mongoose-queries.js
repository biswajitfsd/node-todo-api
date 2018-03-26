const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/modles/todo');
const {User} = require('./../server/modles/user');

var id = '5ab65d3325ec6c140fa01f09'; //'5ab8f5ba7f5eaf317aee983ff';
//
// if(!ObjectID.isValid(id)) {
//   console.log('Id is not valid');
// }

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//   if(!todo) {
//     return console.log('Id not found');
//   }
//   console.log('FindById', todo);
// }).catch((e) => {
//   console.log(e);
// });
User.findById(id).then((user) => {
  if(!user) {
    return console.log('Id not found');
  }
  console.log(JSON.stringify(user, undefined, 2));
  // console.log('FindById', user);
}).catch((e) => {
  console.log(e);
});
