'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const data = require('./db/cheeses');
const simDB = require('./db/simDB');
const Cheese = simDB.initialize(data);

const { PORT, CLIENT_ORIGIN } = require('./config');
// const { dbConnect } = require('./db-mongoose');
const {dbConnect} = require('./db-knex');

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

// Parse request body
app.use(express.json());

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/cheeses', (req, res, next) => {
  // return res.sendStatus(500);
  // return res.status(500).json({code: 500, message: 'Internal server error'});
  Cheese.filter('', (err, list) => {
    if (err) {
      return next(err);
    }

    res.json(list);
  });
});

app.post('/api/cheeses', (req, res, next) => {
  const { cheeseType } = req.body;
  console.log('VALUES', cheeseType);
  const newItem = { type: cheeseType };
  Cheese.create(newItem, (err, item) => {
    if(err) {
      console.log('POST ERROR', err);
    }
    if(item) {
      res.location(`http://${req.headers.host}/cheeses/${item.id}`).status(201).json(item);
    } else {
      next();
    }
  });
  // res.status(201).json('OK');
});


function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
