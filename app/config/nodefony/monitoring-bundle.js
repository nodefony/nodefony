/**
 *    OVERRIDE MONITORING BUNDLE
 *
 *    see MONITORING BUNDLE config for more options
 *
 */
module.exports = {
  debugBar: true,
  forceDebugBarProd: true,
  profiler: {
    active: false,
    storage: "orm"
  },

  swagger: {
    projectName: "NODEFONY",
    logo: "/app/images/app-logo.png",
    urls: [{
      url: "/api/users/documentation",
      name: "users"
    }, {
      url: "/api/jwt/documentation",
      name: "login"
    }],
    primaryName: "users"
  },

  // entry point graphigl monitoring
  graphigl: {
    projectName: "Nodefony Graphql Api",
    logo: "/app/images/app-logo.png",
    url: "/api/graphql"
  }
};
