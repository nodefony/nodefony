/*
 *  ENTRY POINT FRAMEWORK APP KERNEL
 */
"use strict;";
const blue = clc.blueBright.bold;
const {green} = clc;
// const yellow = clc.yellow.bold;
const magenta = clc.magenta.bold;
const {reset} = clc; // '\x1b[0m';

module.exports = class appKernel extends nodefony.kernel {
  constructor (environment, cli, settings) {
    // kernel constructor
    try {
      super(environment, cli, settings);
      this.appEnvironment = this.getAppEnvironment();
      if (this.appEnvironment.environment === "development") {
        this.once("onPreRegister", () => {
          if (this.type === "SERVER") {
            return this.showBanner();
          }
        });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  showBanner () {
    let banner = "App Environment";
    for (const ele in this.appEnvironment) {
      const module = this.appEnvironment[ele];
      switch (ele) {
      case "environment":
        banner = `       ${magenta("Application Environement")} : ${green(module)}`;
        console.log(banner);
        this.cli.blankLine();
        break;
      case "vault":
        banner = `Module :  ${green(ele)}     Vault : ${blue(module.active)}`;
        this.log(banner);
        break;
      default:
        banner = `Module :  ${green(ele)}     `;
        if (module.vault) {
          banner += `Vault : ${blue(module.vault.active)}`;
        }
        this.log(banner);
      }
    }
    this.cli.blankLine();
  }

  getAppEnvironment () {
    const environment = this.getVariableEnvironment();
    return {
      environment,
      database: this.getDatabaseEnvironment(environment),
      vault: this.getVaultEnvironment(environment)
    };
  }

  getVariableEnvironment () {
    if (process.env.NODEFONY_ENV) {
      return process.env.NODEFONY_ENV;
    }
    const production = process.env.NODE_ENV === "production";
    const development = process.env.NODE_ENV === "development";
    if (production) {
      return "production";
    }
    if (development) {
      return "development";
    }
    return "development";
  }

  /* VAULT BUNDLE */
  getVaultEnvironment (environment) {
    switch (environment) {
    case "production":
      return {
        active: true,
        prepareAuth: false,
        getVaultCredentialsApprole: this.getVaultCredentialsApprole(environment)
      };
    case "development":
    default:
      return {
        active: true,
        prepareAuth: true,
        getVaultCredentialsApprole: this.getVaultCredentialsApprole(environment)
      };
    }
  }

  getDatabaseEnvironment (environment) {
    switch (environment) {
    case "production":
      return {
        vault: {
          active: true,
          path: "nodefony/data/postgresql/connector/nodefony"
        }
      };
    case "development":
    default:
      return {
        vault: {
          active: false,
          path: "nodefony/data/sqlite/connector/nodefony"
        }
      };
    }
  }

  getVaultCredentialsApprole (environment) {
    switch (environment) {
    case "production":
      return async () => ({
        role_id: "",
        secret_id: ""
      });
    case "development":
    default:
      return null;
    }
  }
};
