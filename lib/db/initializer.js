'use strict';

var mongoose = require('mongoose');

var connectionOptions = {
  server: { socketOptions: {keepAlive: 120} }
};

mongoose.connection.on('error', function() {
  console.error('Failed to connect to MongoDB. Exiting...');
  process.exit(1);
});

mongoose.connection.on('disconnected', function() {
  console.log('Disconnected from MongoDB.');
});

mongoose.connection.on('reconnected', function() {
  console.log('Reconnected to MongoDB.');
});

function connect(callback) {
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.DATABASE_URL, connectionOptions);

  mongoose.connection.once('open', () => {
    console.log('Connection to MongoDB successfully opened.');
    callback(mongoose.connection);
  });
}

module.exports = {
  connect
};
