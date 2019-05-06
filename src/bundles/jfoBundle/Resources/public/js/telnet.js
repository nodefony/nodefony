require("../css/telnet.css");

const Terminal = require("./terminal.js");

module.exports = function (){
	
	/*
 	 *	Class
	 *
	 *	Namespace jfo client side
 	 *
 	 */
	const telnet = class telnet {

		constructor() {

			//console.log(this.kernel) ;
		}

		dashboard(){
			this.kernel = new stage.kernel("dev", {
				router:false,
				onDomReady: () =>{
					this.raspi = $("svg") ;
					this.raspi.each((index, ele) =>{
						ele = $(ele);
						var id = ele.parent().attr("id")  ;
						ele.attr('id', id);
						ele.find(".hostname").text(ele.parent().attr("name"));
					});
					this.raspi.on("click", (event) => {
						let id = $(event.currentTarget).attr("id");
						window.location = "/raspi/"+id ;
					});
				}
			});
		}

		device(device_id, hostmane){

			this.kernel = new stage.kernel("dev", {
				router:false,
				onDomReady: () =>{
					let terminal = null ;
					
					if ( hostmane === "Serveur Console"){
					
						this.ser2netTable = $("#ser2net table").DataTable();
						this.usbrulesTable = $("#usbrules table").DataTable();
						this.getRules("/telnet/usbrules/"+device_id);
						this.ser2net("/telnet/ser2net/"+device_id);
						this.monitoring = $("#monitoring table").DataTable({
							"columns": [
					            { "data": "port" },
					            { "data": "timeout" },
					            { "data": "enable" },
					            { "data": "connectedTo" },
					            { "data": "device_state" },
					            { "data": "device" },
					            { "data": "byteWriteToTcp" },
					            { "data": "byteWriteToDevice" },
					            { "data": "byteReadFromTcp" },
					            { "data": "byteReadFromDevice" }
        					]
						});
						//terminal = this.addTerminal("wss://192.168.100.102/telnet/monitoring/"+device_id , $("#myModal"), $(".modal-body"));
						//$("#myMonitoring").click(function(){
				    	//	terminal.open();
				    	//});
				    	this.diplayTableMonitoring("wss://192.168.100.102/telnet/monitoring/"+device_id, this.monitoring)

					}

					terminal = this.addTerminal("wss://192.168.100.102/telnet/shell/"+device_id, $("#myModal"), $(".modal-body") );
					//console.log(terminal);
				    $("#myBtn").click(function(){
				    	terminal.open();
				    });



			
				}
			});
		}

		diplayTableMonitoring(server,  table){
			let socket = new WebSocket(server);
			socket.onmessage =  (message) =>{
				//console.log(message)
				try {
					if ( message.data ){
						let data = JSON.parse(message.data);
						//console.log(data.data);
						table.clear().draw();
						if ( data.data && data.data.length ){ 
							for (let i = 0 ; i< data.data.length ; i++){
								console.log(data.data[i])
								table.row.add(data.data[i]);
							}
							table.draw( true );
						}
					}
				}catch(e){
					throw e ;
				}
			};
			socket.onopen = ( message ) =>{
				//this.logger("onopen");
			};

			socket.onclose = ( message ) =>{
				//this.logger("onclose");
			}
		}

		addTerminal(server, container, bodyContainer){
			let terminal = new Terminal( container, bodyContainer );
			terminal.connect(server);
			return terminal ;
		}


		connecTelnet(server){

			let ws = new WebSocket(server);
			ws.onmessage =  (message) =>{
				try {
					let data = JSON.parse(message.data);
					let txt = data.prompt +  ( data.data || "" );
					
					let final = $("pre").text() + txt ;
					$("pre").text(final);
				}catch(e){
					throw e ;
				}
			};
			ws.onopen = (message) =>{
				console.log("onopen")
			};
			return ws ;
		}

		getRules(server){
			
			$.ajax({
				url:server,
				success:(data, status, xhr) =>{
					//console.log(data);
					
					for ( let line in data.result){
						//let table = new Array(5);
						let table = new Array("null", "null", "null","null","null");
						
						for ( var ele in data.result[line]){
							//console.log( data.result[line][ele] )
							switch (ele){
								case "SYMLINK" :
									table[0] = data.result[line][ele] || "null"
								break;
								case "SUBSYSTEM":
									table[4] = data.result[line][ele] || "null"
								break;
								case "ATTRS{idProduct}":
									table[2] = data.result[line][ele] || "null"
								break;
								case "ATTRS{idVendor}":
									table[3] = data.result[line][ele] || "null"
								break;
								case "ATTRS{serial}":
									table[1] = data.result[line][ele] || "null"
								break;
							}
							
						}
						if (table[0] !== "null"){
							this.usbrulesTable.row.add(table).draw( false );
						}
					}
					
				},
				error:(e) =>{
					throw e
				}
			})
		}
		ser2net(server){
			
			$.ajax({
				url:server,
				success:(data, status, xhr) =>{
					//console.log(data);
					for ( let line in data.result){
						//let table = new Array(5);
						let table = new Array("null", "null", "null","null","null");
						
						for ( let i = 0 ; i<  data.result[line].length ; i++ ){
							switch (i){
								case 0 :
									table[1] = data.result[line][i] || "null"
								break;
								case 1:
									table[0] = data.result[line][i] || "null"
								break;
								case 2:
									table[3] = data.result[line][i] || "null"
								break;
								case 3:
									table[2] = data.result[line][i] || "null"
								break;
								case 4:
									table[4] = data.result[line][i] || "null"
								break;
							}
						}
						if (table[0] !== "null"){
							this.ser2netTable.row.add(table).draw( false );
						}
					}
				},
				error:(err) =>{
					throw err ;
				}
			})
		}

	};

	return new telnet();
}();
