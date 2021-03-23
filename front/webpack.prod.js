const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'production',
  output: {
    publicPath: './',
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      __APP_NAME__: JSON.stringify('profiles-app'),
      __ADMIN_PORT__: 1235,
      __APP_PORT__: 8889,
    }),
  ],
})
