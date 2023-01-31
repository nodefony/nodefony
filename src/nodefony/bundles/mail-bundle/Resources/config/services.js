module.exports = {
  mailer: {
    class: nodefony.services.mailer,
    arguments: ["@container"]
  }
};
