module.exports = {
  //  provides all functions for each API endpoint
  getConfig(field, context) {

    return JSON.stringify(context.kernel.settings);
  },

  getConfigByBundle(field, context){
    const {name} = field
    const bunble = context.kernel.getBundle(name);
    
    return JSON.stringify(bunble.settings)
  }
}
