onst Sequelize = require("sequelize");
module.exports = nodefony.registerFixture("devices", function(){

	const devices = function(resolve, reject){

		let devicesEntity = this.getEntity("devices");

		let tab = [{
				
				type: "RASPBERRYPI",
				hostname: "Test BENCHMO",
				ip: "192.168.245.118",
				telnet: JSON.stringify({
					host: '1192.168.245.118',
    				port: 23,
					shellPrompt: '~# ',
    				timeout: 60000,
    				initialLFCR: true
				})
			},{
				type: "RASPBERRYPI",
				hostname: "Control Serveur Console",
				ip: "192.168.245.206",
				telnet: JSON.stringify({
					host: '192.168.245.206',
    				port: 2000,
					shellPrompt: '-> ' ,
    				timeout: 60000,
    				initialLFCR: true
					
				})

			},{
				type: "RASPBERRYPI",
				hostname: "Serveur Console",
				ip: "192.168.245.206",
				telnet: JSON.stringify({
					host: '192.168.245.206',
    				port: 23,
					shellPrompt: '~# ',
    				timeout: 60000,
    				initialLFCR: true
				})
			},{
				type: "VM",
				hostname: "VM-CCI",
				ip: "192.168.100.96",
				telnet: JSON.stringify({
					host: '192.168.100.96',
    				port: 23,
					shellPrompt: 'CCI-DEROULE',
    				timeout: 60000,
    				initialLFCR: true
				})
		}];

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
				.spread( () => {
					for (var i = 0 ; i< arguments.length ;i++){
						if (arguments[i][1]){
							this.logger("ADD DEVICE : " +arguments[i][0].hostname,"INFO");
						}else{
							this.logger("ALREADY EXIST DEVICE : " +arguments[i][0].hostname,"INFO");
						}
					}
				} )
				.then( () => {
			    		connection.query('SET FOREIGN_KEY_CHECKS = 1');
				})
				.catch( (error) => {
					this.logger(error);
					reject(error);
				})
				.done((/*error, result*/) => {
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
				}.bind(this))
				.spread( ()=> {
					for (var i = 0 ; i< arguments.length ;i++){
						if (arguments[i][1]){
							this.logger("ADD DEVICE : " +arguments[i][0].username,"INFO");
						}else{
							this.logger("ALREADY EXIST DEVICE : " +arguments[i][0].username,"INFO");
						}
					}
				})
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
