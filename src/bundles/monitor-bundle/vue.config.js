// vue.config.js
const path = require('path');

const outputDir = path.resolve("Resources", "public");
const indexPath = path.resolve("Resources", "views", 'index.html.twig');
const publicPath = "monitor-bundle";

module.exports = {
  publicPath: publicPath,
  outputDir: outputDir,
  indexPath: indexPath,
  assetsDir: "assets",
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = path.resolve('public','index.html');
        return args;
      });
    config.module.rule('eslint').use('eslint-loader').options({
      fix: true
    });
  }
};
