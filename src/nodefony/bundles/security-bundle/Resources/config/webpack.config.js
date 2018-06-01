const path = require("path");
//const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractTextPluginCss = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const context = path.resolve(__dirname, "..", "public");
const public = path.resolve(__dirname, "..", "public", "assets");
const bundleName = path.basename(path.resolve(__dirname, "..", ".."));
const publicPath = bundleName + "/assets/";

let config = null;
if (kernel.environment === "dev") {
  config = require("./webpack/webpack.dev.config.js");
} else {
  config = require("./webpack/webpack.prod.config.js");
}

module.exports = webpackMerge(config, {
  context: context,
  target: "web",
  //watch: false,
  entry: {
    login: ["./js/login.js"]
  },
  output: {
    path: public,
    publicPath: publicPath,
    filename: "./js/[name].js",
    library: "[name]",
    libraryTarget: "umd"
  },
  externals: {},
  resolve: {},
  module: {
    rules: [{
      // BABEL TRANSCODE
      test: new RegExp("\.es6$|\.js$"),
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
      use: [
        //'css-hot-loader',
        MiniCssExtractPlugin.loader,
        'css-loader',
      ]
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
      use: 'file-loader?name=[name].[ext]&publicPath=/' + bundleName + "/assets/fonts/" + '&outputPath=/fonts/',
    }, {
      // IMAGES
      test: new RegExp("\.(jpg|png|gif)$"),
      use: 'file-loader?name=[name].[ext]&publicPath=/' + bundleName + "/assets/images/" + '&outputPath=/images/'
    }]
  },
  plugins: [
    new ExtractTextPluginCss({
      filename: "./css/[name].css",
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
      allChunks: true
    })
  ]
});