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
