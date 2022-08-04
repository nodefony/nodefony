module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    getConfig(obj, field, context, info) {
      return JSON.stringify(context.kernel.settings);
    },

    getConfigByBundle(obj, field, context, info) {
      const {
        name
      } = field
      const bunble = context.kernel.getBundle(name);
      if (bunble) {
        return JSON.stringify(bunble.settings)
      }
      return JSON.stringify({})
    }
  }

}
