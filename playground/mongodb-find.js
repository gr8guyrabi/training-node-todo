const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true}, (err, client) => {
  if(err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server.');

  const db = client.db('TodoApp');
  
  db.collection('Todos').find().toArray().then((result) => { console.log('Fetching all the todos data.'); console.log(JSON.stringify(result, undefined, 2)); }, (err) => { console.log('Unable to fetch todos. ', err) });

  db.collection('Todos').find( { completed: false } ).toArray().then((result) => { console.log('Fetching incomplete todos: '); console.log(JSON.stringify(result, undefined, 2)) }, (err) => { console.log('Unable to fetch todos.') });

  db.collection('Users').find().toArray().then((result) => { console.log('Fetching all the users'); console.log(JSON.stringify(result, undefined, 2)) }, (err) => { console.log('Unable to fetch users. ', err) });

  db.collection('Users').find( { _id: new ObjectID('5b744e499eb063691459af04') } ).toArray().then((result) => { console.log('Fetching user by ID: '); console.log(JSON.stringify(result, undefined, 2)); }, (err) => { console.log('Unable to fetch user.'); })

  // client.close();

});