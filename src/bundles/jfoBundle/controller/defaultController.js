/*
 *
 *	The CeCILL-B License
 *	
 *	Copyright (c) 2017/2017  | 
 *
 *
 *	This software is a computer program whose purpose is to [describe
 *	functionalities and technical features of your software].
 *
 *	This software is governed by the CeCILL-B license under French law and
 *	abiding by the rules of distribution of free software.  You can  use, 
 *	modify and/ or redistribute the software under the terms of the CeCILL-B
 *	license as circulated by CEA, CNRS and INRIA at the following URL
 *	"http://www.cecill.info". 
 *
 *	As a counterpart to the access to the source code and  rights to copy,
 *	modify and redistribute granted by the license, users are provided only
 *	with a limited warranty  and the software's author,  the holder of the
 *	economic rights,  and the successive licensors  have only  limited
 *	liability. 
 *
 *	In this respect, the user's attention is drawn to the risks associated
 *	with loading,  using,  modifying and/or developing or reproducing the
 *	software by the user in light of its specific status of free software,
 *	that may mean  that it is complicated to manipulate,  and  that  also
 *	therefore means  that it is reserved for developers  and  experienced
 *	professionals having in-depth computer knowledge. Users are therefore
 *	encouraged to load and test the software's suitability as regards their
 *	requirements in conditions enabling the security of their systems and/or 
 *	data to be ensured and,  more generally, to use and operate it in the 
 *	same conditions as regards security. 
 *
 *	The fact that you are presently reading this means that you have had
 *	knowledge of the CeCILL-B license and that you accept its terms.
 *
 */

module.exports = nodefony.registerController("default", function(){

		/**
		 *	The class is a **`default` CONTROLLER** .
		 *	@module raspberrypi
		 *	@main raspberrypi
		 *	@class default
		 *	@constructor
		 *	@param {class} container
		 *	@param {class} context
		 *
		 */

		const defaultController = class defaultController extends nodefony.controller {

			constructor (container, context){
				super(container, context);
				this.telnet = this.get("telnet");
				this.sessionsTelnet = this.kernel.getBundle("jfo").settings.sessions_telnet ;

			}

			/**
		 	*
		 	*	@method dashboardAction
		 	*
		 	*/
			dashboardAction (){

				let nodefonyDb = this.getORM().getConnection("console") ;
				

				return nodefonyDb.query("SELECT A.* , B.* , A.id as 'device_id'  FROM devices A LEFT JOIN deviceTypes B ON A.type=B.id ")
				.then((result) => {
					return this.render('jfoBundle::telnet.html.twig', {
						devices:result[0],
					});
				});
			}

			navAction(){
				return this.render(
						'jfoBundle::navBar.html.twig', {
						user:this.context.user
				});
				
			}

			ipLinkAction(){
				let wifi = this.get("wifi");
				return wifi.ipLink().then( (result) =>{
					//console.log(typeof result);
					return this.renderJson(result);
				});
			}

			ruleUsbAction(device_id){

				return this.getORM().getEntity("devices").findAll({where: {
    				id: device_id
  				}}).then((result) =>{
  					
  					let sessionTelnet = null ;
  					try {
  						sessionTelnet = JSON.parse(result[0].telnet);
  					}catch(e){
  						throw e ;
  					}
					
  					return this.telnet.connect(sessionTelnet.default).then( (res) => {
						return this.telnet.exec("cat /etc/udev/rules.d/50-usb-ttys.rules ", res.connection).then((ret)=>{
							
							let data = [];
							if (ret){
								let line = ret.split("\n") ;
								if (line.length){
									for (let i = 0 ; i < line.length ;i++){
										let ele = line[i].split(",");
										let json = {};
										for ( let j = 0 ; j <ele.length ; j++){
											let regres = ele[j].match(/(.*)[+=]=(.*)/) ;
											if (regres){
												let key = regres[1].replace(/['"\s]/g,'') ;
												let value = regres[2].replace(/['"\s]/g,'');
												json[key] = value ;
											}
										}
										data.push(json);
									}
								}
							}
							//console.log(data);
							return this.renderJsonAsync({prompt:res.prompt,cmd:"50-usb-ttys.rules",result:data}) ;
						
						});
				}).catch((error) => {
					this.renderJsonAsync({error:error,result:null}) ;
				});

				});
				
			}

			ser2netAction(device_id){

				return this.getORM().getEntity("devices").findAll({where: {
    				id: device_id
  				}}).then((result) =>{
  					let sessionTelnet = null ;
  					try {
  						sessionTelnet = JSON.parse(result[0].telnet);
  					}catch(e){
  						throw e ;
  					}

					return this.telnet.connect(sessionTelnet.default).then( (res) => {
						
						return this.telnet.exec("cat /etc/ser2net.conf ", res.connection).then((ret)=>{
							
							let data = {};
							if (ret){
								let line = ret.split("\n") ;
								if (line.length){
									for (let i = 0 ; i < line.length ;i++){
										
										if ( ! line[i].match(/^#/) ){
											//console.log(line[i])
											let ele = line[i].split(":");
											if (ele.length === 1 && ele[0] === "" ){
												continue ;
											}
											let json = [];
											let tty = null ;
											let index = null ;
											for ( let j = 0 ; j <ele.length ; j++){
												let value = ele[j] ;
												json.push(value);
												let resreg = value.match(/.*\/dev\/(ttybox.{1,2}).*/);
												if ( resreg ){
													tty = resreg[1];
												}
											}
											if ( tty ){
												data[tty] = json;
											}	
										}
									}
								}
							}
							//console.log(data);
							return this.renderJsonAsync({prompt:res.prompt,cmd:"ser2net",result:data}) ;
						});
						
					}).catch((error) => {
						this.renderJsonAsync({error:error,result:null}) ;
					});
				});
			}




			telnetAction(){
				
				switch ( this.getMethod() ){
					case "WEBSOCKET" :
						
						this.telnet.myConnect( this.sessionsTelnet.test_deroule ).then( (connect) => {

							this.renderJsonAsync({
								prompt:connect.prompt,
								connection:connect.id
							}) ;
							return connect.exec("uptime").then((ret) => {
									
								this.renderJsonAsync({
									prompt:connect.prompt,
									cmd:"uptime",
									connection:connect.id,
									result:ret||null
								});
								return connect.close();
								 
							}).catch((error)=>{
								this.logger(error, "ERROR")
								throw error ;
							});
						})
						.catch((error)=>{
							this.logger(error, "ERROR")
							this.context.send(error);
							throw error ;
						});
					break;
					default:
						return this.render("jfoBundle::telnet.html.twig");
				}
				
			}

		};
		return defaultController;
});
