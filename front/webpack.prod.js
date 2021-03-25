const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')
const mainAppId = fs.readFileSync(path.join(__dirname, '../config-profiles-app-id'), 'utf-8')

module.exports = merge(common, {
  mode: 'production',
  output: {
    publicPath: './',
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      __MAIN_APP_ID__: JSON.stringify(mainAppId),
      __ADMIN_PORT__: 1235,
      __APP_PORT__: 8889,
    }),
  ],
})
