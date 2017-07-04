const path = require("path");
const webpack = require('webpack');
const ExtractTextPluginCss = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const public = path.resolve(__dirname, "..", ".." ,"public");
const bundleName = path.basename( path.resolve( __dirname, "..", "..", "..") );
const commonConfig = require("./webpack.common.js");
const webpackDevClient = "webpack-dev-server/client?https://"+kernel.hostHttps+"/";

module.exports = webpackMerge( {
    target      : "web",
    watch       : true,
    devtool     : "source-map",
    entry       : {
      layout    : ["./js/layout.js", webpackDevClient ],
      demo      : "./js/index.js",
      finder    : "./js/finder/finder.js",
      login     : "./js/login.js"
    },
    output      : {
        path    : public,
        filename: "./assets/js/[name].js",
        library:  "[name]",
        libraryTarget: "umd"
    },
    externals   : {
        jquery  : "jQuery"
    },
    resolve     : {},
    plugins     :[
        new webpack.ProvidePlugin({
            "$":			"jquery",
            "jQuery":		"jquery",
            "window.jQuery":	"jquery"
        })
    ]
}, commonConfig );
