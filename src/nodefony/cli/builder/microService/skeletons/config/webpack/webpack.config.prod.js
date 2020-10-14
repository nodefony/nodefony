const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: 'production',
  output: {
    filename: '[name].min.js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          warnings: true,
          compress: true
        },
        extractComments: true,
        parallel: true
      })
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      fallback: "style-loader",
      filename: "./css/[name].min.css",
      allChunks: true
    })
  ]


};
