const path = require("path");
//const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {
  merge
} = require('webpack-merge');
const precss = require('precss')
const autoprefixer = require('autoprefixer')
const postcssPreset = require("postcss-preset-env");


// Default context <bundle base directory>
//const context = path.resolve(__dirname, "..", "public");
const public = path.resolve(__dirname, "..", "public", "assets");
const bundleName = path.basename(path.resolve(__dirname, "..", ".."));
const publicPath = bundleName + "/assets/";

let config = null;
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
    documentation: ["./Resources/js/documentation.js"],
    slide: ["./Resources/js/slides/slide.js"],
    notes: ["./Resources/js/slides/notes.js"],
    //ioserver: ["./Resources/public/js/slides/io-server.js"],
    //ioclient: ["./Resources/public/js/slides/io-client.js"]
  },
  output: {
    path: public,
    publicPath: publicPath,
    filename: "./js/[name].js",
    library: "[name]",
    libraryExport: "default"
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
      },
      /*
       *	reveal EXPOSE BROWSER CONTEXT
       *
       */
      {
        test: require.resolve("reveal.js"),
        //loader: "expose-loader?$!expose-loader?Reveal"
        loader: 'expose-loader',
        options: {
          exposes: ['Reveal']
        }
      },
      /*{
        test: require.resolve("reveal.js/plugin/notes/notes.js"),
        loader: "expose-loader?$!expose-loader?notes"
      },*/
      /*
       *	scss
       *
       */
      {
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
              postcssOptions: {
                plugins: [autoprefixer({}), precss({})]
              }
            }
          }, {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/', // where the fonts will go
            publicPath: `/${bundleName}/assets/fonts/` // override the default path
          }
        }]
      },
      {
        // IMAGES
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [{
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            publicPath: `/${bundleName}/assets/images/`,
            outputPath: "/images/"
          }
        }]
      }
      ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
      allChunks: true
    })
  ],
  devServer: {
    inline: true,
    hot: false
  }
});
