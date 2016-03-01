'use strict';

var  _          = require('underscore');

var columnists  = require('./columnists');

var data = [
  {
    'email': 'rodrigovieira18@gmail.com',
    'name': 'Rodrigo Vieira de Alencar',
    'path': 'rodrigo-vieira-de-alencar',
    'description': 'Um cara bem legal pena que não pode ver jogo novo',
    'photo': '//www.gravatar.com/avatar/d12bce9045873a5efd4ec784da46e4f0'

  },
  {
    'email': 'wandecleya@gmail.com',
    'name': 'Wandecleya Martins de Melo',
    'path': 'wandecleya-martins-de-melo',
    'description': 'Uma nerd, que vira as noites no netflix',
    'photo': '//www.gravatar.com/avatar/1d5494ad99c71c99a36d108a474174b6'
  },
  {
    'email': 'snowden@gmail.com',
    'name': 'Edward Snowden',
    'path': 'edward-snowden',
    'description': 'I used to work for the government. Now I work for the public.',
    'photo': '//pbs.twimg.com/profile_images/648888480974508032/66_cUYfj_400x400.jpg'
  }

];

module.exports =
{
  getAll: function(callback) {
    var result = _.map(data, function(element, email){

      return { id: element['email'], name: element['name'] };
    });

    callback(result);
  },
  write: function(){
    var HEXO_DATA_PATH = [process.env.HEXO_SOURCE_PATH, '_data'].join('/');
    columnists.write(HEXO_DATA_PATH, data, function(err){
      if(err) {
        console.log(err);
      }
    });
  }
};
