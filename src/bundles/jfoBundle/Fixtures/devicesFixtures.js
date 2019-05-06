const Sequelize = require("sequelize");
module.exports = nodefony.registerFixture("devices", function(){

	const devices = function(resolve, reject){

		let devicesEntity = this.getEntity("devices");

		let tab = [{
				
				type: 3,
				hostname: "Test BENCHMO",
				ip: "192.168.245.118",
				telnet: JSON.stringify({
					default:{
						host: '192.168.245.118',
	    				port: 23,
	    				username:"jfo",
						password:"olivier",
						shellPrompt: '~$ ',
	    				timeout: 60000,
	    				initialLFCR: true
	    			}
				})
			},{
				type: 1,
				hostname: "Serveur Console",
				ip: "192.168.245.206",
				telnet: JSON.stringify({
					default:{
						host: '192.168.245.206',
	    				port: 23,
						shellPrompt: '~$ ',
						username:"jfo",
						password:"olivier",
	    				timeout: 60000,
	    				initialLFCR: true
	    			},
	    			monitoring:{
	    				host: '192.168.245.206',
    					port: 2000,
						shellPrompt: '-> ' ,
    					timeout: 60000,
    					initialLFCR: true
	    			}
				})
			},{
				type: 2,
				hostname: "VM-CCI",
				ip: "192.168.100.96",
				telnet: JSON.stringify({
					default:{
						host: '192.168.100.96',
	    				port: 23,
						shellPrompt: 'CCI-DEROULE',
						username: "nodefony",
						password: "91984869",
	    				timeout: 60000,
	    				initialLFCR: true
	    			}
				})
		}];
		//return ;

		let connection = this.getConnection("console");
		switch ( connection.options.dialect ){

			case "mysql" :
				connection.query('SET FOREIGN_KEY_CHECKS = 0')
				.then( () => {
			 		return devicesEntity.sync({ force: false });
				})
				.then((Device) => {
					this.logger("Database synchronised  " ,"INFO");
					return Sequelize.Promise.map( tab, (obj) => {
						return Device.findOrCreate({where: {hostname: obj.hostname}, defaults:obj});
					});
				})
				.spread( function()  {
					for (var i = 0 ; i< arguments.length ;i++){
						if (arguments[i][1]){
							this.logger("ADD DEVICE : " +arguments[i][0].hostname,"INFO");
						}else{
							this.logger("ALREADY EXIST DEVICE : " +arguments[i][0].hostname,"INFO");
						}
					}
				}.bind(this) )
				.then( () => {
			    		connection.query('SET FOREIGN_KEY_CHECKS = 1');
				})
				.catch( (error) => {
					this.logger(error);
					reject(error);
				})
				.done((error, result) => {
					resolve("deviceEntity");
				});
			break;
			case "sqlite":
				 
				connection.query('PRAGMA foreign_keys = 0  ')
				.then( () => {
			 		return devicesEntity.sync({ force: false });
				})
				.then(  (Device) =>  {
					this.logger("Database synchronised  " ,"INFO");
					return Sequelize.Promise.map( tab, function (obj)  {
						return  Device.findOrCreate({where: {hostname: obj.hostname}, defaults:obj});
					});
				})
				.spread( function() {
					for (var i = 0 ; i< arguments.length ;i++){
						if (arguments[i][1]){
							console.log
							this.logger("ADD DEVICE : " +arguments[i][0].hostname,"INFO");
						}else{
							this.logger("ALREADY EXIST DEVICE : " +arguments[i][0].hostname,"INFO");
						}
					}
				}.bind(this))
				.catch( (error) => {
					this.logger(error);
					reject(error);
				})
				.done( () =>{
					resolve("deviceEntity");
				});
			break;
		}
	};

	return {
		type:"sequelize",
		connection : "console",
		entity: "devices",
		fixture: devices
	};
});
