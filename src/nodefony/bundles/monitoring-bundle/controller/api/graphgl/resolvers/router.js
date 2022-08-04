module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    getRoutes(obj, field, context, info) {
      const routerService = context.get("router");
      return routerService.routes;
    },

    getRouteByBundle(obj, field, context, info) {
      const {
        name
      } = field
      const routerService = context.get("router");
      const tab = routerService.routes.filter((item) => {
        if (item.bundle === name) {
          return item
        }
      })
      return tab
    }
  }
}
