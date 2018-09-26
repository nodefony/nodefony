const path = require("path");
//const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

//const context = path.resolve(__dirname, "..", "public");
const public = path.resolve(__dirname, "..", "public", "assets");
const bundleName = path.basename(path.resolve(__dirname, "..", ".."));
const publicPath = bundleName + "/assets/";

let config = null;
if (kernel.environment === "dev") {
  config = require("./webpack/webpack.dev.config.js");
} else {
  config = require("./webpack/webpack.prod.config.js");
}

module.exports = webpackMerge({
    //context: context,
    target: "web",
    entry: {
      framework: ["./Resources/public/js/framework.js"]
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
              presets: ['@babel/preset-env']
            }
          }]
        },
        /*
         *	JQUERY EXPOSE BROWSER CONTEXT
         *
         */
        {
          test: require.resolve("jquery"),
          loader: "expose-loader?$!expose-loader?jQuery"
        }, {
          test: /jquery\..*\.js/,
          loader: "imports?$=jquery,jQuery=jquery,this=>window"
        }, {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader"
            }, {
              loader: 'postcss-loader', // Run post css actions
              options: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            }, {
              loader: "sass-loader"
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "css/[name].css",
        allChunks: true
      })
    ]
  },
  config);