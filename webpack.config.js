var path = require('path');
module.exports = (
  {
    entry: './src/index.js',
    output:
    {
      path: path.resolve(__dirname, 'build'),
      publicPath: '/assets/',
      filname: 'bundle.js',
    },
  }
);
