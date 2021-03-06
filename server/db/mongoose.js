const mongoose = require('mongoose');


// mongoose.connect('mongodb://nodeTodos:Todos@123@ds123532.mlab.com:23532/node-todos-app', { useNewUrlParser: true });

mongoose.connect( process.env.DATABASE || process.env.MONGODB_URI, { useNewUrlParser: true });

mongoose.Promise = global.Promise;

module.exports = { mongoose };