/**
 *
 */
stage.registerController("appController", function() {
	/**
	 *
	 */
	stage.Controller.prototype.viewOptions = {
		"hideHeader": false,
		"hideAside" : false,
		"hideFooter": false
	};

	/**
	 *
	 */
	stage.Controller.prototype.renderContent = function(partial, variables, options) {
		var options = stage.extend(true, {}, this.viewOptions, options);

		$(".app-header")[options.hideHeader?"addClass":"removeClass"]("hide");
		$(".app-footer")[options.hideFooter?"addClass":"removeClass"]("hide");

		// remove left margins for content and footer
		$(".app-aside")[options.hideAside?"addClass":"removeClass"]("hide");
		$(".app-content")[options.hideAside?"addClass":"removeClass"]("aside-hide");
		$(".app-footer")[options.hideAside?"addClass":"removeClass"]("aside-hide");

		return this.renderPartial(partial, variables);
	};

	/**
 	 * Render a classic scrollable page in the content
 	 * area.
 	 */
	stage.Controller.prototype.renderDefaultContent = function(partial, variables, options) {
		var view = this.renderContent(partial, variables, options);
		var layout = '<div class="app-content-body">' + view + '</div>';
		this.render($(".app-content").removeClass("full"), layout);
	};

	/**
 	 * Render a application style page in the content
 	 * area.
 	 */
	stage.Controller.prototype.renderFullContent = function(partial, variables, options) {
		var view = this.renderContent(partial, variables, options);
		var layout = '<div class="app-content-body app-content-full full">' + view + '</div>';
		this.render($(".app-content").addClass("full"), layout);
	};

	var regfragment = /^({.*})({.*})$/g;
	var fragment = function(message){
		try {
			if ( this.fragment ){
				this.message += message;
			}else{
				this.message = message ;
			}
			var res= regfragment.exec(message)
			if (res){
				fragment.call(this,res[1])
				fragment.call(this,res[2])
				return ;
			}
			var pdu = new stage.PDU();
			pdu.parseJson(this.message);
			this.serverSyslog.logger(pdu);
			this.fragment = false ;
		}catch(e){
			//console.log("FRAGMENTE")
			this.fragment = true ;
			return ;
		}
	};

	var parseMessage = function(message){
		//console.log(message)
		try {
			var json = JSON.parse(message) ;
			if ( json.pdu ){
				//return fragment.call(this, JSON.stringify( message.pdu) );
			}
			if ( json.pm2){
				var pm2_graph = this.get("pm2_graph");
				//console.log(pm2_graph)
				for (var i= 0 ; i < json.pm2.length ; i++){
					var id = json.pm2[i].pm_id ;
					//console.log("ID : "+ id + " data : "  + json.pm2[i].monit.memory)
					var mem = json.pm2[i].monit.memory/1000000 ;
					pm2_graph.updateMemory(id, mem );
					var val = parseFloat( mem ).toFixed(2)
					$("#pm2Memory_"+id).text(val);
					pm2_graph.updateCpu(id, json.pm2[i].monit.cpu);
					$("#pm2CPU_"+id).text(json.pm2[i].monit.cpu);

				}
				pm2_graph.updateTable($("#pm2-status"), json.pm2);
				//this.logger(json.pm2,"INFO");
			}
		}catch(e){
			this.logger(e,"ERROR");
		}
	};

	var serverMessages = function(service, message){
		if (service === "monitoring" ){
			try {
				parseMessage.call(this, message);
			}catch(e){
				this.logger(e,"ERROR");
			}
		}
	};


	var onConnect = function(message, realtime){
		if  ( message.data.monitoring ){
			switch (this.kernel.router.location.url()){
				case "/dashboard":
					realtime.subscribe("monitoring");
				break
			}
		}
	};

	/**
	 *
	 */
	var controller = class controller  extends stage.Controller {

		constructor(name, container, module) {

			super(name, container, module);

			this.config = this.module.config;
			this.kernel.listen(this, "onReady", function(){
				this.realtime = this.get("realtime") ;
				this.serverSyslog = this.get("serverSyslog");
				this.realtime.listen(this, "connect", onConnect );
				this.realtime.listen(this, "subscribe", function(service, message, realtime){
					if (service === "monitoring"){
						this.realtime.listen(this, "message", serverMessages );
					}
				})
				this.realtime.listen(this, "unsubscribe", function(service, message, realtime){
					this.realtime.unListen("message" , serverMessages) ;
					console.log("onUnSubscribe service : " + service)
				})
			});

			this.kernel.listen(this, "onRouteChange",(newRoute ,lastRoute) => {
				switch(lastRoute.id){
					case "dashboard" :
						this.realtime.unSubscribe("monitoring");
					break;
				}
			});

			/******** AJAX SETUP *************/
			$.ajaxSetup({
				statusCode : {
					401: function() {
					 	window.location = "/";
					}
				},
				error: (jqXHR, textStatus, errorThrown) => {
					if (textStatus === "error"){
						switch (errorThrown){
							case "Unauthorized" :
								window.location = "/";
							break;
							default:
								App.logger("Error: " + textStatus + ": " + errorThrown, "ERROR");
						}
						return ;
					}
					//App.logger("Error: " + textStatus + ": " + errorThrown, "ERROR");
				}
			});
		}

		/**
	 	*
	 	*/
		indexAction () {
			this.render( this.kernel.uiContainer , this.renderPartial("appModule::index", {config: this.config}), "prepend") ;

			// section elements definition
			var section = {};
			section.header 	= $(".app-header");
			section.aside 	= $(".app-aside");
			section.content = $(".app-content");
			section.footer 	= $(".app-footer");
			this.kernel.set("section", section);

			// load the nav menu
			this.module.controllers.navController.indexAction();

			// rewind initial route
			var location = this.get("location");
			var browser = this.get("browser");
			location.url(location.initialUrl);
			if (location.hash() === "" || location.hash() ==="/") {
				this.redirect(this.router.generateUrl("dashboard"));
			} else {
				browser.url(location.initialUrl);
			}
		}

		/**
	 	*
	 	*/
		["404Action"] () {
			this.renderDefaultContent("appModule::404", {
				"product": this.kernel.product,
				"version": this.kernel.version
			}, {
				"hideHeader": true,
				"hideAside" : true,
				"hideFooter": true
			});
		};

		/**
	 	*
	 	*/
		["500Action"] (error) {
			if (!$(".app-content").length) {
				var view = this.renderPartial("appModule::500", { error: error });
				$("body").html(view);
				return ;
			}

			this.renderDefaultContent("appModule::500", {
				"error": error,
				"product": this.kernel.product,
				"version": this.kernel.version
			}, {
				"hideHeader": true,
				"hideAside" : true,
				"hideFooter": true
			});
		}
	};

	return controller;
});
