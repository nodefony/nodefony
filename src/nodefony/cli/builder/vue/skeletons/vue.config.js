// vue.config.js
const {
  defineConfig
} = require('@vue/cli-service')
const webpack = require('webpack');
const path = require('path');
const Package = require(path.resolve("package.json"));
const packageVue = require(path.resolve("node_modules", "vue", "package.json"));
const outputDir = path.resolve("Resources", "public");
const indexPath = path.resolve("Resources", "views", 'index.html.twig');
const publicPath = "/{{bundleName}}";
const template = path.resolve('public', 'index.html');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const title = Package.name;
const nodeModule = path.resolve(process.cwd(), "node_modules");

{% if addons.vuetify %}
const vuetifyDir = path.dirname(require.resolve("vuetify"));
const packageVuetify = require(path.resolve(vuetifyDir, "..", "package.json"));
{% endif %}

process.env.VUE_APP_VERSION = Package.version;
process.env.VUE_APP_VUE_VERSION = packageVue.version;
process.env.VUE_APP_DEBUG = process.env.DEBUG_MODE;
process.env.VUE_APP_NODE_ENV = process.env.NODE_ENV;
{% if addons.vuetify %}
process.env.VUE_APP_VUETIFY_VERSION = packageVuetify.version;
{% endif %}
try {
  process.env.VUE_APP_DOMAIN = kernel.domain;
  process.env.VUE_APP_HTTP_PORT = kernel.httpPort;
  process.env.VUE_APP_HTTPS_PORT = kernel.httpsPort;
} catch (e) {}


let dev = true;
let debug = false
let watch = false

try {
  if (kernel.environment !== "dev") {
    dev = false;
  } else {
    watch = true;
  }
  debug = kernel.debug ? "*" : false;
} catch (e) {}

module.exports = defineConfig({
  lintOnSave: false,
  publicPath: publicPath,
  outputDir: outputDir,
  indexPath: indexPath,
  assetsDir: "assets",
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = title;
        args[0].template = template;
        args[0].chunks = ['app'];
        return args;
      });
  },

  configureWebpack: {
    cache: true,
    devtool: process.env.NODE_ENV === "development" ? "source-map" : false,
    watchOptions: {
      aggregateTimeout: 2000,
      ignored: /node_modules|assets|Resources|dist|tmp|public/,
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
      splitChunks: false,
    },
    output:{
      hotUpdateChunkFilename: 'hot/[id].[fullhash].hot-update.js',
      hotUpdateMainFilename: 'hot/[runtime].[fullhash].hot-update.json'
    },
    resolve: {
      alias: {
        "@bundles": path.join(__dirname, ".."),
        "@app": path.join(__dirname, "..", "..", "..", "app"),
        "vue": path.resolve(`./node_modules/vue`),
        "vue-router": path.resolve(`./node_modules/vue-router`)
      },
      extensions: ['.js', '.json', '.css', '.mjs'],
      fallback: {
        "path": false,
        "assert": false
      },
      modules: [nodeModule]
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${outputDir}/hot/*.hot-update.*`],
        dry: false,
        verbose: true,
        initialClean: true,
        cleanStaleWebpackAssets:true,
        protectWebpackAssets:true,
        cleanAfterEveryBuildPatterns:[],
        dangerouslyAllowCleanPatternsOutsideProject: true
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.NODE_DEBUG': JSON.stringify(debug)
      }),
    ]
  }{% if addons.vuetify %},
  pluginOptions: {
    vuetify: {}
  },
  transpileDependencies: [
    "vuetify"
  ]
  {% endif %}
})
