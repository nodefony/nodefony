/*
 *   WEBPACK DEV CONFIGURATION
 */
const webpackDevClient = "webpack-dev-server/client?https://" + kernel.hostHttps + "/";

module.exports = {
  devtool: "source-map",
  entry: {
    framework: ["./js/framework.js", webpackDevClient]
  },
  plugins: []
};
