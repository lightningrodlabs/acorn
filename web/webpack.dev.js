const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const {
  attachHarnessSidecar,
  toolBridgeMiddleware,
} = require('./dev-harness/sidecar')
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
      'process.env.__DEV_MODE__': JSON.stringify(true),
      'process.env.KANGAROO': process.env.KANGAROO,
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
    // LLM-direct-API branch: attach the harness sidecar (ACP client + agent
    // spawn) to the dev server's HTTP server. Renderer talks to it over a
    // WebSocket at /__acorn_harness. onListening is where the http server exists.
    onListening: (devServer) => {
      attachHarnessSidecar(devServer && devServer.server)
    },
    // dev-only file bridge for the agent diff tools (branch I): read/write the
    // exchange file under <tmp>/acorn-clarity so the renderer needs no fs or File
    // System Access API (both blocked in the dev iframe context).
    setupMiddlewares: (middlewares, devServer) => {
      const fs = require('fs')
      const path = require('path')
      // fixed path (NOT os.tmpdir(): under `nix develop` TMPDIR is per-session)
      const dir = '/tmp/acorn-clarity'
      const fileFor = (name) =>
        path.join(dir, path.basename(String(name)).replace(/[^a-z0-9._-]/gi, '_'))
      const json = (res, code, obj) => {
        res.statusCode = code
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(obj))
      }
      // hosted-tool bridge (clarity-tree draft pipeline L1): the Acorn MCP server
      // POSTs read_tree / propose_edits here; the sidecar relays to the renderer.
      // unshift so it precedes the SPA history-fallback.
      middlewares.unshift({
        name: 'acorn-tool-bridge',
        middleware: toolBridgeMiddleware,
      })
      // unshift so it runs BEFORE the SPA history-fallback (which would otherwise
      // serve index.html for the GET). Raw req/res — no express route ordering.
      middlewares.unshift({
        name: 'acorn-diff-bridge',
        middleware: (req, res, next) => {
          const m = req.url.match(/^\/__acorn_diff\/([^/?#]+)/)
          if (!m) return next()
          const file = fileFor(decodeURIComponent(m[1]))
          if (req.method === 'GET') {
            try {
              if (!fs.existsSync(file)) return json(res, 404, { error: 'not found' })
              res.setHeader('content-type', 'application/json')
              return res.end(fs.readFileSync(file, 'utf8'))
            } catch (e) {
              return json(res, 500, { error: String(e) })
            }
          }
          if (req.method === 'POST') {
            let body = ''
            req.setEncoding('utf8')
            req.on('data', (c) => (body += c))
            req.on('end', () => {
              try {
                fs.mkdirSync(dir, { recursive: true })
                fs.writeFileSync(file, body)
                json(res, 200, { ok: true, path: file })
              } catch (e) {
                json(res, 500, { error: String(e) })
              }
            })
            return
          }
          next()
        },
      })
      return middlewares
    },
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
              'transform-class-properties',
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
              compilerOptions: {
                sourceMap: true, // Ensure TypeScript source maps are generated
              },
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
