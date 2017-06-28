

module.exports = nodefony.registerController("default", function(){

		/**
		 *	The class is a **`default` CONTROLLER** .
		 *	@module nodefony
		 *	@main nodefony
		 *	@class default
		 *	@constructor
		 *	@param {class} container
		 *	@param {class} context
		 *
		 */
		var defaultController = class defaultController extends nodefony.controller {

			constructor (container, context){
				super(container, context);
			}

			/**
		 	*
		 	*	@method indexAction
		 	*
		 	*/
			indexAction (){
				return this.render("AppBundle::index.html.twig")
			}
		};
		return defaultController;
});
