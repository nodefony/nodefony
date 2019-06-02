// WEBPACK DEV CONFIGURATION
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: "development",
  devtool: "source-map",
  resolve: {},
  plugins: [
    new CleanWebpackPlugin({
      verbose: kernel.debug
    })
    //new webpack.NamedModulesPlugin(),
    //new webpack.HotModuleReplacementPlugin()
  ]
};
