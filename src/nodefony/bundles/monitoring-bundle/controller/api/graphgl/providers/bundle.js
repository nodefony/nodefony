module.exports = {
  //  provides all functions for each API endpoint
  async getBundlePackage(field, context) {
    const {
      name
    } = field
    const bundle = context.kernel.getBundle(name);
    if( bundle){
      return JSON.stringify(bundle.package);
    }
    try{
      const res = await this.getUnregistredBundle(name, context)
      if(res ){
        const pack = require(path.resolve(res.path,"package.json") )
        return JSON.stringify(pack);
      }
      return null
    }catch(e){
      throw e
    }
  },

  loadBundleUnregister(name, bundle) {
    const package = path.resolve(bundle.path, "package.json")
    const pack = require(package)
    return {
      name: name, //pack.name.replace("@nodefony/", "").replace("-bundle", "").replace("Bundle", ""),
      packageName: pack.name,
      path: bundle.path,
      version: pack.version,
      registred: false
    }
  },

  async getUnregistredBundle(nameBundle, context){
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
              const name = context.kernel.regBundleName.exec(bundle.name);
              if(name &&  nameBundle === name[1]){
                return this.loadBundleUnregister(name[1], bundle)
              }
              return null
            })
            .filter((bundle) => {
              if (bundle) {
                return bundle
              }
            })
        }
        return null
      })
      .catch(e => {
        context.log(e, "ERROR");
      });
      if( result.length){
        return result[0]
      }

      const localNodefony = path.resolve(context.kernel.nodefonyPath, "bundles")
      result = await finder
        .in(localNodefony)
        .then((result) => {
          if (result[0].children.length) {
            //console.log(result[0].children)
            return result[0].children
              .map((bundle) => {
                const name = context.kernel.regBundleName.exec(bundle.name)
                if(name &&  nameBundle === name[1]){
                  return this.loadBundleUnregister(name[1], bundle)
                }
                return null
              })
              .filter((bundle) => {
                if (bundle) {
                    return bundle
                }
              })
          }
          return null
        })
        .catch(e => {
          context.log(e, "ERROR");
        });
        if( result.length){
          return result[0]
        }
        return null
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
              const name = context.kernel.regBundleName.exec(bundle.name);
              if( ! (name[1] in bundles) ) {
                return this.loadBundleUnregister(name[1], bundle)
              }
              return false
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
          //console.log(result[0].children)
          return result[0].children
            .map((bundle) => {
              const name = context.kernel.regBundleName.exec(bundle.name)
              if (name) {
                return this.loadBundleUnregister(name[1], bundle)
              }
            })
            .filter((bundle) => {
              if (bundle) {
                if (!(bundle.name in objRegistred)) {
                  return bundle
                }
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
