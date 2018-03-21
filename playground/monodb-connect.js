// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => { //v2
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => { //v3
  if (err) {
    return console.log('Unable to connect to mongodb server');
  }
  console.log('Connected to mongodb server');
  const db = client.db('TodoApp'); //v3

  // db.collection('Todos').insertOne({
  //   text: "I am the first entry",
  //   complete: 'I am in'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log("Unable to insert data", err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });
  // db.collection('Users').insertOne({
  //   name: "Biswajit Patra",
  //   age: 25,
  //   location: "HSR"
  // }, (err, result) => {
  //   if (err) {
  //     return console.log("Unable to insert user data", err);
  //   }
  //   console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
  //
  // });

  // db.close(); //v2
  client.close(); //v3
});
