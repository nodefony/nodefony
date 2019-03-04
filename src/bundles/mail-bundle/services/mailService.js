const nodemailer = require("nodemailer");

module.exports = class mail extends nodefony.Service {

  constructor(container) {
    super("mail", container);
    this.nodemailer = nodemailer;
    this.transporters = {};
    this.domain = null;
    this.config = this.bundle.settings.nodemailer;
    this.mailDefaultOptions = {};
    this.defaultTransporterOptions = {};
    if (!this.kernel.ready) {
      this.kernel.once("onBoot", () => {
        this.authorName = this.kernel.app.settings.App.authorName;
        this.authorMail = this.kernel.app.settings.App.authorMail;
        this.mailDefaultOptions.from = `"${this.authorName}" <${this.authorMail}>`;
      });
    }
  }

  async initialize(domain) {
    this.domain = domain;
    this.defaultTransporterOptions.host = `smtp.${this.domain}`;
    if (this.config.transporters) {
      for (let server in this.config.transporters) {
        if (server) {
          let transporter = this.createTransporter(server, this.config.transporters[server]);
          if (server === this.config.default) {
            this.transporter = transporter;
          }
        }
      }
    }
  }

  createTransporter(name, options) {
    let config = nodefony.extend({}, this.defaultTransporterOptions, options);
    let transporter = nodemailer.createTransport(config);
    this.verifyTransporter(name, transporter, options);
    return transporter;
  }

  // verify connection configuration
  verifyTransporter(name, transporter, options) {
    return transporter.verify((error, success) => {
      if (error) {
        this.logger(error, "ERROR");
        throw error;
      } else {
        if (success) {
          let info = `Create SNMP TRANSPOTER ${name|| "default"}`;
          this.logger(info, "INFO");
          this.logger(options);
          if (!name) {
            this.transporter = transporter;
          } else {
            this.transporters[name] = transporter;
          }
        }
      }
    });
  }

  async sendTestMail(to, from, transporterName) {
    return this.send({
      to: to, // list of receivers`
      from: from,
      subject: `${this.kernel.name} ✔`, // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
      dsn: {
        id: 'some random message specific id',
        return: 'headers',
        notify: 'success',
        recipient: from
      },
      attachments: [
            // String attachment
        {
          filename: 'notes.txt',
          content: 'Some notes about this e-mail',
          contentType: 'text/plain' // optional, would be detected from the filename
            }],
      list: {
        // List-Help: <mailto:admin@example.com?subject=help>
        help: 'ccamensuli@gmail.com?subject=help',
        // List-Unsubscribe: <http://example.com> (Comment)
        unsubscribe: [{
            url: 'http://example.com/unsubscribe',
            comment: 'A short note about this url'
          },
          'unsubscribe@example.com'
        ],

        // List-ID: "comment" <example.com>
        id: {
          url: 'mylist.example.com',
          comment: 'This is my awesome list'
        }
      }
    }, transporterName);
  }

  async send(options, transporterName) {
    //console.log(this.mailDefaultOptions)
    let conf = nodefony.extend({}, this.mailDefaultOptions, options);
    //console.log(conf)
    if (!transporterName) {
      return await this.transporter.sendMail(conf)
        .then((info) => {
          this.logger(info, "INFO");
          return info;
        })
        .catch(e => {
          this.logger(e, "ERROR");
          throw e;
        });
    }
    if (transporterName in this.transporters) {
      return await this.transporters[transporterName].sendMail(conf);
    }
    throw new Error("bad Transporter");
  }


};