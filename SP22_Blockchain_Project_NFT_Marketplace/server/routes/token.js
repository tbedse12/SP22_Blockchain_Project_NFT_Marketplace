const express = require("express");

// tokenRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /token.
const tokenRoutes = express.Router();

// This will help us connect to the database
const fs = require('fs');

let FETCH_LOAD = undefined;

// THIS IS REALLY DUMB
const fetch = async () => {
  try {
    return FETCH_LOAD || (FETCH_LOAD = (await import('node-fetch')).default);
  } catch (err) {
    console.error(err);
    return null;
  }
};

tokenRoutes.route('/token/:uri').get(function (req, res) {
  let uri = req.params.uri;
  let promise = (uri.indexOf("supra.json") >= 0) ?
      new Promise((resolve, reject) => {
          fs.readFile('./metadata/supra.json', 'utf-8', (err, data) => {
              if (err) reject(err);
              else resolve(JSON.parse(data));
          });
      }) :
      fetch()
      .then(fn => fn(uri))
      .then(x => x.json());
  
  promise.then(x => res.json(x)).catch(err => {
      console.error(err);
  });
});

module.exports = tokenRoutes;
