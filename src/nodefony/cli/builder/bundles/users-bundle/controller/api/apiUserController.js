/**
 *    @Route ("/api/users")
 */
module.exports = class apiUserController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.usersService = this.get("users");
    this.jsonApi = new nodefony.JsonApi(this.bundle.name, this.bundle.version, this.context);
  }

  /**
  GET
  La méthode GET demande une représentation de la ressource spécifiée. Les requêtes GET doivent uniquement être utilisées afin de récupérer des données.

  HEAD
  La méthode HEAD demande une réponse identique à une requête GET pour laquelle on aura omis le corps de la réponse (on a uniquement l'en-tête).

  POST
  La méthode POST est utilisée pour envoyer une entité vers la ressource indiquée. Cela  entraîne généralement un changement d'état ou des effets de bord sur le serveur.

  PUT
  La méthode PUT remplace toutes les représentations actuelles de la ressource visée par le contenu de la requête.

  DELETE
  La méthode DELETE supprime la ressource indiquée.

  CONNECT
  La méthode CONNECT établit un tunnel vers le serveur identifié par la ressource cible.

  OPTIONS
  La méthode OPTIONS est utilisée pour décrire les options de communications avec la ressource visée.

  TRACE
  La méthode TRACE réalise un message de test aller/retour en suivant le chemin de la ressource visée.

  PATCH
  La méthode PATCH est utilisée pour appliquer des modifications partielles à une ressource.
  **/


  /**
   *    @Method ({"GET"})
   *    @Route ( "/{username}",name="api-user",defaults={"username" = ""})
   *
   */
  async getAction(username) {
    let result = null;
    try {
      if (username) {
        result = await this.usersService.findOne(username, this.query);
      } else {
        result = await this.usersService.find(this.query.query, this.query);
      }
      return this.jsonApi.render(result);
    } catch (e) {
      throw e;
    }
  }

  /**
   *    @Method ({"OPTIONS"})
   *    @Route ( "/",name="api-users-options")
   *
   */
  optionsAction() {
    return this.jsonApi.render(this.jsonApi.renderOptions());
  }


  /**
   *    @Method ({"POST"})
   *
   */
  postAction() {

  }

  /**
   *    @Method ({"DELETE"})
   *
   */
  deleteAction() {

  }

  /**
   *    @Method ({"PUT"})
   *
   */
  putAction() {

  }

  /**
   *    @Method ({"HEAD"})
   *
   */
  headAction() {

  }

  /**
   *    @Method ({"TRACE"})
   *
   */
  traceAction() {

  }

  /**
   *    @Method ({"CONNECT"})
   *
   */
  connectAction() {

  }

};
