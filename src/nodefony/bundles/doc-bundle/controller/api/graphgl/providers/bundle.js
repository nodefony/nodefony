module.exports = {
  //  provides all functions for each API endpoint
  getBundlePackage(field, context) {
    const {
      name
    } = field
    const bundle = context.kernel.getBundle(name);
    return JSON.stringify(bundle.package);
  },


  loadBundleUnregister(name, bundle) {
    const package = path.resolve(bundle.path, "package.json")
    const pack = require(package)
    return {
      name: name , //pack.name.replace("@nodefony/", "").replace("-bundle", "").replace("Bundle", ""),
      packageName: pack.name,
      path: bundle.path,
      version: pack.version,
      registred: false
    }
  },

  async getBundles(field, context) {

    const {
      registred
    } = field
    let tab = []
    let objRegistred = {}
    const bundles = context.kernel.getBundles()
    for (const mybundle in bundles) {
      const bundle = bundles[mybundle];
      let ob = {
        name: bundle.name,
        packageName: bundle.package.name,
        path: bundle.path,
        version: bundle.version,
        registred: true
      }
      objRegistred[ob.name] = ob.registred
      if (registred) {
        tab.push(ob)
      }
    }
    //unregistered
    const finder = new nodefony.Finder2({
      recurse: false,
      depth: 1
    });
    let result = await finder
      .in(context.kernel.bundlesPath)
      .then((result) => {
        if (result[0].children.length) {
          return result[0].children
            .map((bundle) => {
              const name = context.kernel.regBundleName.exec(bundle.name)
              return this.loadBundleUnregister(name[1], bundle)
            })
            .filter((bundle) => {
              if (true) {
                return bundle
              }
            })
        }
      })
      .catch(e => {
        context.log(e, "ERROR");
      });
    tab = tab.concat(result)

    const localNodefony = path.resolve(context.kernel.nodefonyPath, "bundles")
    result = await finder
      .in(localNodefony)
      .then((result) => {
        if (result[0].children.length) {
          return result[0].children
            .map((bundle) => {
              const name = context.kernel.regBundleName.exec(bundle.name)
              return this.loadBundleUnregister(name[1], bundle)
            })
            .filter((bundle) => {
              if (!(bundle.name in objRegistred)) {
                return bundle
              }
            })
        }
      })
      .catch(e => {
        context.log(e, "ERROR");
      });
    tab = tab.concat(result)
    return JSON.stringify(tab)
  }



}
