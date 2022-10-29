module.exports = {

  Query: {
    async getWebpackConfigBundle(obj, field, context, info) {
      const {
        name
      } = field
      const bundle = context.kernel.getBundle(name);
      const config = await bundle.findWebPackConfig()
      const res = {
        file: bundle.webpackConfigFile.path,
        config: ""
      }
      return JSON.stringify(res);
    }
  }


}
