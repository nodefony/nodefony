let analyzer = null
if (kernel.environment === 'dev') {
  try {
    let analyzerResolve = require.resolve("webpack-bundle-analyzer")
    let lib = path.dirname(analyzerResolve)
    analyzer = require(path.resolve(lib, "analyzer.js"))
  } catch (e) {
    try {
      const monitoring = kernel.getBundle("monitoring-bundle")
      analyzer = require(path.resolve(monitoring.path, "node_modules", "webpack-bundle-analyzer", "lib", "analyzer.js"));
    } catch (e) {
      kernel.log(e, "WARNING")
    }
  }
}
const _ = require('lodash');

/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 */
class defaultController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    //this.startSession();
  }

  /**
   *    @Route ("/nodefony*",
   *      name="monitoring-index")
   */
  async indexAction() {
    if (this.context.request.url.pathname === "/nodefony/login") {
      if (this.session) {
        await this.session.invalidate()
      }
    }
    return this.render("monitoring-bundle::index.html.twig", {
      name: this.bundle.name,
      description: this.bundle.package.description
    });
  }

  /**
   *    @Route ("/nodefony/manifest.json",
   *      name="index-doc-manifest")
   */
  async manifesAction() {
    const manifestPath = path.resolve(this.bundle.path, 'Resources', 'public', 'manifest.json')
    const file = this.getFile(manifestPath)
    this.setContentType("application/manifest+json");
    return await file.readAsync();
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/api/nodefony/swagger",
   *      name="api-doc-swagger"
   *    )
   */
  swaggerAction() {
    this.hideDebugBar()
    this.response.setHeader("X-Frame-Options", "SAMEORIGIN")
    return this.render("monitoring-bundle:swagger:index.html.twig", {
      title: "Swagger openapi",
      config: `'${JSON.stringify(this.bundle.settings.swagger)}'`
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/api/nodefony/graphql",
   *      name="api-doc-graphql"
   *    )
   */
  graphiqlAction() {
    this.hideDebugBar()
    this.response.setHeader("X-Frame-Options", "SAMEORIGIN")
    return this.render("monitoring-bundle:graphiql:index.html.twig", {
      title: "graphiql",
      config: `'${JSON.stringify(this.bundle.settings.graphigl)}'`
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/documentation/webpackanalyser/{mybundle}",
   *      name="api-doc-webpackanalyser"
   *    )
   */
  analyserAction(mybundle) {
    if (this.kernel.environment === "prod") {
      throw new Error(`Webpack Analyzer not available in production `);
    }
    this.response.setHeader("X-Frame-Options", "SAMEORIGIN")
    this.hideDebugBar();
    return new Promise(async (resolve, reject) => {
      const bundle = this.kernel.getBundle(mybundle);
      //let chartData = null
      //let entrypoints = null
      //let defaultSizes = null
      //let info = null
      if (!bundle) {
        throw new Error(`Bundle ${mybundle} not registred`)
      }
      let compiler = bundle.webpackCompiler;
      if (!compiler) {
        shell.cd(bundle.path);
        compiler = await bundle.initWebpack.call(bundle);
        shell.cd(this.kernel.rootDir);
        if (!compiler) {
          return reject(new Error(`Bundle ${mybundle} has no  webpack configuration`))
        }
      }
      try {
        if (bundle.lastWebpackStats) {
          const data = this.generateAnalyzerData(bundle.lastWebpackStats, compiler)
          return resolve(this.render("monitoring-bundle:analyser:index.html.twig", data))
        } else {
          await compiler.close((closeErr) => {
            if (closeErr) {
              this.log(closeErr, "ERROR");
            }
          })
          return compiler.run((err, stats) => {
            if (err) {
              return reject(err)
            }
            const data = this.generateAnalyzerData(stats, compiler)
            return resolve(this.render("monitoring-bundle:analyser:index.html.twig", data))
          })
        }

      } catch (e) {
        this.log(e, "ERROR")
        return reject(e)
      }
    })
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/documentation/{bundle}/readme",
   *      name="nodefony-documentation-readme"
   *    )
   */
  async readmeAction(bundle) {
    let Bundle = null;
    if (bundle === "nodefony") {
      Bundle = this.kernel;
    } else {
      Bundle = this.kernel.getBundle(bundle);
    }
    //check unregistered
    if (!Bundle) {
      Bundle = await this.kernel.getUnregistredBundle(bundle);
    }
    try {
      const readmePath = path.resolve(Bundle.path, "README.md");
      if (readmePath) {
        const readme = this.getFile(readmePath);
        return this.renderJson({
          readme: await readme.readAsync()
        });
      }
      throw new Error('readme not found');
    } catch (e) {
      return this.createNotFoundException('readme not found');
    }
  }

  getChartData(analyzerOpts, ...args) {
    let chartData;
    const {
      logger
    } = analyzerOpts;

    try {
      chartData = analyzer.getViewerData(...args, analyzerOpts);
    } catch (err) {
      logger.error(`Could't analyze webpack bundle:\n${err}`);
      logger.debug(err.stack);
      chartData = null;
    }

    if (_.isPlainObject(chartData) && _.isEmpty(chartData)) {
      logger.error("Could't find any javascript bundles in provided stats file");
      chartData = null;
    }
    return chartData;
  }

  getEntrypoints(bundleStats) {
    if (bundleStats === null || bundleStats === undefined) {
      return [];
    }
    return Object.values(bundleStats.entrypoints || {}).map(entrypoint => entrypoint.name);
  }
  getBundleDirFromCompiler(compiler) {
    if (typeof compiler.outputFileSystem.constructor === 'undefined') {
      return compiler.outputPath;
    }
    switch (compiler.outputFileSystem.constructor.name) {
      case 'MemoryFileSystem':
        return null;
        // Detect AsyncMFS used by Nuxt 2.5 that replaces webpack's MFS during development
        // Related: #274
      case 'AsyncMFS':
        return null;
      default:
        return compiler.outputPath;
    }
  }

  escapeJson(json) {
    return JSON.stringify(json).replace(/</gu, '\\u003c');
  }

  generateAnalyzerData(stats, compiler) {
    try {
      const jsonStat = stats.toJson()
      let bundleDir = this.getBundleDirFromCompiler(compiler)
      const chartData = this.getChartData({}, jsonStat, bundleDir);
      const entrypoints = this.getEntrypoints(jsonStat)
      const defaultSizes = 'stat'
      return {
        title: "Webpack Analyser",
        chartData: this.escapeJson(chartData),
        entrypoints: this.escapeJson(entrypoints),
        defaultSizes: this.escapeJson(defaultSizes)
      }
    } catch (e) {
      throw e
    }
  }
}

module.exports = defaultController;
