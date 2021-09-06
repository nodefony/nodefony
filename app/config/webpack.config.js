const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { merge } = require('webpack-merge');

// Default context <bundle base directory>
//const context = path.resolve(__dirname, "..", "Resources", "public");
const public = path.resolve(__dirname, "..", "Resources", "public", "assets");
const bundleName = path.basename(path.resolve(__dirname, ".."));
const publicPath = bundleName + "/assets/";

let config = null;
const debug = kernel.debug ? "*" : false ;
let dev = true;
if (kernel.environment === "dev") {
  config = require("./webpack/webpack.dev.config.js");
} else {
  config = require("./webpack/webpack.prod.config.js");
  dev = false;
}

module.exports = merge(config, {
  //context: context,
  target: "web",
  entry: {
    app: ["./Resources/js/app.js"]
  },
  output: {
    path: public,
    publicPath: publicPath,
    filename: "./js/[name].js",
    library: "[name]",
    libraryExport: "default",
    assetModuleFilename:'[hash][ext][query]'
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
    }, {
      test: require.resolve('jquery'),
      loader: 'expose-loader',
      options: {
        exposes: [{
          globalName: '$',
          override: true
        },{
          globalName: 'jQuery',
          override: true
        }]
      }
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
          loader: "sass-loader",
          options: {
            sourceMap: true
          }
        }
      ]
    }, {
      test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      type: 'asset/inline'
    }, {
      // IMAGES
      test: /\.(gif|png|jpe?g|svg)$/i,
      type: 'asset/resource',
      generator: {
         filename: "images/[name][ext][query]",
      }
      /*use: [{
          loader: 'image-webpack-loader',
          options: {
            disable: dev,
            mozjpeg: {
              progressive: true,
              quality: 65
            },
            // optipng.enabled: false will disable optipng
            optipng: {
              enabled: false,
            },
            pngquant: {
              quality: '65-90',
              speed: 4
            },
            gifsicle: {
              interlaced: false,
            },
            // the webp option will enable WEBP
            webp: {
              quality: 75
            }
          }
        }
      ]*/
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css"
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        "NODE_DEBUG": JSON.stringify(debug)
      }
    })
  ],
  devServer: {
    hot: false, // false || true || "only",
    progress:false
  }
});
