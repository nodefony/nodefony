module.exports = {
  //  provides all functions for each API endpoint
  getBundlePackage(field, context) {
    const {name} = field
    const bundle = context.kernel.getBundle(name);
    return JSON.stringify(bundle.package);
  }

}
