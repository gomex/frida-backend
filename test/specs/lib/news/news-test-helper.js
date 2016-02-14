var moment = require('moment');

/**
 * News as expected to be sent by whomever is using news services rest api.
 * @param date when news where created
 * @returns news base object. Common parts between news and opinion layout.
 */
function baseNews(date) {
  var baseNews = {
    body: '<p>São testes e testes. &nbsp;Testes de notícia</p>\n',
    metadata: {
      created_date: date,
      date: date,
      description: 'A notícia sensacionalista',
      hat: 'Sensacional',
      title: 'Título Sensacional',
      cover: {
        link: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
        thumbnail: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_t.jpg",
        medium: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_z.jpg",
        small: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_n.jpg",
        title: "Carlos Marighella.jpg",
        cover: "true",
        credits: "Rodolfo R. Mirelli",
        subtitle: "Foto de destruição"
      }
    }
  };

  return baseNews;
};

function createNews(date, edition) {
  var news = baseNews(date);
  news.metadata.area = 'bem_viver';
  news.metadata.author = 'Osvald Grunt';
  news.metadata.edition = edition;
  news.metadata.layout = 'post';
  news.metadata.place = 'Paulista';
  return news;
};

// TODO tabloide, how colunists will be linked to tabloides?
function createOpinion(date) {
  var opinion = baseNews(date);
  opinion.metadata.layout = 'opinion';
  opinion.metadata.columnist = 'wandecleya@gmail.com';
  return opinion;
};

/**
 * Create news or opinions as expected to be sent by whomever is using news services rest api.
 * Each news or opinions created will be 1 day apart from the previous one created.
 * @param amount number of news to be created
 * @param type post or opinion. Creates news or opinions respectively.
 * @param edition use [not-a-link] for nacional or a tabloide's state
 * @returns {Array} of news or opinions
 */
function createNewsOfType(amount, type, edition) {
  var news = [];
  var startTime = moment();

  var funciontToCall = type === 'post'? createNews : createOpinion;

  for(var i = 0; i < amount; i++) {
    var date = startTime.add(1, 'days').toISOString();
    news.push(funciontToCall(date, edition));
  }

  return news;
};

module.exports = {
  createNews: createNews,
  createOpinion: createOpinion,
  createNewsOfType: createNewsOfType
};
