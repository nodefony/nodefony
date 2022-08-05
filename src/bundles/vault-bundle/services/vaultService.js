module.exports = class vault extends nodefony.Service {

  constructor(container) {
    super("vault", container);
    if (this.kernel.ready) {
      this.initialize(true)
    } else {
      this.kernel.once('onBoot', () => {
        this.initialize()
      });
      this.kernel.once("onReady", async () => {
        try{
          return await this.prepareAuth()
        }catch(e){
          this.log(e, "ERROR")
          return
        }
      })
    }
    this.path = this.kernel.tmpDir.path;
  }

  async initialize(prepare) {
    this.options = this.bundle.settings.vault
    this.vault = await require("node-vault")(this.options);
    //this.vaultStatus = await this.status();
    if (prepare) {
      return await this.prepareAuth()
    }
  }

  async prepareAuth() {
    // policy
    await this.nodefonyPolicy()
    // creer auth approle
    return await this.auth()
  }

  nodefonyPolicy() {
    return this.vault.policies()
      .then(() => {
        return this.vault.addPolicy({
          name: 'nodefony-policy',
          rules: '{ "path": { "secret/data/corp/si/services/netbox/*": { "policy": "read" } } }',
        });
      })
      .then(() => this.vault.getPolicy({
        name: 'nodefony-policy'
      }))
      .then(this.vault.policies)
      .then((result) => {
        //console.log(result);
        return result
        /*return this.vault.removePolicy({
          name: 'netbox'
        });*/
      })
      .catch((err) => {
        this.log(err, "ERROR")
        throw err
      });
  }

  auth() {
    return this.vault.auths()
      .then((result) => {
        if (result.hasOwnProperty('approle/')) {
          return undefined;
        }
        return this.vault.enableAuth({
          mount_point: this.options.mountPoint,
          type: 'approle',
          description: 'Approle auth',
        });
      })
      .then(() => this.vault.addApproleRole({
        role_name: this.options.roleName,
        policies: 'nodefony-policy'
      }))
      .then(() => Promise.all([this.vault.getApproleRoleId({
          role_name: this.options.roleName
        }),
        this.vault.getApproleRoleSecret({
          role_name: this.options.roleName
        })
      ]))
      .then((result) => {
        this.roleId = result[0].data.role_id;
        this.secretId = result[1].data.secret_id;
        return result
      })
      .catch((err) => {
        this.log(err, "ERROR")
        throw err;
      });
  }

  async login(endpoint = this.options.endpoint) {
    const vault = await require("node-vault")({
      apiVersion: 'v1',
      endpoint: endpoint
    });
    return vault.approleLogin({
        role_id: this.roleId,
        secret_id: this.secretId
      })
      .then(() => {
        return this.readNetboxToken(vault)
      })
      .then((response) => {
        if (response && response.data) {
          return response.data.data;
        }
        return null
      })
      .catch((err) => {
        this.log(err, "ERROR")
      })
  }

  status() {
    return this.vault.status()
      .then((status) => {
        return status
      })
      .catch((err) => {
        this.log(err, "ERROR")
      })
  }

  readNetboxToken(vault) {
    let pathVault = null;
    switch (this.kernel.environment) {
      case "prod":
        pathVault = this.options.netbox.prod
        break;
      case "dev":
        pathVault = this.options.netbox.dev
        break;
    }
    return vault.read(pathVault)
      .then((data) => {
        return data
      })
      .catch((error) => {
        this.log(error, "ERROR", `VAULT path: ${pathVault}`)
        throw error;
      });
  }

  /*test() {
    return this.vault.write('secret/data/cci', {
        value: 'world',
        lease: '10h',
        data: {
          foo: "bar"
        }
      })
      .then(() => {
        return this.vault.read('secret/data/cci')
      })
      .then(() => this.vault.delete('secret/data/cci'))
      .catch((error) => {
        console.log(error.response)
        this.log(error, "ERROR")
      });
  }
  mount() {
    return this.vault.mounts()
      .then(() => this.vault.mount({
        mount_point: 'test',
        type: 'generic',
        description: 'just a test'
      }))
      .then(() => this.vault.write('test/hello', {
        value: 'world',
        lease: '1h'
      }))
      .then(() => vault.remount({
        from: 'test',
        to: 'test2'
      }))
      .then(() => this.vault.read('test2/hello'))
      .then((ele) => {
        console.log(ele)
        return ele
      })
      .then(() => this.vault.unmount({
        mount_point: 'test2'
      }))
      .catch((err) => {
        console.log(err)
        this.log(err, "ERROR")
      });
  }

  audit() {
    process.env.DEBUG = 'node-vault'
    return this.vault.audits()
      .then((result) => {
        if (result.hasOwnProperty('testlog/')) {
          return undefined;
        }
        return this.vault.enableAudit({
          name: 'testlog',
          type: 'file',
          options: {
            path: this.path
          }
        });
      })
      .then(() => this.vault.write('secret/data/hello', {
        value: 'world',
        lease: '1s'
      }))
      .then(() => this.vault.read('secret/data/hello'))
      .then(() => this.vault.delete('secret/data/hello'))
      .then(() => this.vault.disableAudit({
        name: 'testlog'
      }))
      .catch((err) => console.error(err.message));
  }*/
};
