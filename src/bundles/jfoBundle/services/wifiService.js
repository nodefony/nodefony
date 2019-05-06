const spawn = require('child_process').spawn;
module.exports = nodefony.registerService("wifi", function(){


	const wifi = class wifi extends nodefony.Service {

		constructor(container, kernel){
			super("WIFI", container, container.get("notificationsCenter") );
			this.cli = this.kernel.cli ;
			this.on("onReady", () =>{

				//this.ipLink();
			})
			
		}

		spawn(command , args, options){
			return new Promise( (resolve, reject) => {

				let mydata = {
					stdout:[],
					stderr:[],
					code:null
				};
				
				let cmd = null ;
				try{
					cmd = spawn(command , args, options || {});
				}catch(e){
					throw e ;
				}
				this.logger("Run Spawn Command : " + command + " "+ args.join(" ") );

				cmd.stdout.on('data', (data) => {
					let str = data.toString();
					console.log(str);
					this.logger(str,"INFO")
					mydata.stdout.push( str) ;
					
				});
				cmd.stderr.on('data', (data) => {
					let str = data.toString();
					this.logger(str,"ERROR")
					mydata.stderr.push(str ) ;
				});
				cmd.on('close', (code) => {
					console.log(code);
					mydata.code = code ;
					this.logger(`child process exited with code ${code}`);
					return resolve(mydata);
				});
				cmd.on('error', (err) => {
					console.log(err);
					this.logger(err, "ERROR");
					reject(err);	
				});
			});
		}

		ipLink(){
			let args = ['link'] ;
			return this.spawn("ip", args);
		}


	};


	return wifi ;
});