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
 *	 options  :  https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-configuration.html
 *
 */
"elastic-bundle": {
  elasticsearch: {
    globalOptions: {
      ssl: {
        //key : path.resolve("config","certificates","server","privkey.pem"),
        //cert : path.resolve("config","certificates","server","cert.pem"),
        //ca : path.resolve("config","certificates","ca","nodefony-root-ca.crt.pem")
      }
    },
    connections: {
      main: {
        name: "main",
        nodes: ["http://localhost:9200"],
        log: {
          request: false,
          response: false,
          sniff: true,
          resurrect: true
        },
        maxRetries:10,
        sniffInterval: 5000,
        pingTimeout: 5000,
        requestTimeout:5000
      }
    }
  }
},
```

## Example to use :

#### <code>./controller/elasticController.js</code>
```js
/**
 *    @Route ("/test/elastic")
 */
module.exports = class elasticController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.elastic = this.get("elastic");
    this.setJsonContext();
  }

  async getClient() {
    let conn = await this.elastic.getConnection("main");
    return conn.client;
  }

  async createIndex(index, id) {
    if (!index) {
      index = "nodefony";
    }
    const client = await this.getClient();
    const {
      body
    } = await client.indices.exists({
      index: index
    });
    let res = null;
    if (!body) {
      res = await client.index({
        index: index,
        id: id,
        body: {
          version: this.kernel.version,
          package: this.kernel.package
        }
      });
    } else {
      this.log(`Index : ${index} Already exist !!! `);
    }
    return res;
  }

  async ping() {
    return await this.client.ping();
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/index/{id}" , name="test-elastic-search", defaults={"id" = 1},requirements={"id" = "\d+")
   *
   */
  async indexAction(id) {
    const client = await this.getClient();
    await this.createIndex("nodefony", "id");
    let get = null ;
    try{
      get = await client.get({
        index: 'nodefony',
        id: id
      });
      return this.renderJson(get)
        .catch((e) => {
          throw e;
        });
    }catch(e){
      if ( e && e.meta && e.meta.statusCode ){
        return this.renderJson(e, e.meta.statusCode )
          .catch((e) => {
            throw e;
          });
      }
      return this.renderJson(e )
        .catch((e) => {
          throw e;
        });
    }
  }
};
```

## <a name="authors"></a>Authors

- Camensuli Christophe  ccamensuli@gmail.com

##  <a name="license"></a>License
