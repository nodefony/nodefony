/**
 *	@class redisController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 */
module.exports = class redisController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
    this.redis = this.get("redis");
    this.client = this.redis.getClient("data");
  }

  /**
   *
   *	@method indexAction
   *
   */
  indexAction () {
    this.client.set("sbbob", "foo", this.redis.print.bind(this.redis));
    return this.client.client.getAsync("sbbob")
      .then((value) => {
        try {
          return this.render("test-bundle:redis:index.html.twig", {
            name: value
          });
        } catch (e) {
          throw e;
        }
      });
  }
};
