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
        if (name === "mail" || name === "cv") {
          let conf = nodefony.extend({}, bunble.settings)
          if (conf.nodemailer && conf.nodemailer.transporters && conf.nodemailer.transporters.free) {
            delete conf.nodemailer.transporters.free
          }
          return JSON.stringify(bunble.settings)
        }
        return JSON.stringify(bunble.settings)
      }
      return JSON.stringify({})
    }
  }

}
