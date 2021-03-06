const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {populateUsers, usersList, populateTodos, todosList} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos', () => {

  it('should create a new todo', (done) => {
    let text = 'Testing todo-test';
    
    request(app)
      .post('/todos')
      .set('x-auth', usersList[0].tokens[0].token)
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
      .set('x-auth', usersList[0].tokens[0].token)
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
      .set('x-auth', usersList[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});




describe('GET /todos/:id', () => {

  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todosList[0]._id.toHexString()}`)
      .set('x-auth', usersList[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todosList[0].text);
      })
      .end(done);
  });

  it('should not return a todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todosList[1]._id.toHexString()}`)
      .set('x-auth', usersList[0].tokens[0].token)
      .expect(404)
      .expect( (res) => {
        expect(res.body).toEqual({});
      }).end(done);
  });

  it('should return 404 if todo not found', (done) => {

    request(app)
      .get(`/users/${ (new ObjectID).toHexString() }`)
      .set('x-auth', usersList[0].tokens[0].token)
      .expect(404)
      .end(done);

  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/user/123`)
      .set('x-auth', usersList[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

});

describe('DELETE /todos/:id', () => {

  it('should not remove a todo created by other user', (done) => {
    let hexId = todosList[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', usersList[1].tokens[0].token)
      .expect(404)
      .expect( (res) => {
        expect(res.body.todo).toBeFalsy();
      } )
      .end( (err, res) => {
        if(err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo)
            .toBeTruthy();
            done();
        }).catch((err) => done());

      });
  });

  it('should remove a todo', (done) => {
    let hexId = todosList[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', usersList[1].tokens[0].token)
      .expect(200)
      .expect( (res) => {
        expect(res.body.todo._id).toBe(hexId);
      } )
      .end( (err, res) => {
        if(err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo)
            .toNotExist();
            done();
        }).catch((err) => done());

      });
  });

  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', usersList[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if ObjectID is invalid', (done) => {
    let hexId = '12345621315';
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', usersList[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/id', () => {
  it('should not update the todo created by other user', (done) => {
    let hexId = todosList[0]._id.toHexString();
    let updateBody = {
      completed: true,
      text : 'Update text by PATCH'
    };
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', usersList[1].tokens[0].token)
      .send(updateBody)
      .expect(404)
      .expect( (res) => {
        expect(res.body.todo).toBeFalsy();
      })
      .end(done);

  });

  it('should update the todo', (done) => {
    let hexId = todosList[0]._id.toHexString();
    let updateBody = {
      completed: true,
      text : 'Update text by PATCH'
    };
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', usersList[0].tokens[0].token)
      .send(updateBody)
      .expect(200)
      .expect( (res) => {
        expect(res.body.todo.text).toBe(updateBody.text);
        expect(res.body.todo.completed).toBe(updateBody.completed);
        // expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);

  });

  it('should clear completedAt when todo is not completed', (done) => {
    let hexId = todosList[1]._id.toHexString();
    let updateBody = {
      completed: false,
      text: 'Updated from PATCH!!'
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', usersList[1].tokens[0].token)
      .send(updateBody)
      .expect(200)
      .expect( (res) => {
        expect(res.body.todo.text).toBe(updateBody.text);
        expect(res.body.todo.completed).toBe(updateBody.completed);
        // expect(res.body.todo.completedAt).toNotExist();
      } )
      .end(done);

  });
});


/*
  describe('POST /users', () => {

    it('should create a new user', (done) => {
      let email = 'rabi@gmail.com';
      let password = 'password1';
      data = {
        email,
        password
      }
      request(app)
        .post('/users')
        .send(data)
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
        .expect(401)
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

  describe('DELETE /users/:id', () => {
    it('should remove a user', (done) => {
      
      let hexId = usersList[0]._id.toHexString();
      request(app)
        .delete(`/users/${hexId}`)
        .expect(200)
        .expect( (res) => {
          expect(res.body.user._id).toBe(hexId);
        } )
        .end( (err, res) => {
          if(err) {
            return done(err);
          }

          User.findById(hexId).then((user) => {
            expect(user)
              .toNotExist();
              done();
          }).catch((err) => done());
        } );
    });

    it('should return 404 if user not found', (done) => {
      let hexId = new ObjectID().toHexString();
      request(app)
        .delete(`/users/${hexId}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
      let hexId = '12346864135';
      request(app)
        .delete(`/users/${hexId}`)
        .expect(404)
        .end(done);
    });

  });

*/

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    let token = usersList[0].tokens[0].token;
    request(app)
      .get('/users/me')
      .set('x-auth', token)
      .expect(200)
      .expect( (res) => {
        expect(res.body._id).toBe(usersList[0]._id.toHexString());
        expect(res.body.email).toBe(usersList[0].email);
      })
      .end((err) => done(err));

  });

  it('should return 401 if not authenticated', (done) => {
    
    request(app)
      .get('/users/me')
      .expect(401)
      .expect( (res) => {
        expect(res.body).toEqual({});
      })
      .end(done);

  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    let email = 'some@example.com';
    let password = 'hahayoyo!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect( (res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end( (err) => {
        if(err) {
          return done(err);
        }
        User.findOne({email}).then( (user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return validation error if request invalid', (done) => {
    let email = 'soma';
    let password = 'hass';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    let email = usersList[1].email;
    let password = 'password1';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    let email = usersList[1].email;
    let password = usersList[1].password;
    let data = {email, password};
    request(app)
      .post('/users/login')
      .send(data)
      .expect(200)
      .expect( (res) => {
        expect(res.header['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        User.findById(usersList[1]._id).then((user) => {
          expect(user.tokens[0]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((err) => done(err));
      });
  });

  it('should reject invalid login', (done) => {
    let email = usersList[1].email;
    let password = usersList[1].password + '1';
    let data = {email, password};
    request(app)
      .post('/users/login')
      .send(data)
      .expect(400)
      .expect( (res) => {
        expect(res.body).toEqual({});
      })
      .end( (err, res) => {
        if(err) {
          return done(err);
        }

        User.findById(usersList[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', usersList[0].tokens[0].token)
      .expect(200)
      .expect( (res) => {
        expect( res.body.token).toBeFalsy();
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        User.findById(usersList[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((err) => done(err));
      });
  });
});