const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const mainAppId = fs.readFileSync(
  path.join(__dirname, '../config-main-app-id'),
  'utf-8'
)

module.exports = {
  mode: 'production',
  output: {
    publicPath: './',
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      __MAIN_APP_ID__: JSON.stringify(mainAppId),
      __ADMIN_PORT__: 1235,
      __APP_PORT__: 8889,
    }),
  ],
  entry: {
    app: './src/index.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  node: {
    fs: 'empty',
  },
  devServer: {
    host: 'localhost',
    disableHostCheck: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
            plugins: [],
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: (url, resourcePath) => {
                // resourcePath - path to css file
                // Don't handle `splash-image.png` urls
                if (url.includes('splash-image.png')) {
                  return false
                }
                return true
              },
            },
          },
        ],
      },
    ],
  },
}
