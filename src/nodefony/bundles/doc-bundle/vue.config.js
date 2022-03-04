// vue.config.js
const path = require('path');
const Package = require(path.resolve("package.json"));
const packageVue = require(path.resolve("node_modules","vue","package.json"));
const outputDir = path.resolve("Resources", "public");
const indexPath = path.resolve("Resources", "views", 'index.html.twig');
const publicPath = "/doc-bundle";
const template = path.resolve('public', 'index.html');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const title = Package.name;

process.env.VUE_APP_VERSION = Package.version;
process.env.VUE_APP_VUE_VERSION = packageVue.version;
process.env.VUE_APP_DEBUG = process.env.DEBUG_MODE;
process.env.VUE_APP_NODE_ENV = process.env.NODE_ENV;

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
        return args;
      });
  },

  configureWebpack: {
    devtool: process.env.NODE_ENV === "development" ? "source-map" : "",
    output:{
      hotUpdateChunkFilename:'hot/[id].[fullhash].hot-update.js',
      hotUpdateMainFilename: 'hot/[fullhash].hot-update.json'
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${outputDir}/hot/*.hot-update.*`],
        dry: false,
        verbose: true,
        initialClean: true,
        cleanStaleWebpackAssets:true,
        protectWebpackAssets:true,
        cleanAfterEveryBuildPatterns:[],
        dangerouslyAllowCleanPatternsOutsideProject: true
      })
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
