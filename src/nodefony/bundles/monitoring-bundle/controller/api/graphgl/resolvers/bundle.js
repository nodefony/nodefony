module.exports = {

  Query: {
    //  provides all functions for each API endpoint
    async getBundle(obj, field, context, info) {
      const {
        name
      } = field;
      let bundle = await context.kernel.getRegisteredBundles(name);
      if (bundle) {
        return JSON.stringify(bundle);
      }
      try {
        bundle = await context.kernel.getUnregistredBundle(name, context);
        if (bundle) {
          return JSON.stringify(bundle);
        }
        return null;
      } catch (e) {
        throw e;
      }
    },

    async getBundlePackage(obj, field, context, info) {
      const {
        name
      } = field;
      const bundle = context.kernel.getBundle(name);
      if (bundle) {
        return JSON.stringify(bundle.package);
      }
      try {
        const res = await context.kernel.getUnregistredBundle(name, context);
        if (res) {
          return JSON.stringify(res.package);
        }
        return null;
      } catch (e) {
        throw e;
      }
    },

    async getBundles(obj, field, context, info) {
      const {
        registred
      } = field;
      let tab = [];
      let result = null;
      if (registred) {
        tab = context.kernel.getRegisteredBundles();
      }
      result = await context.kernel.getUnregistredBundles();
      tab = tab.concat(result);
      return JSON.stringify(tab);
    }
  }
};
