var async = require('async');

exports.up = function(next) {
  var News = this.model('News');
  News.find({ tags: { $in: ['radioagencia', 'radioagência'] } }, (err, allNews) => {
    if(err) {
      console.error('Could not find news: ', err);
      return;
    }

    var saveOperations = [];

    allNews.forEach((oneNews) => {
      if(oneNews.audio) {
        oneNews.audio = oneNews.audio.replace('user-146107752', 'radioagenciabdf');
        saveOperations.push(oneNews.save);
      }
    });

    async.series(saveOperations, (err) => {
      if(err)
        console.error('Oh no! Something went wrong.');
      else
        console.log('All radioagency news successfully updated.');

      next();
    });
  });
};

exports.down = function(next) {
  var News = this.model('News');
  News.find({ tags: { $in: ['radioagencia', 'radioagência'] } }, (err, allNews) => {
    if(err) {
      console.error(err);
      return;
    }

    var saveOperations = [];

    allNews.forEach((oneNews) => {
      if(oneNews.audio) {
        oneNews.audio = oneNews.audio.replace('radioagenciabdf', 'user-146107752');
        saveOperations.push(oneNews.save);
      }
    });

    async.series(saveOperations, (err) => {
      if(err)
        console.error('Oh no! Something went wrong.');
      else
        console.log('All radioagency news successfully updated.');

      next();
    });
  });
};
