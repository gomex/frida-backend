exports.up = function(next) {
  var News = this.model('News');
  News.find({ tags: { $in: ['radioagencia'] } }, (err, allNews) => {
    if(err) {
      console.error('Could not find news: ', err);
      return;
    }

    allNews.forEach((oneNews) => {
      if(oneNews.audio) {
        oneNews.audio = oneNews.audio.replace('user-146107752', 'radioagenciabdf');
        oneNews.save((err) => { if(err) console.log('Could not update news id ', oneNews._id, err);});
      }
    });

    next();
  });
};

exports.down = function(next) {
  var News = this.model('News');
  News.find({ tags: { $in: ['radioagencia'] } }, (err, allNews) => {
    if(err) {
      console.error(err);
      return;
    }

    allNews.forEach((oneNews) => {
      if(oneNews.audio) {
        oneNews.audio = oneNews.audio.replace('radioagenciabdf', 'user-146107752');
        oneNews.save((err) => { if(err) console.log('Could not update news id ', oneNews._id, err);});
      }
    });

    next();
  });
};
