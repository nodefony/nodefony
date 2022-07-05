module.exports = {
  //  provides all functions for each API endpoint
  getLogs(field, context) {
    try {
      return  JSON.stringify(context.get("syslog").ringStack);
    } catch (e) {
      throw e;
    }
  },

}
