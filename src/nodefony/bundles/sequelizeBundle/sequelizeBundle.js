
module.exports = nodefony.registerBundle ("sequelize", function(){

	/**
	 *	The class is a **`sequelize` BUNDLE** .
	 *	@module App
	 *	@main App
	 *	@class sequelize
	 *	@constructor
	 *	@param {class} kernel
	 *	@param {class} container
	 *
	 */
	var sequelize = class sequelize  extends nodefony.Bundle {

		constructor (name, kernel, container){

			super( name, kernel, container);
			// load bundle library
			this.autoLoader.loadDirectory(this.path+"/core");

			/*
		 	*	If you want kernel wait sequelizeBundle event <<onReady>>
		 	*
		 	*      this.waitBundleReady = true ;
		 	*/
			this.waitBundleReady = true ;

			var service =  this.get("sequelize");
			service.listen(this, "onOrmReady",() => {
				this.fire("onReady", this, service);
			});
		}
	};

	return sequelize;
});
