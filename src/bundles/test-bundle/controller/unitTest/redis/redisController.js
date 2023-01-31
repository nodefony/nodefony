/**
 *    @Route ("/test/redis")
 */
module.exports = class redisController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
    this.redis = this.get("redis");
    this.setJsonContext();
    this.main = this.redis.getConnection("main").client;
    this.publisher = this.redis.getConnection("publish").client;
    this.subscriber = this.redis.getConnection("subscribe").client;
  }


  /**
   *    @Method ({"GET"})
   *    @Route ("/ping" , name="test-redis-ping")
   *
   */
  async pingAction () {
    const pong = await this.main.ping();
    console.log(`Response from PING command: ${pong}`);
    return this.renderJson({
      message: pong
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/index" , name="test-redis-index")
   *
   */
  async indexAction () {
    await this.main.hSet("key", "foo", "bar");
    const result = await this.main.hGetAll("key");
    await this.main.hSet("key", "sboob", "cci");
    const result2 = await this.main.hGetAll("key");
    console.log(result, result2);
    const message = {
      foo: "bar"
    };
    try {
      const res = await this.publisher.publish("send", JSON.stringify(message));
      console.log(res);
      return this.renderJson(result2);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/scan" , name="test-redis-scan")
   *
   */
  async hscanAction () {
    const tab = [];
    try {
      for await (const {field, value} of this.main.hScanIterator("key")) {
        // use the key!
        tab.push({field,
          value});
      }
      return this.renderJson(tab);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};
