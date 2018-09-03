const path = require("path");
require('require-yaml');
//const webpack = require('webpack');
const htmlPlugin = require('html-webpack-plugin');
const cleanPlugin = require('clean-webpack-plugin');
const workboxPlugin = require('workbox-webpack-plugin');
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const bundlePath = path.resolve(__dirname, "..", "..");
const bundlePathConfig = path.resolve(bundlePath, "Resources", "config");
const bundleName = path.basename(bundlePath);
const bundleConfig = require(path.resolve(bundlePathConfig, "config.yml"));
const public = path.resolve(__dirname, "..", "public");
const publicPath = path.join("/", bundleName, "/");
const dist = path.resolve(public, "dist");

let config = null;
let verbose = false;

if (kernel.environment === "dev") {
  verbose = true;
  config = require(path.resolve(bundlePathConfig, "webpack", "webpack.dev.config.js"));
} else {
  config = require(path.resolve(bundlePathConfig, "webpack", "webpack.prod.config.js"));
}
//console.log(path.join("dist", "js", "[name].js"))

module.exports = webpackMerge({
  context: public,
  target: "web",
  entry: {
    workbox: ["./js/workbox.js"]
  },
  output: {
    path: public,
    publicPath: publicPath,
    filename: "./dist/js/[name].js",
    library: "[name]"
    //libraryTarget: "umd"
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
    new MiniCssExtractPlugin({
      filename: "./dist/css/[name].css",
      allChunks: true
    }),
    new cleanPlugin([dist], {
      root: public,
      verbose: verbose,
      watch: false,
    }),
    new htmlPlugin({
      filename: "dist/index.html",
      template: path.resolve(bundlePath, "Resources", "templates", "index.html.twig"),
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
    new workboxPlugin.InjectManifest({
      swSrc: path.resolve(public, "workers", "service-worker.js"),
      swDest: path.resolve(public, "dist", 'workers', 'service-worker.js'),
      include: [/\.html$/, /\.js$/, /\.css$/],
      importScripts: [
        //path.resolve("/", "workboxBundle", "workers", "nodefony-worker.js"),
        //path.resolve("/", "workboxBundle", "workers", "precache-worker.js")
      ],
      //importWorkboxFrom: "disabled",
      chunks: ['workbox']
    })
  ]
}, config);