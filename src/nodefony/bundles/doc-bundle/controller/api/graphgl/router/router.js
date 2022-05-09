module.exports = {
  //  provides all functions for each API endpoint
  getRoutes(field, context) {
    const routerService = context.get("router");
    return routerService.routes;
  },

  getRouteByBundle(field, context){
    const {name} = field
    const routerService = context.get("router");
    const tab = routerService.routes.filter((item)=>{
      if(item.bundle === name ){
        return item
      }
    })
    return tab
  }
}
