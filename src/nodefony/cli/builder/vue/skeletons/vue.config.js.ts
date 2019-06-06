// vue.config.js
const path = require('path');

const outputDir = path.resolve("Resources", "public");
const indexPath = path.resolve("Resources", "views", 'index.html.twig');

module.exports = {
  publicPath: "{{bundleName}}",
  outputDir: outputDir,
  indexPath: indexPath,
  assetsDir: "assets",
  pages: {
    index: {
      // entry for the page
      entry: 'src/main.ts',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: indexPath,
      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Vue {{name}}',
      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }

  }
};
