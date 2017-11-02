// WEBPACK PROD CONFIGURATION
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// soon deprecated workroud for es6 minimify
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  watch: false,
  externals: {},
  resolve: {},
  plugins: [
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {
        discardComments: {
          removeAll: true
        }
      },
      canPrint: true
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: true,
        compress: true
      },
      parallel: true
    })
  ]
};
