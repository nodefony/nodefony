const nodemailer = require("nodemailer");
const juice = require("juice");

module.exports = class mailer extends nodefony.Service {
  constructor (container) {
    super("mailer", container);
    this.nodemailer = nodemailer;
    this.transporters = {};
    this.domain = null;
    this.mailDefaultOptions = {};
    this.defaultTransporterOptions = {};
    this.domain = this.kernel.domain;
    this.httpKernel = this.get("httpKernel");
    this.defaultTransporterOptions.host = `smtp.${this.domain}`;
    if (this.kernel.ready) {
      this.config = this.bundle.settings.nodemailer;
      this.authorName = this.kernel.app.settings.App.authorName;
      this.authorMail = this.kernel.app.settings.App.authorMail;
      this.mailDefaultOptions.from = `"${this.authorName}" <${this.authorMail}>`;
      this.initialize();
    } else {
      this.kernel.once("onBoot", async () => {
        this.config = this.bundle.settings.nodemailer;
        this.authorName = this.kernel.app.settings.App.authorName;
        this.authorMail = this.kernel.app.settings.App.authorMail;
        this.mailDefaultOptions.from = `"${this.authorName}" <${this.authorMail}>`;
        this.initialize();
      });
    }
  }

  async initialize () {
    if (this.config && this.config.transporters) {
      for (const server in this.config.transporters) {
        if (server) {
          const transporter = this.createTransporter(server, this.config.transporters[server]);
          if (server === this.config.default) {
            this.transporter = transporter;
          }
        }
      }
    }
  }

  createTransporter (name, options) {
    const config = nodefony.extend({}, this.defaultTransporterOptions, options);
    const transporter = nodemailer.createTransport(config);
    this.verifyTransporter(name, transporter, options);
    return transporter;
  }

  // verify connection configuration
  verifyTransporter (name, transporter, options) {
    return transporter.verify((error, success) => {
      if (error) {
        this.log(error, "ERROR");
        throw error;
      } else if (success) {
        const info = `Create SNMP TRANSPOTER ${name || "default"}`;
        this.log(info, "INFO");
        this.log(options);
        if (!name) {
          this.transporter = transporter;
        } else {
          this.transporters[name] = transporter;
        }
      }
    });
  }

  sendTestMail (to, transporterName = null, context = null) {
    if (!this.config) {
      return Promise.reject(new Error("mail-bundle bad config"));
    }
    return this.renderTwig("mail-bundle::mail.html.twig", {}, context)
      .then((html) => this.juiceResources(html, {}, context)
        .then((htmlp) => {
          const message = {
            to: to || this.authorMail, // list of receivers`
            from: this.mailDefaultOptions.from,
            subject: `${this.kernel.projectName} ✔`, // Subject line
            text: "Test Email?", // plain text body
            html: htmlp, // html body
            attachments: [{
              filename: "nodefony.txt",
              content: "Nodefony attachement",
              contentType: "text/plain" // optional, would be detected from the filename
            }],
            list: {
              // List-Help: <mailto:admin@example.com?subject=help>
              help: `${this.authorMail}?subject=help`,
              // List-Unsubscribe: <http://example.com> (Comment)
              unsubscribe: [{
                url: `https://${this.domain}/mail/unsubscribe`,
                comment: "A short note about this url"
              },
              "unsubscribe@{this.domain}"]
            }
          };
          return this.sendMail(message, transporterName, context)
            .then((info) => {
              this.log(info);
              return html;
            })
            .catch((e) => {
              throw e;
            });
        })
        .catch((e) => {
          throw e;
        }))
      .catch((e) => {
        throw e;
      });
  }

  renderTwig (view, param = {}, context = null) {
    return new Promise((resolve, reject) => {
      try {
        let extendParam = {};
        if (context) {
          extendParam = this.httpKernel.extendTemplate(param, context);
        }
        const templ = this.httpKernel.getTemplate(view);
        return resolve(templ.render(extendParam));
      } catch (e) {
        return reject(e);
      }
    });
  }

  async sendMail (options, transporterName = this.config.default) {
    if (!this.transporter) {
      throw new Error("Service mail no transporter found ");
    }
    const conf = nodefony.extend({}, this.mailDefaultOptions, options);
    if (!transporterName) {
      return await this.transporter.sendMail(conf)
        .then((info) => {
          this.log(info, "INFO");
          return info;
        })
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    }
    if (transporterName in this.transporters) {
      return await this.transporters[transporterName].sendMail(conf);
    }
    throw new Error(`Bad Transporter ${transporterName}`);
  }

  juice (html, options) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(juice(html, options));
      } catch (err) {
        return reject(err);
      }
    });
  }

  juiceResources (html, options = {}, context = null) {
    return new Promise((resolve, reject) => {
      let settings = null;
      try {
        let relative = null;
        if (context) {
          relative = `${context.request.url.protocol}//${context.request.url.host}`;
        }
        settings = nodefony.extend(true, {
          // preserveFontFaces: true,
          applyStyleTags: true,
          removeStyleTags: true,
          preserveMediaQueries: false,
          preserveImportant: false,
          preservePseudos: false,
          // inlinePseudoElements: false,
          preserveKeyFrames: false,
          webResources: {
            relativeTo: relative,
            rebaseRelativeTo: relative,
            // images: true,
            scripts: false,
            requestTransform: (requestOptions) => nodefony.extend(requestOptions, {
              strictSSL: false
            })
          }
        }, options);
      } catch (e) {
        return reject(e);
      }
      juice.juiceResources(html, settings, (err, htmlp) => {
        if (err) {
          return reject(err);
        }
        return resolve(htmlp);
      });
    });
  }

  juiceInline (html, css, options) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(juice.inlineContent(html, css, options));
      } catch (err) {
        return reject(err);
      }
    });
  }

  juiceFile (filePath, options) {
    return new Promise((resolve, reject) => {
      juice.juiceFile(filePath, options, (err, htmlp) => {
        if (err) {
          return reject(err);
        }
        return resolve(htmlp);
      });
    });
  }
};
