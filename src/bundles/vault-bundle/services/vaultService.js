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
        try {
          return await this.prepareAuth()
        } catch (e) {
          this.log(e, "ERROR")
          return
        }
      })
    }
    this.path = this.kernel.tmpDir.path;
  }

  async initialize(prepare) {
    this.options = this.bundle.settings.vault
    this.config = this.options.config
    this.vault = await require("node-vault")(this.options.connect);
    //this.vaultStatus = await this.status();
    if (prepare) {
      this.log(`initialize vault service`)
      return await this.prepareAuth()
    }
  }

  async prepareAuth() {
    await this.createInitialMount();
    // policy
    await this.nodefonyPolicy();
    // creer auth approle
    return await this.auth();
  }

  createInitialMount() {
    return this.vault.mounts()
      .then((results) => {
        if (results.hasOwnProperty(`${this.config.mount.path}/`)) {
          return results[`${this.config.mount.path}/`];
        }
        return this.vault.mount({
          mount_point: this.config.mount.path,
          type: 'generic',
          description: 'Nodefony mount Point'
        })
      })
      .catch((err) => {
        this.log(err.message, "WARNING")
        //throw err
      });
  }

  nodefonyPolicy() {
    return this.vault.policies()
      .then((results) => {
        if (results.policies.includes(`${this.config.policy.name}`)) {
          return results;
        }
        this.log(`Create vault nodefony policy : ${this.config.policy.name}`)
        return this.vault.addPolicy(this.config.policy)
      })
      .then(() => this.vault.getPolicy({
        name: this.config.policy.name
      }))
      .then(this.vault.policies)
      .then((result) => {
        return result
      })
      .catch((err) => {
        this.log(err, "ERROR")
        throw err
      });
  }

  auth() {
    let exist = false
    return this.vault.auths()
      .then((result) => {
        if (result.hasOwnProperty(`${this.config.auths.approle.mountPoint}/`)) {
          exist = true
          return result;
        }
        this.log(`enableAuth vault nodefony authentication approle`)
        return this.vault.enableAuth({
            mount_point: `${this.config.auths.approle.mountPoint}`,
            type: 'approle',
            description: 'Approle auth Nodefony',
          })
          .then(() => {
            return result
          })
      })
      .then((result) => {
        if (exist) {
          return result;
        }
        this.log(`Create vault nodefony authentication approle name : ${this.config.auths.approle.roleName}`)
        return this.vault.addApproleRole({
          mount_point: `${this.config.auths.approle.mountPoint}`,
          role_name: this.config.auths.approle.roleName,
          policies: this.config.policy.name
        })
      })
      .then(() => {
        this.log(`Get vault nodefony auth credentials (id, secret) role : ${this.config.auths.approle.roleName}`)
        return Promise.all([this.vault.getApproleRoleId({
            mount_point: `${this.config.auths.approle.mountPoint}`,
            role_name: this.config.auths.approle.roleName
          }),
        this.vault.getApproleRoleSecret({
            mount_point: `${this.config.auths.approle.mountPoint}`,
            role_name: this.config.auths.approle.roleName
          })
      ])
      })
      .then((result) => {
        this.roleId = result[0].data.role_id;
        this.secretId = result[1].data.secret_id;
        return this.login(null, true);
      })
      .catch((err) => {
        this.log(err, "ERROR")
        throw err;
      });
  }

  async login(endpoint = this.options.connect.endpoint, init = false) {
    this.log(`Authentication vault server ${this.options.connect.endpoint}`)
    const vault = await require("node-vault")({
      apiVersion: 'v1',
      endpoint: endpoint
    });
    return vault.approleLogin({
        role_id: this.roleId,
        secret_id: this.secretId,
        mount_point: `${this.config.auths.approle.mountPoint}`,
      })
      .then((res) => {
        if (init) {
          return this.initializeSecrets(res)
        }
        return res
      })
      .catch((err) => {
        this.log(err, "ERROR")
        throw err
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

  addSecrets(secret, vault, options = {}) {
    const engine = vault || this.vault;
    return engine.write(secret.path, secret.data)
      .then(() => {
        return this.vault.read(secret.path)
      })
      .then((res) => {
        //return engine.delete(secret.path)
        return res
      })
      .catch((error) => {
        this.log(error, "ERROR")
        throw error
      });
  }

  async initializeSecrets(login, vault = null) {
    this.log(`Add vault secrets nodefony config `)
    for await (const secret of this.config.secrets) {
      await this.addSecrets(secret, vault)
    }
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
