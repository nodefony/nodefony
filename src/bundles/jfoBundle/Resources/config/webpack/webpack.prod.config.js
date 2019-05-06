const path = require("path");
const webpack = require('webpack');
const ExtractTextPluginCss = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const public = path.resolve(__dirname, "..", ".." ,"public");
const bundleName = path.basename( path.resolve( __dirname, "..", "..", "..") );
const commonConfig = require("./webpack.common.js");
// soon deprecated workroud for es6 minimify
const UglifyEsPlugin = require('uglify-es-webpack-plugin');
// wait new beta release to use for es6 minimify
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = webpackMerge( {
    watch           : false,
    entry           : {
      jfo      : ["./js/jfo.js"]
    },
    output          : {
        path        : public,
        filename    : "./assets/js/[name].js",
        library     : "[name]",
        libraryTarget: "umd"
    },
    externals       : {},
    resolve         : {},
    plugins         :[
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: { discardComments: {removeAll: true } },
            canPrint: true
        }),
        new UglifyEsPlugin({
          compress:true
        })
    ]
}, commonConfig );
