/**
 *	@class mailController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 *  @Route ("/nodefony/test/mail")
 */
const puppeteer = require('puppeteer');

module.exports = class mailController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  /**
   *   @Route ("", name="nodefony-mail-default")
   */
  mailAction() {
    this.hideDebugBar();
    return this.mailer.sendTestMail(null, null, this.context)
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
    return this.render("test-bundle:mail:responsive.mail.html.twig", {
        name: this.kernel.projectName
      })
      .then(async (html) => {
        let buffer = await this.renderPdf(html);
        return this.mailer.juiceResources(html, {}, this.context)
          .then((htmlp) => {
            return this.sendMail({
                to: "ccamensuli@gmail.com", // list of receivers`
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
                this.log(info);
                return html;
              })
              .catch(e => {
                throw e;
              });
          })
          .catch(e => {
            throw e;
          });
      })
      .catch((e) => {
        this.log(e, "ERROR");
        return Promise.reject(e);
      });
  }

  /**
   *
   */
  footerAction() {
    let version = this.kernel.settings.version;
    return this.render("test:mail:mail.footer.html.twig", {
      version: version,
      year: new Date().getFullYear()
    });
  }

};
