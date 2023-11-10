// app.js
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const itemsRoute = require('./api');
require('./job')

const app = express();
const port = 3000;

// Connect to MongoDB
const url = 'mongodb://localhost:27019';
const dbName = 'MyDb';

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }

  console.log('Connected to MongoDB');
  const db = client.db(dbName);

  // Middleware
  app.use(bodyParser.json());
  // Pass the MongoDB database connection to the routes
  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Routes
  app.use('/api', itemsRoute);

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
