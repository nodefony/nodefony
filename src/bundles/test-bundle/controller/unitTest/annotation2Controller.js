/**
 *    @Route ("/test/annotate")
 */
class annotation2Controller extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
  }

  /**
   *   @Route ("/requirements", name="test-annotation-nohost", defaults={"id" = 5},requirements={"id" = "\d+"})
   *   @Method ({"GET","WEBSOCKET"})
   */
  annotationAction (id) {
    return this.render("testBundle::index.html.twig", {
      id
    });
  }

  /**
   *    @Method ({ "POST", "PUT", "DELETE"})
   *    @Route ("/noname/{id}", name="", defaults={"id" = 5},requirements={"id" = "\d+"})
   */
  annotation2Action (id) {
    return this.render("testBundle::index.html.twig", {
      id
    });
  }

  /**
   *    @Method ({"GET", "POST"})
   *    @Route ("/block/{id}",
   *      name="test-annotation-block-nohost",
   *      defaults={"id" = 5},
   *      requirements={"id" = "\d+"})
   *
   */
  annotation3Action (id) {
    return this.render("testBundle::index.html.twig", {
      id
    });
  }
}

module.exports = annotation2Controller;
