//const path = require("path");
//const webpack = require('webpack');
//const ExtractTextPluginCss = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
//const public = path.resolve(__dirname, "..", "..", "public");
//const bundleName = path.basename(path.resolve(__dirname, "..", "..", ".."));
const commonConfig = require("./webpack.common.js");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = webpackMerge({
    watch: false,
    entry: {
        framework: ["./js/framework.js"]
    },
    plugins: [
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: true
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                warnings: true,
                compress: true
            },
            parallel: true
        })
    ]
}, commonConfig);
