// WEBPACK DEV CONFIGURATION
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const public = path.resolve(__dirname, "..", "..", "public");

module.exports = {
  mode: "development",
  devtool: "source-map",
  resolve: {},
  plugins: [
    new CleanWebpackPlugin({
      verbose: kernel.debug,
      root: public
    })
    //new webpack.NamedModulesPlugin(),
    //new webpack.HotModuleReplacementPlugin()
  ]
};
