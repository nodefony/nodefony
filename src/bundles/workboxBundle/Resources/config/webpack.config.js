const path = require("path");
//const webpack = require('webpack');
const public = path.resolve(__dirname, "..", "public");
const bundleName = path.basename(path.resolve(__dirname, "..", ".."));
const ExtractTextPluginCss = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge');
let config = null;
if (kernel.environment === "dev") {
  config = require("./webpack/webpack.dev.config.js");
} else {
  config = require("./webpack/webpack.prod.config.js");
}

const htmlPlugin = require('html-webpack-plugin');
const cleanPlugin = require('clean-webpack-plugin');
const dist = path.resolve(__dirname, "..", "public", "assets");
const workboxPlugin = require('workbox-webpack-plugin');


module.exports = webpackMerge({
  context: public,
  target: "web",
  entry: {
    workbox: ["./js/workbox.js"]
  },
  output: {
    path: public,
    publicPath: bundleName + "/",
    filename: "./assets/js/[name].js",
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
      use: 'file-loader?name=[name].[ext]&publicPath=/' + bundleName + "/assets/fonts/" + '&outputPath=/assets/fonts/',
    }, {
      // IMAGES
      test: new RegExp("\.(jpg|png|gif)$"),
      use: 'file-loader?name=[name].[ext]&publicPath=/' + bundleName + "/assets/images/" + '&outputPath=/assets/images/'
    }]
  },
  plugins: [
    new ExtractTextPluginCss({
      filename: "./assets/css/[name].css",
    }),
    new cleanPlugin([dist], {
      root: public,
      verbose: true
    }),
    new htmlPlugin({
      filename: "assets/index.html",
      title: 'Get Started With Workbox For Webpack',
      chunks: ['workbox']
    }),
    new workboxPlugin.GenerateSW({
      //swDest: 'workers/sw.js',
      clientsClaim: true,
      skipWaiting: true,
    })

  ]
}, config);