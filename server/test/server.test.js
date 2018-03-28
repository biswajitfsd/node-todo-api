const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {app} = require('./../server');
var {Todo} = require('./../modles/todo');
// var {User} = require('./../modles/user');

const todos = [{
  _id: new ObjectID(),
  text: 'first test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo'
}]

beforeEach((done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
});


describe('POST /todos' , () => {
  it('Sould crete a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
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
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todo/:id', () => {
  it('Sould get todos for the id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('Sould get 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}+a`)
      .expect(404)
      .end(done);
  });

  it('Sould get 404 for the id', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });
});
