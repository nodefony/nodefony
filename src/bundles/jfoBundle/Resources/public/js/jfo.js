/*
 *
 *	ENTRY POINT WEBPACK DEMO BUNLDE
 *
 *
 *  Add your assets here with require  to an integration in webpack  bundle
 *
 *  require('jquery');
 *  require('../css/mycss.css')
 *
 */
require("../css/jfo.css");

module.exports = function (){

	/*
 	 *	Class
	 *
	 *	Namespace jfo client side
 	 *
 	 */
	const jfo = class jfo {

		constructor() {
		}
	};

	return new jfo();
}();
