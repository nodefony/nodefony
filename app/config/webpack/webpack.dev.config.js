const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
//  with PROXY
//const webpackDevClient = "webpack-dev-server/client?https://" + kernel.hostname + "/";
const webpackDevClient = "webpack-dev-server/client?https://" + kernel.hostHttps + "/";
const webpackHotModule = "webpack/hot/dev-server";
const public = path.resolve(__dirname, "..", "..", "Resources", "public");
module.exports = {
  mode: "development",
  entry: {
    app: [webpackDevClient, webpackHotModule]
  },
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin(['assets'], {
      verbose: true,
      root: public
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
};