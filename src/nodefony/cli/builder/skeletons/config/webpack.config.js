const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { merge } = require('webpack-merge');

{% if addons.workbox %}
const htmlPlugin = require('html-webpack-plugin');
const {InjectManifest} = require('workbox-webpack-plugin');
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
const publicPath = "/{{bundleName}}/assets/";

let wpconfig = null;
let dev = true;
const debug = kernel.debug ? "*" : false ;
if (kernel.environment === "dev") {
  wpconfig = require("./webpack/webpack.dev.config.js");
} else {
  wpconfig = require("./webpack/webpack.prod.config.js");
  dev = false;
}

module.exports = merge(wpconfig, {
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
        test: new RegExp("\\.es6$|\\.js$"),
        exclude: new RegExp("node_modules"),
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }]
      }, {% if addons.bootstrap %}{
        test: require.resolve('jquery'),
        rules: [{
          loader: 'expose-loader',
          options: {
            exposes: [{
              globalName: '$',
              override: true,
                }, {
              globalName: 'jQuery',
              override: true,
            }]
          }
        }]
      },{% endif %}{
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
           filename: "images/[name][ext][query]"
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].css"
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        "NODE_DEBUG":JSON.stringify(debug)
      }
    }),
{% if addons.workbox %}
    new InjectManifest({
      swSrc: path.resolve("Resources", "workers", "service-worker.js"),
      swDest: path.resolve("Resources","public" ,"assets","service-worker.js"),
      //include: [/workbox/, /\.js$/, /\.css$/],
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
    hot: false, // false || true || "only"
    progress:false
  }
});
