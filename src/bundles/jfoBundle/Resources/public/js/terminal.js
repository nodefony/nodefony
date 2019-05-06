module.exports = function (){

	const startOfLine = function startOfLine(textareaElem, begin) {
	  let text = textareaElem.val();
	  let index = begin;
	  for (; index > 0 && text[index - 1] !== '\n'; --index) {}
	  return index;
	}

	const endOfLine = function endOfLine(textareaElem, end) {
	  let text = textareaElem.val();
	  let index = end;
	  for (; index < text.length && text[index] !== '\n'; ++index) {}
	  return index;
	}

	const endOfText = function endOfText (textareaElem){
		let text = textareaElem.val();
		let index = text.length ;
		return index ;
	}

	const Terminal  = class Terminal extends stage.Service{

		constructor(container , bodyContainer){

			super("TERMINAL");
			this.container = container ;
			this.bodyContainer = bodyContainer;
			this.bodyContainer.empty();
			this.textarea = null ;
			this.socket = null ;
			this.initTextArea();
			this.initSyslog();
			this.connectionId = null ;
			this.prompt = null ;
			this.current = null ;
		}


		initTextArea(){
			this.textarea = $( document.createElement("textarea") );
			this.bodyContainer.append(this.textarea.addClass("terminal"));
			
			this.textarea.click((event) => {
				let caret = this.getCaret();
				//selection
				if (caret.begin === caret.end ){
					this.endOfText();
				}
			});
			this.listenKeyboard();
		}


		listenKeyboard(){
			this.textarea.keypress((event) => {
				console.log("keypress");
			});
			this.textarea.keydown((event) => {
				console.log("down");
			});
			this.textarea.keyup((event) => {
				console.log("keyup");
				//console.log(event.which)
				switch(event.which) {
					case 13 :
						event.preventDefault();
						event.stopPropagation();
						this.send("\n");
					break;
					case 8 :
						console.log("delete");
						//event.preventDefault();
						//console.log(this.prompt);
						let caret = this.getCaret() ;
						console.log(caret);
						console.log( caret.begin + " <= " +  this.current + " = " + caret.begin <= this.current );
						if ( caret.begin <= this.current ){
							console.log("PASS")
							event.preventDefault();
							event.stopPropagation();
      						return false;
						}
						this.current = this.getCaret().end ;
					break;
					default:
						console.log(this.getCaret());
						console.log(this.current);
						if (this.getCaret().begin >= this.current ){
							//console.log("PASS")
							//event.preventDefault();
							//event.stopPropagation();
						}
 				}
 				
			});
		}


		initSyslog (){
			this.syslog.listenWithConditions(this, {
				severity:{
					data:"INFO,DEBUG,CRITIC,ERROR"
				}
			},(pdu) => {
				return this.normalizeLog( pdu );
			});
		}

		normalizeLog  (pdu){			
	      let date = new Date(pdu.timeStamp) ;
	      if (  pdu.payload === "" || pdu.payload === undefined ){
	        console.log( date.toDateString() + " " + date.toLocaleTimeString() + " " +  pdu.severityName  + " " + pdu.msgid + " " + " : " + "logger message empty !!!!");
	        return   ;
	      }
	      let message = pdu.payload;
	      
	      return console.log( date.toDateString() + " " + date.toLocaleTimeString() + " " +  pdu.severityName + " " + pdu.msgid + " " + " : " + message);
	    }

	    send(data){
	    	this.logger(data,"DEBUG", "SEND");
	    	return this.socket.send( JSON.stringify( {
	    		connection:this.connectionId,
	    		cmd:data
	    	}) );
	    }

	    getCaret(){
	    	return this.textarea.caret();
	    }

	    startOfLine(){
  			let caret = this.getCaret();
  			let cursor = startOfLine(this.textarea, caret.begin);
  			this.textarea.caret(cursor).focus();
	    }

	    endOfLine() {
  			let caret = this.textarea.caret();
  			let cursor = endOfLine(this.textarea, caret.end);
  			this.textarea.caret(cursor).focus();
		}

		endOfText(){
			let cursor = endOfText(this.textarea);
			console.log("Cursor :" + cursor)
			this.textarea.caret(cursor).focus();
			return cursor ;
		}

		highlightLines() {
  
  			let caret = this.textarea.caret() ;
      		let start = startOfLine(this.textarea, caret.begin);
      		let end = endOfLine(this.textarea, caret.end);
  			this.textarea.caret(start, end).focus();
		}

		open(){
			this.container.modal();
		}

		close(){
			this.socket.close();
		}

		empty(){
			this.textarea.empty();
		}

		connect(server){
			this.server = server ;

			this.socket = new WebSocket(server);

			this.socket.onmessage =  (message) =>{
				//console.log(message.data)
				this.logger(message.data, "DEBUG","RECEIVE");
				if ( message.data ){
					try {
						let data = JSON.parse(message.data);
						if ( this.connectionId === null && data.connection ){
							this.connectionId = data.connection ;
						}
						if ( this.prompt === null && data.prompt  ){
							this.prompt = data.prompt ;
							this.promptSize = this.prompt.length ;
							this.current = this.endOfText();
						}
						if ( data.prompt !== this.prompt ){
							this.prompt = data.prompt ;
							this.promptSize = this.prompt.length ;
						}
						if ( data.data ){
							let txt =   data.data ;
							//let regtxt = this.prompt.replace(/\$/,"\\$");
							//let reg = new RegExp(regtxt, "g");
							let format = txt.replace(/^\r\n/g,"");
							this.textarea.val(format);
							this.current = this.endOfText();
						}else{
							this.textarea.val(this.prompt);
							this.current = this.endOfText();
						}
					}catch(e){
						throw e ;
					}
				}else{
					this.textarea.text(this.prompt);
				}
			};

			this.socket.onopen = ( message ) =>{
 				this.logger("OPEN  : " + this.server , "INFO");
			};

			this.socket.onclose = ( message ) =>{
				this.logger("CLOSE WEBSOKET", "DEBUG");
				this.logger(message, "INFO");
			}
		}
	}
	return Terminal ;
}();