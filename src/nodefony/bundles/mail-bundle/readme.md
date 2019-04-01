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

  // sendTestMail(to, transporterName = null, context = null, ) {
  return this.mailer.sendTestMail("admin@nodefony.com", "free", this.context)
    .catch((e) => {
      throw e;
    });
}
};
```
```js
sendTestMail(to, transporterName = null, context = null, ) {

  return this.renderTwig("mail-bundle::mail.html.twig", {}, context)
    .then((html) => {
      return this.juiceResources(html, {}, context)
        .then((htmlp) => {
          let message = {
            to: to || this.authorMail, // list of receivers`
            from: this.mailDefaultOptions.from,
            subject: `${this.kernel.projectName} ✔`, // Subject line
            text: "Test Email?", // plain text body
            html: htmlp, // html body
            attachments: [{
              filename: 'nodefony.txt',
              content: 'Nodefony attachement',
              contentType: 'text/plain' // optional, would be detected from the filename
            }],
            list: {
              // List-Help: <mailto:admin@example.com?subject=help>
              help: `${this.authorMail}?subject=help`,
              // List-Unsubscribe: <http://example.com> (Comment)
              unsubscribe: [{
                  url: `https://${this.domain}/mail/unsubscribe`,
                  comment: 'A short note about this url'
                },
                `unsubscribe@{this.domain}`
              ],
            }
          };
          return this.sendMail(message, transporterName, context)
            .then((info) => {
              this.logger(info);
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
    .catch(e => {
      throw e;
    });
}
```

```twig
{% extends '/app/Resources/views/base.html.twig' %}

{% block stylesheets %}
  <link rel="stylesheet" href="{{CDN('stylesheet')}}/mail-bundle/assets/css/mail.css"/>
{% endblock %}

{% block javascripts %}
  <script type="text/javascript" src="{{CDN('javascript')}}/mail-bundle/assets/js/mail.js"></script>
{% endblock %}

{% block body %}
  <div class="container text-center mt-4">
    <div class="d-flex justify-content-center">
      <div class="card mb-3" style="max-width: 540px;">
        <div class="row no-gutters">
          <div class="col-md-4">
            <img src="https://nodefony.net/app/images/app-logo.png" class="card-img" alt="nodefony">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">{{name}} Email Bundle</h5>
              <p class="card-text">Bootstrap responsive email. <i class="fa fa-user"></i></p>
              <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered table-dark">
        <thead>
         <tr>
           <th scope="col">#</th>
           <th scope="col">First</th>
           <th scope="col">Last</th>
           <th scope="col">Handle</th>
         </tr>
       </thead>
       <tbody>
         <tr>
           <th scope="row">1</th>
           <td>Mark</td>
           <td>Otto</td>
           <td>@mdo</td>
         </tr>
         <tr>
           <th scope="row">2</th>
           <td>Jacob</td>
           <td>Thornton</td>
           <td>@fat</td>
         </tr>
         <tr>
           <th scope="row">3</th>
           <td colspan="2">Larry the Bird</td>
           <td>@twitter</td>
         </tr>
       </tbody>
      </table>
    </div>

  </div>

  {% block footer %}
    {{ render( controller("mail:default:footer" )) }}
  {% endblock %}
{% endblock %}


```

## <a name="authors"></a>Authors

- Camensuli Christophe  ccamensuli@gmail.com

##  <a name="license"></a>License
