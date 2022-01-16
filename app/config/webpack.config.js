const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin").default;
const htmlPlugin = require('html-webpack-plugin');
const {
  merge
} = require('webpack-merge');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

// Default context <bundle base directory>
//const context = path.resolve(__dirname, "..", "Resources", "public");
const public = path.resolve(__dirname, "..", "Resources", "public", "assets");
const bundleName = path.basename(path.resolve(__dirname, ".."));
const publicPath = `/${bundleName}/assets/`;
const bundleConfig = require(path.resolve(__dirname, "config.js"));

let config = null;
const debug = kernel.debug ? "*" : false;
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
    filename: "./js/[contenthash]-[name].js",
    library: "[name]",
    libraryExport: "default",
    assetModuleFilename: '[contenthash][ext][query]'
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
        }, {
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
      filename: "./css/[contenthash]-[name].css"
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        "NODE_DEBUG": JSON.stringify(debug)
      }
    }),
    new htmlPlugin({
      filename: path.resolve("Resources", "views", "base.html.twig"),
      template: path.resolve("Resources", "templates", "base.html.twig"),
      title: bundleConfig.name,
      //favicon: dev ? "./Resources/public/images/app-logo.png" : false,
      cache: !dev,
      minify: {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      },
      xhtml: true,
      chunks: ['app'],
      templateParameters: bundleConfig
    }),
    new FaviconsWebpackPlugin({
      logo: './Resources/public/images/app-logo.png', // svg works too!
      cache: true,
      mode: 'webapp', // optional can be 'webapp', 'light' or 'auto' - 'auto' by default
      devMode: 'light', // optional can be 'webapp' or 'light' - 'light' by default
      outputPath: public,
      prefix: publicPath,
      publicPath: publicPath,
      favicons: {
        appName: 'nodefony-core',
        start_url: '/app/',
        appDescription: 'Project nodefony-core',
        developerName: 'ccamensuli@gmail.com',
        developerURL: "https://nodefony.net", // prevent retrieving from the nearest package.json
        background: '#2196F3',
        theme_color: '#2196F3',
        icons: {
          coast: false,
          yandex: false
        }
      }
    })
  ],
  devServer: {
    hot: false, // false || true || "only",
    progress: false
  }
});
