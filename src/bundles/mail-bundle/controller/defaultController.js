/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 */
module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.mailer = this.get("mail");
  }

  /**
   *
   *	@method indexAction
   *
   */
  indexAction() {
    return this.render("mail-bundle::index.html.twig", {
        name: "mail-bundle"
      })
      .then((html) => {
        return this.mailer.send({
            to: "ccamensuli@gmail.com", // list of receivers`
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
};