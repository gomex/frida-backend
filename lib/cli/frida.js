'use strict';

require('dotenv').config();
require('../db/initializer');

var parseArgs   = require('minimist');
var prompt      = require('prompt');
var UserService = require('../services/user_service');


prompt.message    = '>';
prompt.delimiter  = ' ';

function createUser() {
  var promptSchema = {
    properties: {
      email: { description: 'E-mail:', required: true },
      name: { description: 'Nome:', required: true },
      password: { description: 'Senha:', hidden: true, required: true }
    }
  };

  prompt.start();
  prompt.get(promptSchema, (err, result) => {
    if(err) {
      console.error('Something went wrong: ', err);
    } else {
      UserService.createUser(result.name, result.email, result.password, (err) => {
        if(err) {
          console.error('Could not create user: ', err);
        } else {
          console.error('User succesfully created.');
          process.exit(0);
        }
      });
    }

    prompt.stop();
  });
}

var args = parseArgs(process.argv.slice(2));

var command = args._[0];

if(command === 'create') {
  createUser();
} else {
  console.error('Unknown command: ', command);
}
