/**
 *	@class boatsController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 */

/**
 *    @Route ("/test/boats")
 */
module.exports = class boatsController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.entity = this.getEntity("boat");
    this.nodefonyEntity = this.getNodefonyEntity("boat");
    this.startSession();
  }

  /**
   *
   *	@method indexAction
   *
   */
  indexAction() {
    let log = this.getFlashBag("log") || null;
    return this.entity.findAll()
      .then((results) => {
        return this.render("test:boats:index.html.twig", {
          entity: this.entity.name,
          boats: results,
          orm: this.nodefonyEntity.orm.name,
          connector: this.nodefonyEntity.connectionName,
          log: log
        });
      })
      .catch((e) => {
        throw e;
      });

  }

  /**
   *    @Method ({"POST"})
   *    @Route ("/read")
   */
  readAction() {
    return this.entity.findOne({
        where: {
          id: this.query.id,
        }
      })
      .then((boat) => {
        return this.redirectToRoute("boats");
      });
  }

  /**
   *    @Method ({"POST"})
   *    @Route ("/create")
   */
  createAction() {
    return this.entity.create(this.query, {
        isNewRecord: true
      })
      .then((boat) => {
        this.setFlashBag("log", `Create ${boat.name}`);
        return this.redirectToRoute("boats");
      }).catch((error) => {
        throw error;
      });
  }

  /**
   *    @Method ({"POST"})
   *    @Route ("/delete")
   */
  deleteAction() {
    return this.entity.findOne({
        where: {
          id: this.query.id
        }
      })
      .then((result) => {
        if (result) {
          return result.destroy({
            force: true
          }).then((boat) => {
            this.setFlashBag("log", `Delete ${boat.name}`);
            return this.redirectToRoute("boats");
          }).catch((error) => {
            throw error;
          });
        }
      });
  }

  /**
   *    @Method ({"POST"})
   *    @Route ("/update")
   */
  updateAction() {
    return this.entity.findOne({
      where: {
        id: this.query.id
      }
    }).then((result) => {
      if (result) {
        return result.update(this.query, {
            where: {
              id: this.query.id
            }
          })
          .then(function (boat) {
            this.setFlashBag("log", `Update ${boat.name}`);
            return this.redirectToRoute("boats");
          }).catch((error) => {
            throw error;
          });
      }
    });
  }

};