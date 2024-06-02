const mongoose = require('mongoose');

// Connect MongoDB at default port = 27017
const dbConnect = (connectionString) => {
  mongoose
    .connect(connectionString)
    .then(() => {
      console.log('Connection Successfull');
    })
    .catch((err) => {
      console.log(err);
      console.log(connectionString);
    });
};

module.exports = dbConnect;