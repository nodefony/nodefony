/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 *  @Route ("/nodefony/test/mail")
 */
const puppeteer = require('puppeteer');

module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.mailer = this.get("mail");
  }

  /**
   *   @Route ("", name="nodefony-mail-default")
   */
  mailAction() {
    this.hideDebugBar();
    return this.mailer.sendTestMail("ccamensuli@gmail.com", this.context)
      .catch((e) => {
        throw e;
      });
  }

  async renderPdf(html) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.emulateMedia("print");
    let buffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    await browser.close();
    return buffer;
  }

  /**
   *  @Route ("/responsive", name="nodefony-mail-responsive")
   */
  mail2Action() {
    this.hideDebugBar();
    return this.render("mail-bundle::responsive.mail.html.twig", {
        name: this.kernel.projectName
      })
      .then(async (html) => {
        let buffer = await this.renderPdf(html);
        return this.mailer.juiceResources(html, {}, this.context)
          .then((htmlp) => {
            return this.mailer.send({
                to: "ccamensuli@gmail.com, christophe.camensuli@sfr.com", // list of receivers`
                from: "ccamensuli@free.fr",
                subject: `${this.kernel.projectName} ✔`, // Subject line
                //text: "Hello world?", // plain text body
                html: htmlp, // html body
                attachments: [{ // binary buffer as an attachment
                  filename: 'nodefony.pdf',
                  content: buffer
                }]
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