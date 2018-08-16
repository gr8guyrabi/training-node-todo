const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
  if(err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  
  console.log('Connected to MongoDB server.');

  const db = client.db('TodoApp');

  // db.collection('Todos').findOneAndUpdate({ _id: new ObjectID('5b74d95a4baf165f0535705f') },{
  //   $set: {
  //     completed: true
  //   }
  // }, {
  //   returnOriginal: false
  // }).then((result) => {
  //   console.log(JSON.stringify(result, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to update todo.');
  // });

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5b74d09b4baf165f05357057')
  },{
    $set: {
      name: 'JavaScript'
    },
    $inc: {
      age: 1
    }
  },{
    returnOriginal: false
  }).then((result) => {
    console.log(JSON.stringify(result, undefined, 2))
  }, (err) => {
    console.log('Unable to update user.');
  });

  // client.close();

});