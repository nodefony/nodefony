// WEBPACK DEV CONFIGURATION

const webpackDevClient = "webpack-dev-server/client?https://" + kernel.hostHttps + "/";

module.exports = {
  mode: "development",
  entry: {
    workbox: [webpackDevClient]
  },
  devtool: "source-map",
  resolve: {},
  plugins: []
};