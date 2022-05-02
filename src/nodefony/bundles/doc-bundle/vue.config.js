// vue.config.js
const webpack = require('webpack');
const path = require('path');
const Package = require(path.resolve("package.json"));
const packageVue = require(path.resolve("node_modules", "vue", "package.json"));
const outputDir = path.resolve("Resources", "public");
const indexPath = path.resolve("Resources", "views", 'index.html.twig');
const publicPath = "/doc-bundle";
const template = path.resolve('public', 'index.html');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const title = Package.name;
const htmlPlugin = require('html-webpack-plugin');
const bundleConfig = require(path.resolve("Resources", "config", "config.js"));
let dev = true;
let debug = false

try{
  if (kernel.environment !== "dev") {
    dev = false;
  }
  debug = kernel.debug ? "*" : false;
}catch(e){}

const packageVuetify = require(path.resolve("node_modules", "vuetify", "package.json"));

process.env.VUE_APP_VERSION = Package.version;
process.env.VUE_APP_VUE_VERSION = packageVue.version;
process.env.VUE_APP_DEBUG = process.env.NODE_DEBUG;
process.env.VUE_APP_NODE_ENV = process.env.NODE_ENV;
process.env.VUE_APP_VUETIFY_VERSION = packageVuetify.version;
try {
  process.env.VUE_APP_DOMAIN = kernel.domain;
  process.env.VUE_APP_HTTP_PORT = kernel.httpPort;
  process.env.VUE_APP_HTTPS_PORT = kernel.httpsPort;
} catch (e) {}

module.exports = {
  lintOnSave: true,
  publicPath: publicPath,
  outputDir: outputDir,
  indexPath: indexPath,
  assetsDir: "assets",

  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = title;
        args[0].template = template;
        args[0].chunks= ['app'];
        return args;
      });

    //console.log( config.module.rule())

  },

  configureWebpack: {
    devtool: process.env.NODE_ENV === "development" ? "source-map" : "",
    entry: {
      swagger: ["/Resources/swagger/swagger.js"],
      graphiql: ["/Resources/graphiql/graphiql.jsx"]
    },
    module: {
      rules: [{
        // BABEL TRANSCODE
        test: /\.(jsx)$/,
        exclude: new RegExp("node_modules"),
        use: [{
          loader: 'babel-loader',
          options: {
            //presets: ['@babel/preset-env', '@babel/preset-react']
            presets: [
                 ['@babel/preset-env', {
                modules: false
              }],
                 '@babel/preset-react',
               ],
          }
        }]
      }]
    },
    output: {
      hotUpdateChunkFilename: 'hot/[id].[fullhash].[runtime].hot-update.js',
      hotUpdateMainFilename: 'hot/[fullhash].[runtime].hot-update.json'
    },
    resolve: {
      alias: {
        //"@bundles": path.join(__dirname, ".."),
        //"@app": path.join(__dirname, "..","..","..", "app")
      },
      extensions: ['.js', '.json', '.jsx', '.css', '.mjs'],
      fallback: {
        "path": false,
        "assert": false
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV':JSON.stringify(process.env.NODE_ENV),
        'process.env.NODE_DEBUG':JSON.stringify(debug),
        'process.env.SWAGGER':JSON.stringify(bundleConfig.swagger),
        'process.env.GRAPHIQL':JSON.stringify(bundleConfig.graphigl)
      }),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${outputDir}/hot/*.hot-update.*`],
        dry: false,
        verbose: true,
        initialClean: true,
        cleanStaleWebpackAssets: true,
        protectWebpackAssets: true,
        cleanAfterEveryBuildPatterns: [],
        dangerouslyAllowCleanPatternsOutsideProject: true
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
        chunks: ['swagger'],
        templateParameters: bundleConfig
      }),
      new htmlPlugin({
        filename: path.resolve("Resources", "views", "base.graphiql.html.twig"),
        template: path.resolve("Resources", "templates", "base.html.twig"),
        title: bundleConfig.name,
        //favicon: dev ? "./Resources/public/images/app-logo.png" : false,
        cache: !dev,
        inject: "body",
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
        chunks: ['graphiql'],
        templateParameters: bundleConfig
      }),
    ]
  },

  transpileDependencies: [
    "vuetify"
  ],

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true
    }
  }
};
