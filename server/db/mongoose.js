const mongoose = require('mongoose');


// mongoose.connect('mongodb://nodeTodos:Todos@123@ds123532.mlab.com:23532/node-todos-app', { useNewUrlParser: true });

mongoose.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true });

mongoose.Promise = global.Promise;

module.exports = { mongoose };