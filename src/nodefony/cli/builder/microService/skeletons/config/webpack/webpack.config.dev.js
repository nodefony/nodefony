const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      fallback: "style-loader",
      filename: "./css/[name].css",
      allChunks: true
    })
  ]
};
