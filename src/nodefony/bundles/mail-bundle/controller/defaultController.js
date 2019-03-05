/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 *  @Route ("/mail")
 */

module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.mailer = this.get("mail");
  }

  /**
   *   @Route ("/", name="nodefony-mail-default")
   */
  mailAction() {
    return this.render("mail-bundle::mail.html.twig", {
        name: "mail-bundle"
      })
      .then((html) => {
        return this.mailer.send({
            to: "ccamensuli@gmail.com ", // list of receivers`
            from: "ccamensuli@free.fr",
            subject: `${this.kernel.name} ✔`, // Subject line
            //text: "Hello world?", // plain text body
            html: html, // html body
          }, "free")
          .then((info) => {
            this.logger(info);
            return html;
          })
          .catch(e => {
            throw e;
          });
      })
      .catch((e) => {
        throw e;
      });
  }

  /**
   *  @Route ("/responsive", name="nodefony-mail-responsive")
   */
  mail2Action() {
    this.hideDebugBar();
    return this.render("mail-bundle::responsive.mail.html.twig", {
        name: "mail-bundle"
      })
      .then((html) => {
        return this.mailer.juiceResources(html, {}, this.context)
          .then((htmlp) => {
            return this.mailer.send({
                to: "ccamensuli@gmail.com, christophe.camensuli@sfr.com", // list of receivers`
                from: "ccamensuli@free.fr",
                subject: `${this.kernel.name} ✔`, // Subject line
                //text: "Hello world?", // plain text body
                html: htmlp, // html body
              })
              .then((info) => {
                this.logger(info);
                return html;
              })
              .catch(e => {
                throw e;
              });
          })
          .catch(e => {
            this.logger(e, "ERROR");
            throw e;
          });
      })
      .catch((e) => {
        this.logger(e, "ERROR");
        throw e;
      });
  }

  /**
   *
   */
  footerAction() {
    let version = this.kernel.settings.version;
    return this.render("mail::mail.footer.html.twig", {
      version: version,
      year: new Date().getFullYear()
    });
  }


};