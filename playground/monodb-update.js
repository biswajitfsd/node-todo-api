const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => { //v3
  if (err) {
    return console.log('Unable to connect to mongodb server');
  }
  console.log('Connected to mongodb server');
  const db = client.db('TodoApp'); //v3

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5ab246623f7c4744e83295c6')
  }, {
    $set: {
      complete: false
    },
    $inc: {
      age: -4
    }
  }, {
    returnOriginal: false
  }).then((result) => {
    console.log(result);
  });
  client.close(); //v3
});
