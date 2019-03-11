//const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
//const public = path.resolve(__dirname, "..", "..", "public");

module.exports = {
  mode: "development",
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin({
      verbose: kernel.debug
    })
    //new webpack.NamedModulesPlugin(),
    //new webpack.HotModuleReplacementPlugin()
  ]
};