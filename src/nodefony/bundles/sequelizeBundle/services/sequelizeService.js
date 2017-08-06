module.exports = nodefony.registerService("sequelize", function(){


	var error = function(err){

		if (this.state !== "DISCONNECTED"){
			this.orm.kernel.fire('onError', err, this);
		}
		this.logger(this.name + " : ERROR CONNECTION to database " + this.name +" "+err.message, "ERROR", "CONNECTION");
		if(err.code){
			switch(err.code){
				case 'PROTOCOL_CONNECTION_LOST':
				case "ECONNREFUSED":
					this.state = "DISCONNECTED";
					return {
						status: 500,
						code: err.code,
						message: err.message
					};
				default:
					return err;
			}
		} else {
			return err;
		}
	};

	/*
	 *
	 * CLASS LIBRARY CONNECTION
	 *
	 */
	var connectionDB = class connectionDB {

		constructor (name, type, options, orm){
			this.state = "DISCONNECTED";
			this.name = name;
			this.type = type;
			this.db = null;
			this.orm = orm;
			this.intervalId = null;
			this.connect(type, options);
		}

		setConnection (db, config){
			if(! db){
				throw new Error("Cannot create class connection without db native");
			}
			this.db = db;
			this.orm.notificationsCenter.fire("onConnect", this.name, this.db );
			this.state = "CONNECTED";
			let severity = "INFO";
			if ( this.orm.kernel.type === "CONSOLE"  ){
				severity = "DEBUG";
			}
			this.logger( ' Sequelise Connection : '+this.name +' has been established successfully  Type =' + this.type + "  Database = "+config.dbname, severity);
		}

		getConnection (){
			return this.db;
		}

		connect (type, config){
			if ( this.orm.debug ){
				config.options.logging = (value) => {
					this.logger(value, "DEBUG");
				};
			}else{
				config.options.logging = false;
			}
			let conn = null ;
			try {
				switch(type){
					case "sqlite" :
						config.options.storage = process.cwd() + config.dbname;
					break;
				}
				conn = new this.orm.engine(config.dbname, config.username, config.password, config.options );
				process.nextTick( ()  => {
					conn
					.authenticate()
					.then( () => {
						this.setConnection(conn, config);
					})
					.catch( err => {
						this.logger('Unable to connect to the database : '+ err , "ERROR");
						console.dir(config);
						error.call(this, err);
						this.orm.fire('onErrorConnection', this.name, conn, this.orm)
					});
				});
			}catch(err){
				error.call(this, err);
				this.orm.fire('onErrorConnection', this.name, conn, this.orm);
			}
			return conn ;
		}

		logger (pci, severity, msgid,  msg){
			if (! msgid) {msgid = "SERVICE sequelize CONNECTION";}
			return this.orm.logger(pci, severity, msgid,  msg);
		}
	};

	/*
	 *
	 * CLASS SERVICE sequelize
	 *
	 */
	var sequelize = class sequelize extends nodefony.orm {

		constructor (container, kernel, autoLoader){
			super("sequelize", container, kernel, autoLoader );
			this.engine = require('sequelize');
			this.boot();
		}

		boot (){
			super.boot();
			this.kernel.listen(this, 'onBoot', (/*kernel*/) => {
				this.settings = this.getParameters("bundles.sequelize");
				this.debug = this.settings.debug ;
				if ( this.settings.connectors && Object.keys(this.settings.connectors).length ){
					this.kernel.listen( this, "onReady", this.displayTable );
					for(let name in this.settings.connectors){
						this.createConnection(name, this.settings.connectors[name]);
					}
				}else{
					process.nextTick( () => {
						this.fire('onOrmReady', this);
					});
				}
			});
		}


		displayTable (){
			this.logger("DATABASES CONNECTORS LIST : ") ;
			let options = {
					head:[
							"NAME CONNECTOR",
							"NAME DATABASE",
							"DRIVER",
					]
			} ;
			let table = this.kernel.cli.displayTable(null, options);
			let tab = [];
			for (let dbname in this.settings.connectors){
				let conn = ["","",""];
				conn[0] = dbname;
				for (let data in this.settings.connectors[dbname]){
					switch (data){
						case "dbname" :
							conn[1] = this.settings.connectors[dbname][data];
						break;
						case "driver" :
							conn[2] = this.settings.connectors[dbname][data];
						break;
					}
				}
				table.push(conn);
			}
			console.log( table.toString() );
		}

		createConnection (name, config){
			try {
				return this.connections[name] = new connectionDB( name, config.driver, config, this );
			}catch(e){
				throw e ;
			}
		}
	};

	return sequelize ;

});
