const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const todosList = [{
  _id: new ObjectID,
  text: 'First test todo'
}, {
  _id: new ObjectID,
  text: 'Second test todo'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todosList);
  }).then(() => done());
});


describe('POST /todos', () => {

  it('should create a new todo', (done) => {
    let text = 'Testing todo-test';
    
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find({text}).then( (todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((err) => done(err));

      })
  });


});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

const usersList = [{
  _id: new ObjectID,
  email: 'example@example.com'
},{
  _id: new ObjectID,
  email: 'example2@example.com'
}];

beforeEach((done) => {
  User.remove().then(() => {
    return User.insertMany(usersList);
  }).then(() => done());
});

describe('POST /users', () => {

  it('should create a new user', (done) => {
    let email = 'rabi@gmail.com' 
    request(app)
      .post('/users')
      .send({ email })
      .expect(200)
      .expect( (res) => {
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        
        User.find({email}).then((users) => {
          expect(users.length).toBe(1);
          expect(users[0].email).toBe(email);
          done();
        }).catch((err) => done(err));

      });
  });

  it('should not create a new user with invalid body data', (done) => {
    request(app)
      .post('/users')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        User.find().then((users) => {
          expect(users.length).toBe(2);
          done();
        }).catch((err) => done(err));
      });
  });

});

describe('GET /users', () => {
  it('should get all the users', (done) => {
    request(app)
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.users.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {

  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todosList[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todosList[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {

    request(app)
      .get(`/users/${ (new ObjectID).toHexString() }`)
      .expect(404)
      .end(done);

  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/user/123`)
      .expect(404)
      .end(done);
  });

});


describe('GET /user/:id', () => {
  it('should return user doc', (done) => {
    request(app)
      .get(`/users/${usersList[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.user.email).toBe(usersList[0].email);
      })
      .end(done);
  });

  it('should return 404 if user not found', (done) => {
    request(app)
      .get(`/users/${(new ObjectID).toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/users/123456')
      .expect(404)
      .end(done);
  });

});