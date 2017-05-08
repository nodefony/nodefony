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
require("../css/test.css");

module.exports = function (){ 

	/*
 	 *	Class
	 *
	 *	Namespace test client side 
 	 *
 	 */
	var test = class test {
	
		constructor() {
		}
	};

	return new test();
}();
