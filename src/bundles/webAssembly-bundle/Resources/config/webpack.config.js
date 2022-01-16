const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin").default;
const { merge } = require('webpack-merge');

// Default context <bundle base directory>
//const context = path.resolve(__dirname, "..", "public");
const public = path.resolve(__dirname, "..", "public", "assets");
const package = require(path.resolve("package.json"));

const bundleConfig = require(path.resolve(__dirname, "config.js"));
const bundleName = package.name;
const publicPath = "/webAssembly-bundle/assets/";

let wpconfig = null;
let dev = true;
const debug = kernel.debug ? "*" : false ;
if (kernel.environment === "dev") {
  wpconfig = require("./webpack/webpack.dev.config.js");
} else {
  wpconfig = require("./webpack/webpack.prod.config.js");
  dev = false;
}

module.exports = merge(wpconfig, {
  //context: context,
  target: "web",
  entry: {
    webAssembly:["./Resources/js/webAssembly.js"]
  },
  output: {
    path: public,
    publicPath: publicPath,
    filename: "./js/[name].js",
    library: "[name]",
    hashFunction: "xxhash64",
    libraryExport: "default"
  },
  externals: {},
  experiments: {
    //syncWebAssembly: true,
    //asyncWebAssembly: true
  },
  resolve: {
    extensions: ['.js', ".c", ".cpp",".wasm"],
    fallback:{
      "path": false,
      "fs":false
    }
  },
  module: {
    rules: [{
        // BABEL TRANSCODE
        test: new RegExp("\\.es6$|\\.js$"),
        exclude: new RegExp("node_modules"),
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }]
      }, {
        test: /\.(sa|sc|c)ss$/,
        use: [
          //'css-hot-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          }, {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      }, {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        type: 'asset/inline'
      }, {
        // IMAGES
        test: /\.(gif|png|jpe?g|svg)$/i,
        type: 'asset/resource',
        generator: {
           filename: "images/[name][ext][query]",
        }
      }, {
          test: /\.(c|cpp)$/,
          use: {
              loader: 'cpp-wasm-loader',
              options: {
                  // emitWasm: true, // emit WASM file built by emscripten to the build folder
                  // emccFlags: (existingFlags) => existingFlags.concat(["more", "flags", "here"]), // add or modify compiler flags
                  // emccPath: "path/to/emcc", // only needed if emcc is not in PATH,
                  memoryClass: false, // disable javascript memory management class,
                  // fetchFiles: true,
                  // asmJs: true,
                  // wasm: false,
                  // fullEnv: true
              }
          }
      }, {
        test: /\.wasm$/,
        use: {
          loader: 'wasm-loader'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].css"
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        "NODE_DEBUG":JSON.stringify(debug)
      }
    })
  ],
  devServer: {
    hot: false, // false || true || "only",
    progress:false
  }
});
