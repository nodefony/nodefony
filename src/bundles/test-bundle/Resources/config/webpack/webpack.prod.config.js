// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  watch: false,
  externals: {},
  resolve: {},
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          warnings: true,
          compress: true
        },
        parallel: true
      })
    ]
  },
  plugins: [

    /* new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {
        discardComments: {
          removeAll: true
        }
      },
      canPrint: true
    })*/
  ]
};
