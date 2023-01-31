// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const {
  InjectManifest,
  GenerateSW
} = require("workbox-webpack-plugin");
const SitemapPlugin = require("sitemap-webpack-plugin").default;

// Example of object paths
// Object paths must have a `path` attribute -- others are optional,
// and fall back to global config (if any)
const paths = [
  {
    path: "/app",
    lastmod: "2021-01-04",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    path: "/users",
    lastmod: "2021-02-05",
    priority: 0.5,
    changefreq: "yearly"
  }
];

module.exports = {
  mode: "production",
  devtool: false,
  watch: false,
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          warnings: true,
          compress: true
        },
        extractComments: true,
        parallel: true
      })
    ]
  },
  plugins: [

    /* new InjectManifest({
      //mode: "production",
      swSrc: path.resolve("Resources", "workers", "service-worker.js"),
      swDest: path.resolve("Resources", "public", "assets", "service-worker.js"),
      exclude: [/\.map$/, /\.eot$/, /\.ttf$/, /\.twig$/, /\.map$/, /^(?:asset-)manifest.*\.js(?:on)?$/],
      //injectionPoint: '__WB_MANIFEST',
      include: [
        /\.js$/,
        /\.css$/,
        /\.woff2$/,
        /\.jpg$/,
        /\.png$/
      ],
      chunks: ['app']
    }),*/
    new GenerateSW({
      swDest: path.resolve("Resources", "public", "service-worker.js"),
      exclude: [/\.eot$/, /\.ttf$/, /\.twig$/, /\.map$/, /^(?:asset-)manifest.*\.js(?:on)?$/],
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      directoryIndex: "app",
      runtimeCaching: [{
        urlPattern: /./,
        handler: "StaleWhileRevalidate"
      }]
    }),
    new SitemapPlugin({
      base: "https://nodefony-core.net",
      paths,
      options: {
        filename: "sitemap.xml",
        lastmod: true,
        changefreq: "monthly",
        priority: 0.4
      }
    })
  ]
};
