const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
  if(err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  
  console.log('Connected to MongoDB server.');

  const db = client.db('TodoApp');

  // deleteMany

  // db.collection('Todos').deleteMany({ text: 'Eat Lunch' }).then((result) => {
  //   console.log(result);
  // }, (err) => {
  //   console.log('Unable to delete todos.');
  // });

  // db.collection('Users').deleteMany( { name: 'Rabi Maharjan' } ).then((result) => {
  //   console.log(result);
  // }, (err) => {
  //   console.log('Unable to delete user(s).');
  // });
  
  // deleteOne

  // db.collection('Todos').deleteOne({ text: 'Eat Lunch' }).then((result) => { console.log(result); }, (err) => {
  //     console.log('Unable to delete todo.');
  //   });

  // db.collection('Users').deleteOne({name: 'Rabi'}).then((result) => { console.log(result); }, (err) => {
  //       console.log('Unable to delete user.');
  //     });


  // findOneAndDelete

  // db.collection('Todos').findOneAndDelete({ completed: false }).then((result) => {
  //   console.log(JSON.strigify(result, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to find todo.');
  // });

  // db.collection('Users').findOneAndDelete({_id: new ObjectID('5b74d0894baf165f05357056')}).then((result) => {
  //     console.log(JSON.strigify(result, undefined, 2));
  //   }, (err) => {
  //     console.log('Unable to find user.');
  //   });


  // client.close();

});