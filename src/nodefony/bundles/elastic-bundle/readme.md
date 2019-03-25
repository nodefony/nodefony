# Welcome to elastic-bundle


## Register and Configure elastic Bundle

### For a Register elastic-bundle add <b>elastic: true</b> in config framework
#### <code>./config/config.js</code>

```js
module.exports = {
  system: {
    /**
    * BUNDLES CORE
    */
    elastic: true
  }
}
```

### Override elastic-bundle configuration your bundle  

#### <code>./app/config/config.js</code>

```js
/**
 * OVERRIDE ELASTIC BUNDLE SETTINGS
 *   elasticsearch
 *
 *	 options  :  https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html
 *
 */
"elastic-bundle": {
  elasticsearch: {
    globalHostsOptions: {
      protocol: "http"
    },
    globalOptions: {
      ssl: {
        //key : path.resolve("config","certificates","server","privkey.pem"),
        //cert : path.resolve("config","certificates","server","cert.pem"),
        //ca : path.resolve("config","certificates","ca","nodefony-root-ca.crt.pem")
      }
    },
    connections: {
      main: {
        hosts: [{
          host: "192.168.100.181",
          port: 9200
        }],
        sniffOnStart: true,
        sniffInterval: 5000
      }
    }
  }
}
```

## Example to use :

#### <code>./controller/defaultController.js</code>
```js
/**
 *    @Route ("/elastic")
 * 		https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
 */
module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.client = this.get("elastic").getClient("main");
  }

  health(params = {}) {
    return this.client.cluster.health(params);
  }

  create() {
    return this.client.indices.create({
      index: 'nodefony'
    });
  }

  ping() {
    return this.client.ping({
      requestTimeout: 30000,
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (name="elastic-index")
   *
   */
  indexAction() {
    return this.ping()
      .then(this.health.bind(this))

      .then((ele) => {
        return this.render("cci-bundle::index.html.twig", {
          name: `Elastic Ping : ${ele}`
        }).catch((e) => {
          throw e;
        });
      }).catch((e) => {
        throw e;
      });
  }
};
```


## <a name="authors"></a>Authors

- Camensuli Christophe  ccamensuli@gmail.com

##  <a name="license"></a>License
