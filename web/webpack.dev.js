const fs = require('fs')
const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')
const adminWsPort = fs.readFileSync(path.join(__dirname, '../config-admin-ws'), 'utf-8')
const appWsPort = fs.readFileSync(path.join(__dirname, '../config-app-ws'), 'utf-8')
const mainAppId = fs.readFileSync(path.join(__dirname, '../config-main-app-id'), 'utf-8')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
  },
  plugins: [
    new webpack.DefinePlugin({
      __MAIN_APP_ID__: JSON.stringify(mainAppId),
      __ADMIN_PORT__: adminWsPort,
      __APP_PORT__: appWsPort,
    }),
  ],
})
