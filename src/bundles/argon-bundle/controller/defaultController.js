

/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 */
module.exports = class defaultController extends nodefony.controller {

	constructor (container, context){
		super(container, context);
	}

	/**
	 *
	 *	@method indexAction
	 *
	 */
	indexAction (){
		try {
			return this.render("argon-bundle::index.html.twig", {
				name: "argon-bundle"			});
		}catch(e){
			throw e;
		}
	}
};
