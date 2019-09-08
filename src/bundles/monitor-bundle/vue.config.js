// vue.config.js
const path = require('path');

const outputDir = path.resolve(__dirname, "Resources", "public");
const indexPath = path.resolve(__dirname, "Resources", "views", 'index.html.twig');
const publicPath = "monitor-bundle";
const template = path.resolve(__dirname, 'public', 'index.html');

module.exports = {
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
    if ( process.env.NODE_ENV !== 'production'){
      config
        .module
        .rule('eslint')
        .use('eslint-loader')
        .options({
          fix: true
        });
      }
  }
};
