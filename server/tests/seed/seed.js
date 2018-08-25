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
  password: 'password2'
}];

const populateUsers = (done) => {
  User.remove().then(() => {
    return User.insertMany(usersList);
  }).then(() => done());
};


const todosList = [{
  _id: new ObjectID,
  text: 'First test todo'
}, {
  _id: new ObjectID,
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todosList);
  }).then(() => done());
};

module.exports = {populateUsers, usersList, populateTodos, todosList}