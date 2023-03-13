let KcAdminClient = null;
import("@keycloak/keycloak-admin-client")
  .then((esmFS) => {
    KcAdminClient = esmFS.default;
  });


module.exports = class Keycloak extends nodefony.Service {
  constructor (container) {
    super("keyclaok", container);
    this.kcAdminClient = null;
    this.currentRealmName = null;
  }


  boot () {
    this.kernel.once("onReady", async () => {
      this.currentRealmName = "nodefony";
      await this.init({
        realm: {
          realmName: "nodefony",
          baseUrl: "http://localhost:8080"
        },
        auth: {
          username: "root",
          password: "root",
          grantType: "password",
          clientId: "admin-cli"
        // totp: '123456', // optional Time-based One-time Password if OTP is required in authentication flow
        }
      });
      const users = await this.userList();
      console.log(users);
      const groups = await this.groupList();
      console.log(groups);
      const events = await this.findEvents();
      console.log(events);
    });
  }

  async init (options) {
    try {
      this.kcAdminClient = new KcAdminClient(options.realm);
    } catch (e) {
      throw e;
    }
    await this.auth(options.auth)
      .catch((e) => {
        this.log(e, "ERROR");
      });
    return this.kcAdminClient;
  }

  async auth (options) {
    return await this.kcAdminClient.auth(options);
  }

  async userList () {
    // List all users
    return await this.kcAdminClient.users.find();
  }

  async groupList () {
    // This operation will now be performed in 'another-realm' if the user has access.
    return await this.kcAdminClient.groups.find();
  }

  async createUser (options) {
    return await this.kcAdminClient.users.create(options);
  }

  async findEvents () {
    return await this.kcAdminClient.realms.findEvents({
      realm: this.currentRealmName
    });
  }
};
