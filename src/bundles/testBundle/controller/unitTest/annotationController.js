/**
 *    @Route ("/test/annotate")
 *    @Host ("nodefony.com")
 */
module.exports = class annotationController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  /**
   *   @Route ("/requirements", name="test-annotation-requirements", defaults={"id" = 5},requirements={"id" = "\d+"})
   *   @Method ({"GET","WEBSOCKET"})
   */
  annotationAction(id) {
    return this.render("testBundle::index.html.twig", {
      id: id
    });
  }

  /**
   *    @Method ({ "POST", "PUT", "DELETE"})
   *    @Route ("/noname/{id}", name="", defaults={"id" = 5},requirements={"id" = "\d+"})
   */
  annotation2Action(id) {
    return this.render("testBundle::index.html.twig", {
      id: id
    });
  }

  /**
   *    @Method ({"GET", "POST"})
   *    @Route ("/block/{id}",
   *      name="test-annotation-block",
   *      defaults={"id" = 5},
   *      requirements={"id" = "\d+"})
   *
   */
  annotation3Action(id) {
    return this.render("testBundle::index.html.twig", {
      id: id
    });
  }
};
