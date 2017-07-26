
module.exports = nodefony.register("orm", function(){


	var connectionMonitor = function(name, db, orm){
		this.connectionNotification ++;
		if(Object.keys(orm.settings.connectors).length === this.connectionNotification){
			process.nextTick(function () {
				orm.fire('onOrmReady', orm);
			});
		}
	};

	var Orm = class Orm  extends nodefony.Service {

		constructor (name, container, kernel, autoLoader){

			super( name, container );

			if (( this.kernel.debug === false && this.debug === true) || this.debug === undefined ){
				this.debug = this.kernel.debug ;
			}
			this.entities = {};
			this.definitions = {};
			this.autoLoader = autoLoader;
			this.connections = {};
			this.connectionNotification = 0 ;
		}

		boot (){

			this.listen(this, "onReadyConnection", connectionMonitor);
			this.listen(this, "onErrorConnection", connectionMonitor);

			this.kernel.listen(this, 'onBoot', (kernel) => {
				var callback = null ;
				for (var bundle in kernel.bundles){
					if ( Object.keys(kernel.bundles[bundle].entities).length  ){
						for (var entity in kernel.bundles[bundle].entities ){
							var ele = kernel.bundles[bundle].entities[entity] ;
							if (ele.type !== this.name){
								continue;
							}
							if ( !  ( ele.connection in this.definitions ) ){
								this.definitions[ele.connection] = [];
							}
							callback = (enti, bundle, name) => {
								var Enti = enti;
								var Name = name ;
								var Bundle = bundle ;
								return (db) => {
									try {
										this.entities[Name] = Enti.entity.call(this, db, this);
										this.logger(this.name+" REGISTER ENTITY : "+Name+" PROVIDE BUNDLE : "+Bundle,"DEBUG");
										return Enti ;
									}catch(e){
										this.logger(e);
									}
								};
							};
							callback = callback(ele, bundle, entity);
							this.definitions[ele.connection].push(callback);
						}
					}
				}
			});

			this.listen(this, "onConnect" , (name, db) => {
				if (name in this.definitions){
					for( var i =0 ; i < this.definitions[name].length ; i++){
						this.definitions[name][i](db);
					}
				}
				try {
					this.fire("onReadyConnection", name, db, this);
				}catch(e){
					this.logger(e, "ERROR", this.name+" ENTITY");
				}
			});
		}

		logger (pci, severity, msgid,  msg){
			if (! msgid) { msgid = this.kernel.cli.clc.magenta(this.name + " ");}
			return this.syslog.logger(pci, severity, msgid,  msg);
		}

		getConnection (name){
			if ( this.connections[name] ){
				return this.connections[name].db;
			}
			return null;
		}

		getEntity (name){
			if (name){
				return this.entities[name];
			}else{
				return this.entities;
			}
		}
	};

	return Orm;
});
