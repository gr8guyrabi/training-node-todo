require('./config/config');


const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');


const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;


app.use(bodyParser.json());


app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((result) => {
    res.send(result);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (err) => {
    res.status(400).send(err);
  });
});

app.post('/users', (req, res) => {
  let user = new User({
    email: req.body.email
  });

  user.save().then((result) => {
    res.send(result);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/users', (req, res) => {
  User.find().then((users) => {
    res.send({users});
  }, (err) => {
    res.status(400).send(err);
  });
});


app.get('/todos/:id', (req, res) => {
  let id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Todo.findById(id).then((todo) => {
    if(!todo) {
      return res.status(404).send();
    }
    return res.send({todo});
  }, (err) => {
    return res.status(400).send()
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

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {  
    if(!todo) {
      return res.status(404).send();
    }
    return res.send({todo});
  }, (err) => {
    return res.status(404).send();
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


app.patch('/todos/:id', (req, res) => {
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

  Todo.findByIdAndUpdate(id, {
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


app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});


module.exports = {app};