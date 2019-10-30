# Welcome to mail-bundle


## Register and Configure mail Bundle (Core Bundle)

### For a Register mail-bundle add <b>mail: true</b> in config framework
#### <code>./config/config.js</code>

```js
module.exports = {
  system: {
    /**
    * BUNDLES CORE
    */
    mail: true
  }
}
```

### Override mail-bundle configuration your bundle  

#### <code>./app/config/config.js</code>

```js
/**
 *  OVERRIDE MAIL Bundle
 *
 *   @see FRAMEWORK MAIL config for more options
 *     https://nodemailer.com
 *
 *
 */
 "mail-bundle": {
   nodemailer: {
     default: "free",
     transporters: {
       free: {
         host: "smtp.free.fr",
         port: 465,
         secure: true, // true for 465, false for other ports
         auth: {
           user: "username", // generated  user
           pass: "passwd" // generated  password
         }
       },
       gmail : {
         host: "smtp.gmail.com",
         port: 465,
         secure: true, // true for 465, false for other ports
         auth: {
           user: "user@gmail.com",
           pass: "xxxxxxxxx"
         },
         tls: {
           // do not fail on invalid certs
           rejectUnauthorized: false
         }
       }
     }
   }
 }
```

## Example to use :

### Check transporters with sendTestMail
#### <code>./controller/defaultController.js</code>
```js
mailAction() {
  return this.mailer.sendTestMail("admin@nodefony.com", "gmail", this.context)
    .catch((e) => {
      throw e;
    });
}
```

### Complete example
```js

const vCardsJS = require('vcards-js');
const puppeteer = require('puppeteer');
...


async indexAction() {
  switch(this.method){
    case "POST":
      if (this.query.mail){
        return this.sendEmail(this.query.mail)
        .then((info) =>{
          this.logger(info, "INFO", "EMAIL");
          return this.redirectToRoute("route-after-sended");
        });
      }else{
        return this.redirectToRoute("myroute");
      }
      break;    
  }
}

async sendEmail(to) {
  let res = await this.twigToHtml();
  const message = {
    to: to,
    from: `"${this.mailer.authorName}" <admin@nodefony.net>`,
    subject: `${this.kernel.projectName} ✔`, // Subject line
    html: res, // html body
    attachments: [{
      // binary buffer as an attachment
        filename: 'nodefony.pdf',
        content: await this.renderPdf({}, {
          queryString: {
            mail: true
          }
        })
      }, {
      // define custom content type for the attachment
        filename: 'nodefony.vcf',
        content: this.renderVcard(),
        contentType: 'text/vcard'
    }]
  };
  // sendMail(message, transporterName, context)
  // sendMail(message,"gmail", this.context);
  return await this.sendMail(message);
}

async twigToHtml() {
  let file = path.resolve(this.bundle.viewsPath, "index.html.twig");
  let res = await this.renderTwigFile(file)
    .catch((e) => {
      throw e;
    });
  return this.mailer.juiceResources(res, null, this.context);
}

// vcard example
renderVcard() {
  let vCard = vCardsJS();
  //set properties
  vCard.firstName = 'admin';
  vCard.lastName = 'admin';
  vCard.organization = 'Nodefony';
  vCard.photo.attachFromUrl('https://cdn.nodefony.com/app/images/app-logo.png', 'JPEG');
  vCard.logo.attachFromUrl('https://cdn.nodefony.com/app/images/app-logo.png', "PNG");
  vCard.workPhone = '+033xxxxxxxxxx';
  vCard.birthday = new Date(xxxx, xx, xx);
  vCard.title = 'Software Developer ';
  vCard.url = this.generateAbsoluteUrl("myurl", true);
  vCard.gender = 'M';
  vCard.email = 'admin@nodefony.net';
  vCard.source = this.generateAbsoluteUrl("render-vcard", true);
  vCard.homeAddress.label = 'Home Address';
  vCard.homeAddress.street = '';
  vCard.homeAddress.city = '';
  vCard.homeAddress.stateProvince = '';
  vCard.homeAddress.postalCode = '';
  vCard.homeAddress.countryRegion = '';
  vCard.socialUrls.github = 'https://github.com/nodefony';
  //vCard.note = '';
  return vCard.getFormattedString();
}

// RENDER PDF ON attachement with puppeteer
async renderPdf(options, query = {}) {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors:true,
    defaultViewport:null
  });
  options = nodefony.extend({
    //format: 'A6',
    scale: 0.8,
    printBackground: true,
    //width: '1300px',
    preferCSSPageSize: false,
    displayHeaderFooter: false,
    //headerTemplate: ,
    landscape: false,
    margin: {
      top: "30px",
      bottom:"30px",
      right:"0px",
      left:"0px"
    }
  }, options);
  const page = await browser.newPage();
  await page.goto(this.generateAbsoluteUrl("route_page_to_transform", query));
  await page.emulateMedia("print");
  let buffer = await page.pdf(options);
  await browser.close();
  return buffer;
}
```

## <a name="authors"></a>Authors

- Camensuli Christophe  ccamensuli@gmail.com

##  <a name="license"></a>License
