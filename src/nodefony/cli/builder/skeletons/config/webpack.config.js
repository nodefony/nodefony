//const bundleName = path.basename(path.resolve(__dirname, ".."));

const path = require("path");
//const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpackMerge = require('webpack-merge');

{% if addons.workbox %}
const htmlPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
{% endif %}

{% if packageName == "app" %}
// Default context <bundle base directory>
//const context = path.resolve(__dirname, "..", "Resources", "public");
const public = path.resolve(__dirname, "..", "Resources", "public", "assets");
const package = require(path.resolve("package.json"));
{% else %}
// Default context <bundle base directory>
//const context = path.resolve(__dirname, "..", "public");
const public = path.resolve(__dirname, "..", "public", "assets");
const package = require(path.resolve("package.json"));
{% endif %}

const bundleConfig = require(path.resolve(__dirname, "config.js"));
const bundleName = package.name;
const publicPath = `/${bundleName}/assets/`;

let config = null;
let dev = true;
if (kernel.environment === "dev") {
  config = require("./webpack/webpack.dev.config.js");
} else {
  config = require("./webpack/webpack.prod.config.js");
  dev = false;
}


module.exports = webpackMerge(config, {
  //context: context,
  target: "web",
  entry: {
{% if packageName == "app" %}
    app: ["./Resources/js/app.js"]
{% else %}
    {{name}}:["./Resources/js/{{name}}.js"]
{% endif %}
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
      }, {% if addons.bootstrap %}{
      /*
       *	JQUERY EXPOSE BROWSER CONTEXT
       *
       */
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: 'jQuery'
        }, {
          loader: 'expose-loader',
          options: '$'
        }]
      }, {
        test: /jquery\..*\.js/,
        use: "imports-loader?$=jquery,jQuery=jquery,this=>window"
      }, {% endif %}{
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
            publicPath: `${publicPath}/fonts/` // override the default path
          }
        }]
      }, {
        // IMAGES
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [{
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              publicPath: `${publicPath}/images/`,
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
    }),
{% if addons.workbox %}
    new WorkboxPlugin.InjectManifest({
      swSrc: path.resolve("Resources", "workers", "service-worker.js"),
      swDest: path.resolve("Resources","public" ,"assets","service-worker.js"),
      //include: [/workbox/, /\.js$/, /\.css$/],
      importsDirectory: '{{shortName}}-assets',
      chunks: ['{{shortName}}']
    }),
    new htmlPlugin({
      filename: path.resolve("Resources", "views", "index.html.twig"),
      template: path.resolve("Resources", "templates", "index.html.twig"),
      title: '{{name}} PWA',
      cache: !dev,
      inject: false,
      compile: true,
      minify: {
        removeAttributeQuotes: true
      },
      xhtml: true,
      chunks: ['{{shortName}}'],
      config: bundleConfig
    }),
{% endif %}
  ],
  devServer: {
    inline: true,
    hot: false
  }
});
