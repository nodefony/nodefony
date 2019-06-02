const path = require("path");
//const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const htmlPlugin = require('html-webpack-plugin');
const webpackMerge = require('webpack-merge');
const WorkboxPlugin = require('workbox-webpack-plugin');

// Default context <bundle base directory>
//const context = path.resolve(__dirname, "..", "Resources", "public");
const public = path.resolve(__dirname, "..", "public", "assets");
const package = require(path.resolve("package.json"));
const bundleConfig = require(path.resolve(__dirname, "..", "config", "config.js"));
const bundleName = package.name;
const publicPath = `/${bundleName}/assets/`;


let config = null;
let verbose = false;

if (kernel.environment === "dev") {
  verbose = true;
  config = require("./webpack/webpack.dev.config.js");
} else {
  config = require("./webpack/webpack.prod.config.js");
  //dev = false;
}

module.exports = webpackMerge(config, {
  //context: context,
  target: "web",
  entry: {
    workbox: ["./Resources/js/workbox.js"]
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
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/', // where the fonts will go
            publicPath: `/${bundleName}/assets/fonts/` // override the default path
          }
        }]
      }, {
        // IMAGES
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [{
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              publicPath: `/${bundleName}/assets/images/`,
              outputPath: "/images/"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new htmlPlugin({
      filename: path.resolve("Resources", "views", "index.html.twig"),
      template: path.resolve("Resources", "templates", "index.html.twig"),
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
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
      allChunks: true
    }),
    //new WorkboxPlugin.GenerateSW(),
    new WorkboxPlugin.InjectManifest({
      swSrc: path.resolve("Resources", "workers", "service-worker.js"),
      swDest: path.resolve("Resources","public" ,"assets","service-worker.js"),
      //include: [/workbox/, /\.js$/, /\.css$/],
      importsDirectory: 'wb-assets',
      chunks: ['workbox']
    })
  ],
  devServer: {
    inline: true,
    hot: false
  }
});
