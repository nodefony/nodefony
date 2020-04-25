// vue.config.js
const path = require('path');
const package = require(path.resolve("package.json"));
const outputDir = path.resolve("Resources", "public");
const indexPath = path.resolve("Resources", "views", 'index.html.twig');
const publicPath = "/{{bundleName}}";
const template = path.resolve('public', 'index.html');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

process.env.VUE_APP_VERSION = package.version;
process.env.VUE_APP_DEBUG = process.env.DEBUG_MODE;
process.env.VUE_APP_NODE_ENV = process.env.NODE_ENV;

module.exports = {
  lintOnSave: false,
  publicPath: publicPath,
  outputDir: outputDir,
  indexPath: indexPath,
  assetsDir: "assets",
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = template;
        return args;
      });
  },
  configureWebpack: {
    output:{
      hotUpdateChunkFilename: 'hot/hot-update.js',
      hotUpdateMainFilename: 'hot/hot-update.json'
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${outputDir}/hot/*.hot-update.*`],
        dry: false,
        dangerouslyAllowCleanPatternsOutsideProject: true
      })
    ]
  }
};
