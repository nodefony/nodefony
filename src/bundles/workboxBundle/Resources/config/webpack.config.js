const path = require("path");
//const webpack = require('webpack');
const public = path.resolve(__dirname, "..", "public");
const bundleName = path.basename(path.resolve(__dirname, "..", ".."));
const ExtractTextPluginCss = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge');
let config = null;
let verbose = false;
if (kernel.environment === "dev") {
  verbose = true;
  config = require("./webpack/webpack.dev.config.js");
} else {
  config = require("./webpack/webpack.prod.config.js");
}

const htmlPlugin = require('html-webpack-plugin');
const cleanPlugin = require('clean-webpack-plugin');
const dist = path.resolve(__dirname, "..", "public", "dist");
const workboxPlugin = require('workbox-webpack-plugin');

require('require-yaml');
const bundleConfig = require("../config/config.yml");

module.exports = webpackMerge({
  context: public,
  target: "web",
  entry: {
    workbox: ["./js/workbox.js"]
  },
  output: {
    path: public,
    publicPath: "/" + bundleName + "/",
    filename: "./dist/js/[name].js",
    library: "[name]",
    libraryTarget: "umd"
  },
  externals: {},
  resolve: {},
  module: {
    rules: [{
      // BABEL TRANSCODE
      test: new RegExp("\.es6$"),
      exclude: new RegExp("node_modules"),
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }]
    }, {
      // CSS EXTRACT
      test: new RegExp("\.css$"),
      use: ExtractTextPluginCss.extract({
        use: 'css-loader'
      })
    }, {
      // SASS
      test: new RegExp(".scss$"),
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader'
      }, {
        loader: 'sass-loader'
      }]
    }, {
      test: new RegExp("\.less$"),
      use: ExtractTextPluginCss.extract({
        use: [
          "raw-loader",
          {
            loader: 'less-loader',
            options: {
              //strictMath: true,
              //noIeCompat: true
            }
          }
        ]
      })
    }, {
      // FONTS
      test: new RegExp("\.(eot|woff2?|svg|ttf)([\?]?.*)$"),
      use: 'file-loader?name=[name].[ext]&publicPath=/' + bundleName + "/dist/fonts/" + '&outputPath=/dist/fonts/',
    }, {
      // IMAGES
      test: new RegExp("\.(jpg|png|gif)$"),
      use: 'file-loader?name=[name].[ext]&publicPath=/' + bundleName + "/dist/images/" + '&outputPath=/dist/images/'
    }, {
      test: new RegExp("\.twig$"),
      loader: "twig-loader"
    }, {
      test: new RegExp("\.html$"),
      loader: "html-loader"
    }]
  },
  plugins: [
    new ExtractTextPluginCss({
      filename: "./dist/css/[name].css",
    }),
    new cleanPlugin([dist], {
      root: public,
      verbose: verbose,
      watch: false,
    }),
    new htmlPlugin({
      filename: "dist/index.html",
      template: path.resolve(__dirname, "..", "templates", "index.html.twig"),
      title: 'Nodefony Workbox For Webpack',
      cache: !verbose,
      inject: true,
      compile: true,
      minify: {
        removeAttributeQuotes: true
      },
      xhtml: true,
      chunks: ['workbox'],
      config: bundleConfig
    }),
    new workboxPlugin.GenerateSW({
      swDest: path.resolve("/", "dist", 'workers', 'service-worker.js'),
      clientsClaim: true,
      skipWaiting: true,
      chunks: ['workbox']
    })

  ]
}, config);