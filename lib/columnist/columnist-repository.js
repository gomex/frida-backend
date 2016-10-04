'use strict';

var  _          = require('underscore');

var columnists  = require('./columnists');

var data = [
  {
    'email': 'brunopadron@yahoo.com.br',
    'name': 'Bruno Porpetta',
    'path': 'bruno-porpetta',
    'description': 'É comentarista esportivo e autor do blog www.porpetta.blogspot.com.',
    'photo': '//farm2.staticflickr.com/1682/25055008823_f5299c5ea5_b.jpg'
  },
  {
    'email': 'joaopaulopintodacunha@gmail.com',
    'name': 'João Paulo Cunha',
    'path': 'joão-paulo-cunha',
    'description': 'É jornalista. Após 18 anos como editor de Cultura do jornal Estado de Minas, pediu demissão quando foi impedido de  escrever sobre política na coluna que assinava semanalmente.',
    'photo': '//farm2.staticflickr.com/1640/25563055732_8280d38e5b_b.jpg'
  },
  {
    'email': 'joaopedrostedile@gmail.com',
    'name': 'João Pedro Stedile',
    'path': 'joão-pedro-stedile',
    'description': 'É economista e membro da direção nacional do Movimento dos Trabalhadores Rurais Sem Terra (MST).',
    'photo': '//farm2.staticflickr.com/1650/25655622156_f529071bfb_b.jpg'
  },
  {
    'email': 'leonardoeocara@ig.com.br',
    'name': 'Mc Leonardo',
    'path': 'mc-leonardo',
    'description': 'É precursor e defensor do funk como cultura brasileira. Escreve sobre a realidade social do Rio de Janeiro.',
    'photo': '//farm2.staticflickr.com/1472/25055089913_870f511363_b.jpg'
  },
  {
    'email': 'ajokobskind@gmail.com',
    'name': 'Mario Augusto Jakobskind',
    'path': 'mario-augusto-jakobskind',
    'description': 'É jornalista e escritor. Foi colaborador de "O Pasquim" e redator e editor, no Rio de Janeiro, da revista "Versus", a primeira publicação de caráter latino­americano publicada no Brasil.',
    'photo': '//farm2.staticflickr.com/1519/25051289854_2046453d5b_b.jpg'
  },
  {
    'email': '//facebook/ticosantacruz',
    'name': 'Tico Santa Cruz',
    'path': 'tico-santa-cruz',
    'description': 'Tico Santa Cruz é um músico, compositor e vocalista da banda Detonautas Roque Clube. Além disso, é formado em Ciências Sociais pela Universidade Federal do Rio de Janeiro.',
    'photo': '//farm8.staticflickr.com/7639/27101313252_9a24ac764b_b.jpg'
  },
  {
    'email': 'bscerqueiraprofessora@gmail.com',
    'name': 'Beatriz Cerqueira',
    'path': 'beatriz-cerqueira',
    'description': 'Beatriz Cerqueira é professora, coordenadora-geral do Sind-UTE MG e presidenta da CUT Minas Gerais.',
    'photo': '//farm8.staticflickr.com/7248/26958159803_7374df8f48_b.jpg'
  },
  {
    'email': 'ricardogebrim@uol.com.br',
    'name': 'Ricardo Gebrim',
    'path': 'ricardo-gebrim',
    'description': 'É advogado e membro da Direção Nacional da Consulta Popular.',
    'photo': '//farm6.staticflickr.com/5315/30083803546_321fa8b660_z.jpg'
  }
];

module.exports =
{
  getAll: function(callback) {
    var result = _.map(data, function(element, _email){

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
