//const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const public = path.resolve(__dirname, "..", "..", "public");

module.exports = {
  mode: "development",
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin(['assets'], {
      verbose: true,
      root: public
    })
    //new webpack.NamedModulesPlugin(),
    //new webpack.HotModuleReplacementPlugin()
  ]
};