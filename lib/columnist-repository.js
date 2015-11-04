'use strict';

var  _ = require('underscore'),
     columnists = require('./columnists')();

module.exports = function() {

  var data = [
    {
      "email": "rodrigovieira18@gmail.com",
      "name": "Rodrigo Vieira de Alencar",
      "path": "rodrigo-vieira-de-alencar",
      "description": "Um cara bem legal pena que não pode ver jogo novo",
      "photo": "//www.gravatar.com/avatar/d12bce9045873a5efd4ec784da46e4f0"

    },
    {
      "email": "wandecleya@gmail.com",
      "name": "Wandecleya Martins de Melo",
      "path": "wandecleya-martins-de-melo",
      "description": "Uma nerd, que vira as noites no netflix",
      "photo": "//www.gravatar.com/avatar/1d5494ad99c71c99a36d108a474174b6"
    }
  ];

  return {
    getAll: function(callback) {
      var result = _.map(data, function(element, email){

        return { id: element['email'], name: element['name'] };
      });

      callback(result);
    },
    write: function(){
      columnists(data).toDATA().write(process.env.HEXO_DATA_PATH, function(err){
        console.log(err);
      });
    }
  };
};
