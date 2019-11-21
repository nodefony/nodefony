/*
 *   MODEFONY FRAMEWORK UNIT TEST
 *
 *   MOCHA STYLE
 *
 *   In the global context you can find :
 *
 *	nodefony : namespace to get library
 *	kernel :   instance of kernel who launch the test
 *
 *
 *
 */
const assert = require('assert');

describe("BUNDLE users", () => {

	before( () => {
		assert.equal( typeof nodefony, "object" );
		// check instance kernel
		assert.equal( kernel instanceof nodefony.kernel, true)
	});

	describe('CORE', () => {

		beforeEach(() =>{});

		before( () => {

		});
		it("TEST",  (done) => {
			done();
		});


	});

	
});
