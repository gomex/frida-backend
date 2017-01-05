var Factory = require('rosie').Factory;

var mobile = new Factory()
  .attr('link', '//farm1.staticflickr.com/479/31746491920_b1f60e17c9_o.jpg')
  .attr('original', '//farm1.staticflickr.com/479/31746491920_b1f60e17c9_o.jpg')
  .attr('thumbnail', '//farm1.staticflickr.com/479/31746491920_b1f60e17c9_o.jpg')
  .attr('medium', '//farm1.staticflickr.com/479/31746491920_b1f60e17c9_o.jpg')
  .attr('small', '//farm1.staticflickr.com/479/31746491920_b1f60e17c9_o.jpg');

var cover = new Factory()
  .attr('link', '//farm1.staticflickr.com/328/32082747946_d5bcc2ae95_o.jpg')
  .attr('original', '//farm1.staticflickr.com/328/32082747946_d5bcc2ae95_o.jpg')
  .attr('thumbnail', '//farm1.staticflickr.com/328/32082747946_d5bcc2ae95_o.jpg')
  .attr('medium', '//farm1.staticflickr.com/328/32082747946_d5bcc2ae95_o.jpg')
  .attr('small', '//farm1.staticflickr.com/328/32082747946_d5bcc2ae95_o.jpg')
  .attr('title', 'The picture\'s title')
  .attr('credits', 'Photographer')
  .attr('subtitle', 'A beautiful picture')
  .attr('mobile', () => mobile.build());

module.exports.cover = cover;
