const path = require("path");
const webpack = require("webpack");
const {merge} = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const context = path.resolve(__dirname, "..", "public");
const public = path.resolve(__dirname, "..", "public", "assets");
const bundleName = path.basename(path.resolve(__dirname, "..", ".."));
const publicPath = `${bundleName}/assets/`;

let config = null;
const debug = kernel.debug ? "*" : false;
if (kernel.environment === "dev") {
  config = require("./webpack/webpack.dev.config.js");
} else {
  config = require("./webpack/webpack.prod.config.js");
}

module.exports = merge({
  context,
  target: "web",
  entry: {
    test: ["./js/test.js"],
    mail: ["./js/mail.js"]
  },
  output: {
    path: public,
    publicPath,
    filename: "./js/[name].js",
    hashFunction: "xxhash64",
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
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"]
        }
      }]
    }, {
      test: require.resolve("jquery"),
      loader: "expose-loader",
      options: {
        exposes: [{
          globalName: "$",
          override: true
        }, {
          globalName: "jQuery",
          override: true
        }]
      }
    }, {
      test: /\.(sa|sc|c)ss$/,
      use: [
        // 'css-hot-loader',
        MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            sourceMap: true
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
      type: "asset/inline"
    }, {
      // IMAGES
      test: new RegExp("\.(jpg|png|gif)$"),
      type: "asset/resource",
      generator: {
        filename: "images/[name][ext][query]"
      }
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].css"
      // allChunks: true
    }),
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "NODE_DEBUG": JSON.stringify(debug)
      }
    })
  ]
}, config);
