const test = require('tape');
const request = require('supertest');
const express = require('express');
const app = express();

app.get('/blah', (req, res) => res.send('boom'));

// test('simple', (t) => {
//   t.equal(2, 1 + 1);
//   t.end();
// });
// 
// test('GET to /blah', (t) => {
//   t.plan(1);
//   request(app)
//     .get('/blah')
//     .expect(200)
//     .end(t.pass);
// });
