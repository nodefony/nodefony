// vue.config.js
const {
  defineConfig
} = require("@vue/cli-service");
const webpack = require("webpack");
const path = require("path");
const Package = require(path.resolve("package.json"));
const vueDir = path.dirname(require.resolve("vue"));
const packageVue = require(path.resolve(vueDir, "package.json"));
const outputDir = path.resolve("Resources", "public");
const indexPath = path.resolve("Resources", "views", "index.html.twig");
const publicPath = "/monitoring-bundle";
const template = path.resolve("public", "index.html");
const {
  CleanWebpackPlugin
} = require("clean-webpack-plugin");
// const title = Package.name;
const title = "Nodefony";
const htmlPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const GoogleFontsPlugin = require("@beyonk/google-fonts-webpack-plugin");
const bundleConfig = kernel.getBundle("monitoring").settings;
let dev = true;
let debug = false;
let watch = false;

try {
  if (kernel.environment !== "dev") {
    dev = false;
  } else {
    watch = true;
  }
  debug = kernel.debug ? "*" : false;
} catch (e) { }

const vuetifyDir = path.dirname(require.resolve("vuetify"));
const packageVuetify = require(path.resolve(vuetifyDir, "..", "package.json"));
// const nodeModule = path.resolve(process.cwd(), "node_modules");

process.env.VUE_APP_VERSION = Package.version;
process.env.VUE_APP_VUE_VERSION = packageVue.version;
process.env.VUE_APP_DEBUG = process.env.NODE_DEBUG;
process.env.VUE_APP_NODE_ENV = process.env.NODE_ENV;
process.env.VUE_APP_VUETIFY_VERSION = packageVuetify.version;
try {
  process.env.VUE_APP_DOMAIN = kernel.domain;
  process.env.VUE_APP_HTTP_PORT = kernel.httpPort;
  process.env.VUE_APP_HTTPS_PORT = kernel.httpsPort;
} catch (e) { }

module.exports = defineConfig({
  lintOnSave: false,
  publicPath,
  outputDir,
  indexPath,
  assetsDir: "assets",

  chainWebpack: (config) => {
    config
      .plugin("html")
      .tap((args) => {
        args[0].title = title;
        args[0].template = template;
        args[0].chunks = ["app"];
        return args;
      });
  },

  configureWebpack: {
    // context:process.cwd(),
    cache: true,
    infrastructureLogging: {
      // appendOnly: true,
      // level: 'verbose',
      // debug: true,
      // colors: true,
    },
    watchOptions: {
      aggregateTimeout: 1000,
      ignored: /node_modules|assets|dist|tmp|public|Entity/,
      followSymlinks: false
    },
    performance: {
      hints: false,
      maxEntrypointSize: 11000000,
      maxAssetSize: 11000000
    },
    optimization: {
      runtimeChunk: true,
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false
      // emitOnErrors: true,
    },
    devtool: process.env.NODE_ENV === "development" ? "eval-cheap-module-source-map" : false,
    entry: {
      swagger: ["/Resources/swagger/swagger.js"],
      graphiql: ["/Resources/graphiql/graphiql.jsx"],
      analyser: ["/Resources/analyser/analyser.js"]
    },
    module: {
      parser: {
        javascript: {
          exportsPresence: false
        }
      },
      rules: [{
        // BABEL TRANSCODE
        test: /\.(jsx)$/,
        exclude: new RegExp("node_modules"),
        use: [{
          loader: "babel-loader",
          options: {
            // presets: ['@babel/preset-env', '@babel/preset-react']
            presets: [
              ["@babel/preset-env", {
                modules: false
              }],
              "@babel/preset-react"
            ]
          }
        }]
      }]
    },
    output: {
      hotUpdateChunkFilename: "hot/[id].[fullhash].hot-update.js",
      hotUpdateMainFilename: "hot/[runtime].[fullhash].hot-update.json"
    },
    resolve: {
      alias: {
        "@bundles": path.join(__dirname, ".."),
        "@app": path.join(__dirname, "..", "..", "..", "app"),
        "vue": path.resolve("./node_modules/vue"),
        "vue-router": path.resolve("./node_modules/vue-router"),
        "bundle-analyser": path.resolve("./node_modules/webpack-bundle-analyzer/public/viewer.js")
      },
      extensions: [".js", ".json", ".jsx", ".css", ".mjs"],
      fallback: {
        "path": false,
        "assert": false,
        "querystring": require.resolve("querystring-es3")
      }
      // modules: [nodeModule]
    },
    plugins: [

      /* new webpack.ProgressPlugin({
        entries: true,
        activeModules:true,
        handler(percentage, message, ...args) {
          console.info(percentage, message, ...args);
        },
        modules: true,
        //modulesCount: 5000,
        profile: true,
        dependencies: true,
        //dependenciesCount: 10000,
        percentBy:"entries"
      }),*/
      new MiniCssExtractPlugin({
        filename: "./assets/css/[name].css"
      }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "process.env.NODE_DEBUG": JSON.stringify(debug),
        "process.env.SWAGGER": JSON.stringify(bundleConfig.swagger),
        "process.env.GRAPHIQL": JSON.stringify(bundleConfig.graphigl)
      }),

      /* new GoogleFontsPlugin({
        fonts: [{
          family: "Gochi Hand"
        }],
        path: "assets/fonts",
        //local:false
      }),*/
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${outputDir}/hot/*.hot-update.*`],
        dry: false,
        verbose: true,
        initialClean: true,
        cleanStaleWebpackAssets: true,
        protectWebpackAssets: true,
        cleanAfterEveryBuildPatterns: [],
        dangerouslyAllowCleanPatternsOutsideProject: true
      }),
      new htmlPlugin({
        filename: path.resolve("Resources", "views", "base.html.twig"),
        template: path.resolve("Resources", "templates", "base.html.twig"),
        title: bundleConfig.name,
        favicon: "./Resources/public/img/icons/favicon.png",
        cache: dev,
        minify: {
          collapseWhitespace: true,
          keepClosingSlash: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true
        },
        xhtml: true,
        chunks: ["swagger"],
        templateParameters: bundleConfig
      }),
      new htmlPlugin({
        filename: path.resolve("Resources", "views", "base.graphiql.html.twig"),
        template: path.resolve("Resources", "templates", "base.html.twig"),
        title: bundleConfig.name,
        favicon: "./Resources/public/img/icons/favicon.png",
        cache: dev,
        inject: "body",
        minify: {
          collapseWhitespace: true,
          keepClosingSlash: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true
        },
        xhtml: true,
        chunks: ["graphiql"],
        templateParameters: bundleConfig
      }),
      new htmlPlugin({
        filename: path.resolve("Resources", "views", "analyser.html.twig"),
        template: path.resolve("Resources", "templates", "base.html.twig"),
        title: bundleConfig.name,
        favicon: "./Resources/public/img/icons/favicon.png",
        cache: dev,
        inject: "body",
        minify: {
          collapseWhitespace: true,
          keepClosingSlash: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true
        },
        xhtml: true,
        chunks: ["analyser"],
        templateParameters: bundleConfig
      })
    ]
  },
  // transpileDependencies: true,
  transpileDependencies: [
    "vuetify"
  ],

  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true
    }
  },
  pwa: {
    name: "nodefony-monitoring",
    // manifestPath:"",
    manifestOptions: {
      start_url: "./nodefony",
      id: "./monitoring-bundle",
      scope: "./nodefony"
    },
    workboxOptions: {
      chunks: ["app", "swagger", "graphiql"],
      maximumFileSizeToCacheInBytes: 9000000
    }
  }
});
