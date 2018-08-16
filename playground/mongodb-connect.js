// const MongoClient = require('mongodb').MongoClient;

// ES6 Object Destructuring

const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true}, (err, client) => {
  if(err) {
    return console.log('Unable to connect to Mongodb Server');
  }

  console.log('Connected to Mongodb Server.');
  const db = client.db('TodoApp');

  db.collection('Todos').insertOne({
    text: 'Something to do',
    completed: false
  }, (err, result) => {
    if(err) {
      return console.log('Unable to create todo, ', err);
    }

    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  db.collection('Users').insertOne({
    name: 'Rabi Maharjan',
    age: 25,
    location: 'Harisiddhi, Lalitpur, Nepal'
  }, (err, result) => {
    if(err) {
      return console.log('Unable to create user, ', err);
    }

    console.log(JSON.stringify(result.ops, undefined, 2));

  });

  client.close();

});