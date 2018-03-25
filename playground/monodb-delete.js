const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => { //v3
  if (err) {
    return console.log('Unable to connect to mongodb server');
  }
  console.log('Connected to mongodb server');
  const db = client.db('TodoApp'); //v3

  //delete many
  // db.collection('Todos').deleteMany({complete: 'I am in jungle'}).then((result) => {
  //   console.log(result);
  // });
  // db.collection('Users').deleteMany({location: 'HSR'}).then((result) => {
  //   console.log(result);
  // });
  //delete one
  // db.collection('Todos').deleteOne({complete: 'I am in'}).then((result) => {
  //   console.log(result);
  // });
  // db.collection('Users').deleteOne({age: 35}).then((result) => {
  //   console.log(result);
  // });
  //find one and delete
  // db.collection('Todos').findOneAndDelete({complete: 'I am in'}).then((result) => {
  //   console.log(result);
  // });
  db.collection('Users').findOneAndDelete({_id: 123}).then((result) => {
    console.log(result);
  });

  client.close(); //v3
});
