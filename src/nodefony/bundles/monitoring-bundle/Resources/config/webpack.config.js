const path = require("path");
//const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require("mini-css-extract-plugin").default;
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

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

module.exports = merge({
  context: context,
  target: "web",
  watch: false,
  entry: {
    monitoring: "./js/monitoring.js",
    debugbar: "./js/debugBar.js"
  },
  output: {
    path: public,
    publicPath: publicPath,
    filename: "./js/[name].js",
    hashFunction: "xxhash64",
    library: "[name]",
    libraryExport: "default"
  },
  module: {
    rules: [{
      // BABEL TRANSCODE
      test: new RegExp("\.es6$|\.js$"),
      exclude: new RegExp("node_modules"),
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }]
    }, {
      // CSS EXTRACT
      test: new RegExp("\.(less|css)$"),
      use: [
        //'css-hot-loader',
        MiniCssExtractPlugin.loader,
        'css-loader',
        'less-loader'
      ]
    }, {
      test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      type: 'asset/inline'
    }, {
      // IMAGES
      test: /\.(gif|png|jpe?g|svg)$/i,
      type: 'asset/inline'
    }]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css"
      //allChunks: true
    })
  ]
}, config);
