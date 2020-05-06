'use strict';

export default function (nodefony) {
  const defaultSettings = {
    audio: true,
    video: true,
    protocol: "SIP",
    sipPort: 5060,
    sipTransport: "WSS",
    dtmf: "SIP-INFO", // "SIP-INFO", "RTP-EVENT"
    /*
     * STUN  => { iceServers: [{ url: ! stage.browser.Gecko ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'}] }
     * TURN  => { iceServers: [{ url: "turn:webrtc%40live.com@numb.viagenie.ca", credential: ""}] }
     */
    iceServers: [],
     
    optional: nodefony.medias.webrtcAdapter.browserDetails.browser === "Gecko" ? {
      'DtlsSrtpKeyAgreement': 'true'
    } : {
      'DtlsSrtpKeyAgreement': 'true',
      'rtcpMuxPolicy': 'negotiate'
    },
    asyncCandidates: false
  };

  /*
   *
   *  CLASS WEBRTC
   *
   */
  class WebRtc extends nodefony.Service {

    constructor(server, transport, settings) {
      let container = null;
      if (transport){
        container = transport.container || null;
      }
      super("webrtc", container , null, settings);
      this.settings = nodefony.extend(true, {}, defaultSettings, settings);
      this.settings.optional.iceServers = this.settings.iceServers;
      this.protocol = null;
      this.socketState = "close";
      this.transactions = {};
      //this.users = {};
      this.transport = this.connect(transport);
      if (this.transport && this.transport.publicAddress) {
        this.publicAddress = this.transport.publicAddress;
        //this.publicAddress = server;
        //this.publicAddress = this.transport.domain;
      }
      this.server = server;
      this.init();
    }

    init() {
      delete this.protocol;
      this.protocol = null;

      // EVENTS WEBRTC
      this.listen(this, "onInvite", function (transaction, userTo, description) {
        this.transactions[transaction.callId] = transaction;
      });

      this.listen(this, "onOffer", function (webrtc, transaction) {
        this.transactions[transaction.callId] = transaction;
      });

      this.listen(this, "onAccept", function (webrtc, transac) {
        transac.doAnswer(transac.dialog);
        //transac.setRemoteDescription("offer", transac.to, transac.to.description, transac.dialog);
      });

      this.listen(this, "onDeclineOffer", function (webrtc, transac) {

        var ret = transac.dialog.currentTransaction.createResponse(
          603,
          "Declined"
        );
        ret.send();

        /*var ret = message.transaction.createResponse(
          603,
          "Declined"
        );
        ret.send();*/
        this.closeTransaction(transac);
      });

      // MANAGE PROTOCOL
      switch (this.settings.protocol) {
      case "SIP":
        this.protocol = new nodefony.protocols.sip(this.server, this.transport, {
          portServer: this.settings.sipPort,
          transport: this.settings.sipTransport,
        });

        this.protocol.listen(this, "onRegister", function (sip, message) {
          switch (message.code) {
          case 200:
            this.user.createMediaStream((stream) => {
              this.user.stream = stream;
              this.notificationsCenter.fire("onMediaSucces", this.user.mediaStream, this.user);
            }, (e) => {
              this.notificationsCenter.fire("onError", this, e);
            });
            this.notificationsCenter.fire("onRegister", this.user, this);
            break;
          default:
            this.notificationsCenter.fire("onError", this.protocol, message);
            break;
          }
        });

        this.protocol.listen(this, "onUnRegister", function (sip, message) {
          this.fire("onUnRegister", sip, message);
        });

        this.protocol.listen(this, "onRinging", function (sip, message) {
          var transaction = this.transactions[message.callId];
          if (transaction) {
            this.notificationsCenter.fire("onRinging", message.toName, transaction);
          }
        });

        this.protocol.listen(this, "onTrying", function (sip, message) {
          var transaction = this.transactions[message.callId];
          if (transaction) {
            this.notificationsCenter.fire("onTrying", message.toName, transaction);
          }
        });

        this.protocol.listen(this, "onInfo", function (message) {
          var transaction = this.transactions[message.callId];
          //console.log(message);
          if (message.contentType === "application/dtmf-relay") {
            this.fire("onDtmf", message.body.dtmf, transaction);
          }
        });

        this.protocol.listen(this, "onCancel", function (message) {
          var transaction = this.transactions[message.callId];
          if (transaction) {
            this.notificationsCenter.fire("onCancel", message.body.body, transaction);
            this.closeTransaction(transaction, message.fromName);
          }
        });

        this.protocol.listen(this, "onInvite", function (message, dialog) {
          let res = null;
          let transac = null;
          switch (message.header["Content-Type"]) {
          case "application/sdp":
            if (message.rawBody) {

              if (dialog.status === dialog.statusCode.INITIAL) {

                // TODO MANAGE MULTI CALL
                res = message.transaction.createResponse(100, "trying");
                res.send();

                // transaction WEBRTC
                try {
                  transac = this.createTransaction(message.fromName, dialog, {
                    displayName: message.fromNameDisplay || ""
                  });
                  transac.to.setDescription(message.rawBody);
                } catch (e) {
                  res = message.transaction.createResponse(500, e.message || e);
                  res.send();
                  return;
                }

                res = message.transaction.createResponse(180, "Ringing");
                res.send();

                try {
                  transac.setRemoteDescription("offer", transac.to, transac.to.description, transac.dialog);
                } catch (e) {
                  res = message.transaction.createResponse(500, e.message || e);
                  res.send();
                }

                return;
              }
              if (dialog.status === dialog.statusCode.ESTABLISHED) {
                // HOLD THE LINE
                message.transaction.decline();
              }
            }
            break;
          case "ice/candidate":
            if (message.rawBody) {
              var transaction = this.transactions[message.callId];
              let ret = null;
              if (!transaction) {
                ret = message.transaction.createResponse(500, "no transaction ");
                ret.send();
                return;
              }
              res = JSON.parse(message.rawBody);
              ret = message.transaction.createResponse(100, "trying");
              ret.send();
              for (let i = 0; i < res.length; i++) {
                var candidate = new RTCIceCandidate(res[i]);
                transaction.RTCPeerConnection.addIceCandidate(candidate,
                  () => {
                    this.logger("WEBRTC remote CANDIDATES   " + res[i].candidate, "DEBUG");
                  },
                  (e) => {
                    console.log(e);
                    this.logger("WEBRTC Error CANDIDATES " + res[i].candidate, "ERROR");
                  }
                );
              }
              if (transaction.candidates.length) {
                ret = message.transaction.createResponse(200, "OK", JSON.stringify(transaction.candidates), "ice/candidate");
                ret.send();
                transaction.candidates = [];
              } else {
                ret = message.transaction.createResponse(200, "OK");
                ret.send();
                //transaction.candidates= [];
                /*this.listen(this, "onIcecandidate" , function(transaction, candidates, peerConnection){
                  var ret = message.transaction.createResponse(200, "OK", JSON.stringify(transaction.candidates), "ice/candidate");
                  ret.send();
                  transaction.candidates= [];
                });*/
              }
            }
            break;
          default:
            this.notificationsCenter.fire("onError", this.protocol, message);

          }
        });

        this.protocol.listen(this, "onTimeout", function (sip, message) {
          this.notificationsCenter.fire("onTimeout", message.method, 408, message);
          var transac = this.transactions[message.callId];
          if (transac) {
            this.closeTransaction(transac, transac.to.name);
          }
        });

        this.protocol.listen(this, "onDecline", function (message) {
          if (message.callId in this.transactions) {
            var transac = this.transactions[message.callId];
            this.fire("onDecline", this, transac);
            this.closeTransaction(transac);
          }
        });

        this.protocol.listen(this, "onError", function (Class, message) {
          this.notificationsCenter.fire("onError", Class, message);
          var transac = this.transactions[message.callId];
          if (transac) {
            this.closeTransaction(transac, transac.to.name);
          }
        });

        this.protocol.listen(this, "onQuit", function (protocol) {
          this.fire("onQuit", this);
          this.close();
        });

        this.protocol.listen(this, "onInitCall", function (to, dialog, transaction) {
          if (dialog.callId in this.transactions) {
            var transac = this.transactions[dialog.callId];
            transac.currentTransaction = transaction;
            this.notificationsCenter.fire("onInitCall", transac);
          }
        });

        this.protocol.listen(this, "onBye", function (message) {
          let transac = null;
          let name = null;
          if (message.callId in this.transactions) {
            transac = this.transactions[message.callId];
            name = message.fromName;
          }
          if (transac) {
            this.notificationsCenter.fire("onOnHook", transac, message);
            this.closeTransaction(transac, name);
          } else {
            // WHEN USER LOCAL STOP REGISTRATION
            if (message.fromName === this.user.name) {
              this.close();
            }
          }
        });

        this.protocol.listen(this, "onCall", function (message) {
          var transac = this.transactions[message.callId];
          if (message.toNameDisplay) {
            transac.to.displayName = message.toNameDisplay;
          }
          //var from = this.users[message.toName];
          if (message.dialog.status === message.dialog.statusCode.EARLY && message.header["Content-Type"] === "application/sdp") {
            this.notificationsCenter.fire("onAnwer", message);
            transac.to.setDescription(message.rawBody);
            transac.setRemoteDescription("answer", transac.to, message.rawBody, message.dialog);
            /*if ( this.settings.asyncCandidates && transac.candidates.length){
              //console.log( message.dailog)
              message.dialog.invite(message.to, JSON.stringify(transac.candidates), "ice/candidate")
            }*/
            //this.notificationsCenter.fire( "onOffHook", transac , message );
          } else {

          }
          if (message.header["Content-Type"] === "ice/candidate") {
            if (transac.candidates.length) {
              var res = JSON.parse(message.rawBody);
              for (let i = 0; i < res.length; i++) {
                var candidate = new RTCIceCandidate(res[i]);
                transac.RTCPeerConnection.addIceCandidate(candidate,
                  () => {
                    //console.log("Succes Candidate")
                    this.logger("WEBRTC ADD remote CANDIDATES :  " + res[i].candidate);
                  },
                  (e) => {
                    console.log(e);
                    this.logger("WEBRTC Error CANDIDATES " + res[i].candidate, "ERROR");
                  }
                );
              }
            }
          }
        });

        this.protocol.listen(this, "onMessage", function (message) {
          this.fire("onMessage", message);
        });

        this.protocol.listen(this, "onSend", function (message) {
          this.fire("onSend", message);
        });

        this.listen(this, "onError", function (Class, error) {
          switch (true) {
          case (Class instanceof WebRtc):
            break;
          case (Class instanceof nodefony.medias.webrtcTransaction):
            //console.log(Class.currentTransaction )
            if (Class.currentTransaction) {
              var response = Class.currentTransaction.createResponse(500, error.message || error);
              response.send();
            }
            this.closeTransaction(Class, Class.to.name);
            break;
          case (Class instanceof Error):
            break;
          }
        });
        break;
      default:
        if ( this.settings.protocol){
          this.protocol = new this.settings.protocol(this.server, this.transport, this);
        }else{
          throw new Error("WEBRTC Protocol not found ");
        }
      }
    }

    connect(transport) {
      if (transport) {
        transport.listen(this, "onConnect", function () {
          this.socketState = "open";
        });
        transport.listen(this, "onClose", function () {
          this.socketState = "close";
        });
        return transport;
      }
    }

    createTransaction(userTo, dialog, settings) {
      try {
        let transaction = new nodefony.medias.webrtcTransaction(this, this.user, userTo, dialog, settings);
        return transaction;
      } catch (e) {
        this.fire("onError", this, e);
        throw e;
      }
    }

    unRegister() {
      if (this.protocol) {
        this.protocol.unregister();
      }
      this.close();
    }

    register(userName, password, settings) {
      this.user = new nodefony.medias.userMedia(userName, settings);
      this.protocol.register(userName, password, settings);
    }

    createOffer(userTo, settings ={}) {
      let to = new nodefony.medias.userMedia(userTo, settings);
      let transac = this.createTransaction(to);
      transac.createOffer();
      return transac;
    }

    acceptOffer(transaction) {
      this.fire("onAccept", this, transaction);
      return transaction;
    }

    declineOffer(transaction) {
      this.fire("onDeclineOffer", this, transaction);
      return transaction;
    }

    closeTransaction(transation, name) {
      if (transation) {
        transation.close();
        delete this.transactions[transation.callId];
        //delete this.users[name];
      }
    }

    close() {
      this.fire("onClose", this);
      setTimeout(() => {
        this.clean();
      }, 2000);
    }

    clean() {
      this.cleanTransactions();
      if (this.protocol) {
        this.protocol.clear();
        this.protocol = null;
        delete this.protocol;
      }
      this.notificationsCenter.clearNotifications();
    }

    cleanTransactions() {
      for (let trans in this.transactions) {
        try {
          this.transactions[trans].bye();
          this.transactions[trans].close();
        } catch (e) {
          this.logger(e, "ERROR");
        }
        delete this.transactions[trans];
      }
    }

    quit() {
      this.protocol.bye();
    }


  }
  return WebRtc;
}
