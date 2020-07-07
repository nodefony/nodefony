const path = require("path");
//const webpack = require('webpack');
const { merge } = require('webpack-merge');
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

module.exports = merge({
  context: context,
  target: "web",
  entry: {
    test: ["./js/test.js"],
    mail: ["./js/mail.js"]
  },
  output: {
    path: public,
    publicPath: publicPath,
    filename: "./js/[name].js",
    library: "[name]",
    libraryTarget: "umd"
  },
  externals: {},
  resolve: {
    alias: {
    }
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
        test: require.resolve('jquery'),
        rules: [{
            loader: 'expose-loader',
            options: {
              //expose: ['$', 'jQuery'],
              exposes: [{
                globalName: '$',
                override: true,
              },{
                globalName: 'jQuery',
                override: true,
              }]
            }
          }
        ],
    }, {
      test: /jquery\..*\.js/,
      loader: "imports-loader?$=jquery,jQuery=jquery,this=>window"
    }, {
      test: /\.(sa|sc|c)ss$/,
      use: [
          //'css-hot-loader',
          MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            sourceMap: true
          }
          }, {
          loader: 'resolve-url-loader',
          options: {}
          }, {
          loader: 'postcss-loader', // Run post css actions
          options: {
            plugins: () => [require('precss'), require('autoprefixer')]
          }
          }, {
          loader: "sass-loader",
          options: {
            sourceMap: true
          }
          }
        ]
    }, {
      // FONTS
      test: new RegExp("\.(eot|woff2?|svg|ttf)([\?]?.*)$"),
      use: 'file-loader?name=[name].[ext]&publicPath=/' + bundleName + '/assets/fonts/' + '&outputPath=/fonts/',
    }, {
      // IMAGES
      test: new RegExp("\.(jpg|png|gif)$"),
      use: 'file-loader?name=[name].[ext]&publicPath=/' + bundleName + '/assets/images/' + '&outputPath=/images/'
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
      allChunks: true
    })
  ]
}, config);
