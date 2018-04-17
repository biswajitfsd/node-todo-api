const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {app} = require('./../server');
var {Todo} = require('./../modles/todo');
var {User} = require('./../modles/user');
const {populateTodos, todos, users, populateUser} = require('./seed/seed');

beforeEach(populateUser);
beforeEach(populateTodos);


describe('POST /todos' , () => {
  it('Sould crete a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });
  it('Should not create todo with invalid body data', (done) => {
    var text = '';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('Sould get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todo/:id', () => {
  it('Sould get todos for the id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });
  it('Sould not get todos for the id cretaed by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Sould get 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}+a`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Sould get 404 for the id', (done) => {
    request(app)
      .get(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('Delete /todo/:id', () => {
  it('Should delete data related to id', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(todos[0]._id.toHexString()).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });
  it('Should not delete data related to id belongs other user', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(todos[0]._id.toHexString()).then((todo) => {
          expect(todo).toBeTruthy();
          done();
        }).catch((e) => done(e));
      });
  });
  it('Sould get 404 if todo not found', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}+a`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Sould get 404 for the id', (done) => {
    request(app)
      .delete(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', ()=> {

  it('Should update the todo', (done) => {
    var text = "I am in moca for test";
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text,
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        // expect(res.body.todo.completedAt).toBeA('number'); //Old test case
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findOne({
          _id: todos[0]._id.toHexString()
        }).then((todo) => {
          expect(todo.text).toBe(text);
          expect(todo.completed).toBe(true);
          expect(typeof res.body.todo.completedAt).toBe('number');
          // expect(todo.completedAt).toBeA(number);
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should not update the todo as user is different', (done) => {
    var text = "I am in moca for test";
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        text,
        completed: true
      })
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findOne({
          _id: todos[0]._id.toHexString()
        }).then((todo) => {
          expect(todo.text).toBe(todos[0].text);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should clear compleatedAt when todo is not completed', (done) => {
    var text = "I am in moca for test";
    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        text,
        completed: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(todos[1]._id.toHexString()).then((todo) => {
          expect(todo.text).toBe(text);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /users/me', () => {
  it('Should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('Should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});
describe('POST /users', () => {
  it('Should signup a authenticated user', (done) => {
    var usera = {
      email: 'biswajit@website.co',
      password: '123456789'
    };
    request(app)
      .post('/users')
      .send(usera)
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(usera.email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({email: usera.email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(usera.password);
          done();
        }).catch((e) => done(e));
      });
  });
  it('Should return validation errors if request invalid', (done) => {
    var usera = {
      email: 'biswajit@website.coddddd',
      password: '12349'
    };
    request(app)
      .post('/users')
      .send(usera)
      .expect(400)
      .end(done);
  });
  it('Should not create if email already used', (done) => {
    var usera = {
      email: 'bjipt@webe.co',
      password: '123456789'
    };
    request(app)
      .post('/users')
      .send(usera)
      .expect(400)
      .end(done);
  });
});
describe('POST /users/login', () => {
  it('Sould login user and return auth tokens', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });
  it('Sould reject invalid login.', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + 'gf'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /user/me/token', () => {
  it('Should remove auth token onlog', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.text).toBe('User loged out successfully.');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
