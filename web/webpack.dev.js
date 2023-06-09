const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const mainAppId = fs.readFileSync(
  path.join(__dirname, '../config-main-app-id'),
  'utf-8'
)

// const isDevelopment = true
module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin({
      __MAIN_APP_ID__: JSON.stringify(mainAppId),
      __ADMIN_PORT__: process.env.ADMIN_WS_PORT,
      __APP_PORT__: process.env.APP_WS_PORT,
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
  externals: {
    "node:crypto": {}
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    port: process.env.WEB_PORT,
    host: 'localhost',
    allowedHosts: 'all',
    static: './dist',
    hot: true, // hot module reloading
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: {
          and: [/node_modules/],
        },
        use: {
          loader: 'babel-loader',
          options: {
            sourceMaps: true,
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins: [
              // ... other plugins
              require.resolve('react-refresh/babel'),
              "transform-class-properties",
            ],
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: [/node_modules/, /stories/],
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              getCustomTransformers: () => ({
                before: [ReactRefreshTypeScript()],
              }),
              // `ts-loader` does not work with HMR unless `transpileOnly` is used.
              // If you need type checking, `ForkTsCheckerWebpackPlugin` is an alternative.
              transpileOnly: true,
            },
          },
        ],
      },
      // fonts
      {
        // svg could be added here, but would need to be distinguished
        // from non-font svgs
        test: /\.(ttf|eot|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        },
        type: 'javascript/auto'
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
        type: 'javascript/auto'
      },
      // scss
      {
        test: /\.scss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          'resolve-url-loader', // useful for font loading
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      // css
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}
