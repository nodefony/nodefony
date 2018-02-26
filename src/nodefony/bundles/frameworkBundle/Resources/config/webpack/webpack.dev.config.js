/*
 *   WEBPACK DEV CONFIGURATION
 */
const webpackDevClient = "webpack-dev-server/client?https://" + kernel.hostHttps + "/";

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    framework: ["./js/framework.js", webpackDevClient]
  },
  plugins: []
};