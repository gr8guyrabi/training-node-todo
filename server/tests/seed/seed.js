const {ObjectID} = require('mongodb');
const {User} = require('./../../models/user');
const {Todo} = require('./../../models/todo');
const jwt = require('jsonwebtoken');


const userOneId = new ObjectID;
const userTwoId = new ObjectID;

const usersList = [{
  _id: userOneId,
  email: 'example@example.com',
  password: 'password1',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId }, 'somesecret' ).toString()
  }]
},{
  _id: userTwoId,
  email: 'example2@example.com',
  password: 'password2',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId }, 'somesecret' ).toString()
  }]
}];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(usersList[0]).save();
    let userTwo = new User(usersList[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};


const todosList = [{
  _id: new ObjectID,
  text: 'First test todo',
  _creator: userOneId,
}, {
  _id: new ObjectID,
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId,
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todosList);
  }).then(() => done());
};

module.exports = {populateUsers, usersList, populateTodos, todosList}