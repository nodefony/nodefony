module.exports = {
  //  provides all functions for each API endpoint
  Query: {
    getLogs (obj, field, context, info) {
      try {
        return JSON.stringify(context.get("syslog").ringStack);
      } catch (e) {
        throw e;
      }
    }
  }

};
