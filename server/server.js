require('./config/config');


const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const bcrypt = require('bcryptjs');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate')

var app = express();
const port = process.env.PORT || 3000;


app.use(bodyParser.json());


app.post('/todos', authenticate, (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
  });

  todo.save().then((result) => {
    res.send(result);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id,
  }).then((todos) => {
    res.send({todos});
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Todo.findOne({
    _id: id, 
    _creator: req.user._id,
  }).then((todo) => {
    if(!todo) {
      return res.status(404).send();
    }
    return res.send({todo});
  }, (err) => {
    return res.status(400).send()
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id,
  }).then((todo) => {  
    if(!todo) {
      return res.status(404).send();
    }
    return res.send({todo});
  }, (err) => {
    return res.status(404).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id,
  }, {
    $set: body
  }, { new: true }).then((todo) => {
    if(!todo) {
      return res.status(404).send();
    }

    return res.send({ todo });

  }).catch((err) => {
    return res.status(400).send();
  })

});

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email','password']);
  let user = new User(body);

  user.save().then((user) => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.get('/users/me', authenticate, (req, res) => {
  return res.send(req.user);  
});

app.get('/users', (req, res) => {
  User.find().then((users) => {
    res.send({users});
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/users/:id', (req, res) => {
  let id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  User.findById(id).then((user) => {
    if(!user) {
      return res.status(404).send();
    }
    return res.send({user});
  }, (err) => {
    return res.status(400).send();
  });
});

app.delete('/users/:id', (req, res) => {
  let id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  User.findByIdAndRemove(id).then((user) => {
    if(!user) {
      return res.status(404).send();
    }
    return res.send({user});
  }, (err) => {
    return res.status(404).send();
  });
});

app.post('/users/login', (req, res) => {
  const data = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(data).then((user) => {
   user.generateAuthToken().then((token) => {
    res.header('x-auth', user.tokens[0].token).send(user);
   });
  }).catch((e) => {
    return res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.send();
  }, () => {
    res.status(400).send();
  });
});

module.exports = {app};