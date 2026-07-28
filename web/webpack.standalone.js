/*
 * Standalone bundle: the UI as served by the standalone harness host
 * (dev-harness/host.js) in the hc-spin `--ui-port` flow — a real one-shot build,
 * no dev server, no HMR/react-refresh (which is why build:ui / webpack.dev.js
 * can't be reused: the refresh runtime throws outside a dev-server page).
 *
 * Differences from webpack.prod.js (the webhapp/Moss target):
 *   • __ADMIN_PORT__ / __APP_PORT__ come from env, like dev (hc-spin sets them)
 *   • process.env.KANGAROO is defined (desktop context signal for index.tsx)
 *   • process.env.__HARNESS__ = true — DevSidecarHarnessClient reports available
 *     and connects to the host on the same origin
 *
 * Build: KANGAROO=true WEB_PORT=8081 ADMIN_WS_PORT=1101 APP_WS_PORT=8101 \
 *          yarn workspace acorn-ui build:standalone
 */
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const mainAppId = fs.readFileSync(
  path.join(__dirname, '../config-main-app-id'),
  'utf-8'
)

module.exports = {
  mode: 'production',
  // matches webpack.prod.js — minification is disabled there for size/debug
  // reasons; keep the two prod-style bundles consistent
  optimization: {
    minimize: false,
  },
  output: {
    publicPath: '/',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      __MAIN_APP_ID__: JSON.stringify(mainAppId),
      __ADMIN_PORT__: process.env.ADMIN_WS_PORT,
      __APP_PORT__: process.env.APP_WS_PORT,
      'process.env.__DEV_MODE__': JSON.stringify(false),
      'process.env.__HARNESS__': JSON.stringify(true),
      'process.env.KANGAROO': JSON.stringify(process.env.KANGAROO),
    }),
    new HTMLWebpackPlugin({
      template: './src/index.html', //source
      filename: 'index.html', //destination
      chunks: ['app'],
    }),
    new HTMLWebpackPlugin({
      template: './src/splashscreen.html', //source
      filename: 'splashscreen.html', //destination
      chunks: ['splash'],
    }),
  ],
  entry: {
    app: './src/index.tsx',
    splash: './src/splashscreen.scss',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
      crypto: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: {
          and: [/node_modules/, /test/],
        },
        use: {
          loader: 'babel-loader',
          options: {
            sourceMaps: true,
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins: ['transform-class-properties'],
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: [/node_modules/, /src\/stories/, /test/],
        use: 'ts-loader',
      },
      // fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        },
        type: 'javascript/auto',
      },
      // .png, .jpg, .svg images
      {
        test: /\.(png|jpg|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images/',
          },
        },
        type: 'javascript/auto',
      },
      // scss
      {
        test: /\.scss$/i,
        use: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader'],
      },
      // css
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}
