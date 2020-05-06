'use strict';

export default function (nodefony) {

  // CALLBACK SDP PARSER
  const parseSdp = function (description) {
    var sdpLines = description.sdp.split('\r\n');
    var newline = "";
    // Search for m line.
    for (var i = 0; i < sdpLines.length; i++) {
      var line = sdpLines[i];
      switch (description.type) {
      case "offer":
        /*if (line.search('a=crypto') !== -1) {
          console.log("PARSE SDP DELETE CRYPTO ");
          continue ;
        }*/
        /*if (line.search('a=setup:actpass') !== -1) {
          console.log("PARSE SDP REPLACE setup :  actpass by active  ");
          line = line.replace("a=setup:actpass", "a=setup:active")
        }*/
        break;
      case "answer":
        /*if (line.search('a=crypto') !== -1) {
          console.log("PARSE SDP DELETE CRYPTO ");
          continue ;
        }*/
        /*if (line.search('a=setup:actpass') !== -1) {
          console.log("PARSE SDP REPLACE setup :  actpass by active  ");
          line = line.replace("a=setup:actpass", "a=setup:active")
        }*/
        break;
      }
      if (i === sdpLines.length - 1) {
        newline += line;
      } else {
        newline += line + "\r\n";
      }
    }
    description.sdp = newline;
    return description;
  };

  /*
   *
   *  CLASS TRANSACTION WEBRTC
   *
   */
   class Transaction extends nodefony.Service {
     constructor(webrtc, from, to, dialog, settings) {
       super("WEBRTC TRANSACTION", webrtc.container, nodefony.notificationsCenter.create(settings || {}));
       this.webrtc = webrtc;
       this.dialog = dialog ||  null;
       this.error = null;
       if (this.dialog) {
         this.callId = this.dialog.callId;
       }
       this.protocol = webrtc.protocol;
       this.from = from;
       try {
         if (to instanceof nodefony.media.userMedia) {
           this.to = to;
         } else {
           this.to = new nodefony.media.userMedia(to, settings);
         }
       } catch (e) {
         throw e;
       }
       this.asyncCandidates = this.webrtc.settings.asyncCandidates;

       this.logger("CREATE TRANSATION WEBRTC", "DEBUG");
       this.RTCPeerConnection = this.createPeerConnection();
       this.RTCPeerConnection.addStream(this.from.stream);

       // MANAGE DTMF
       this.dtmfSender = null;
       if (this.webrtc.settings.dtmf) {
         try {
           this.initDtmfSender(this.from.stream);
           this.webrtc.listen(this, "onKeyPress", this.sendDtmf);
           // FIXME TRY TO RECEIVE DTMF RTP-EVENT
           /*this.webrtc.listen(this, "onRemoteStream",function(event, mediaStream, transaction){
             this.logger( "DTMF setRemoteStream", "DEBUG")
             this.initDtmfReceiver( this.from.stream );
           });*/
         } catch (e) {
           this.webrtc.logger(e, "ERROR");
           throw e;
         }
       }

       // MANAGE CANDIDATES
       this.candidates = [];
       this.listen(this, "onIcecandidate", function (transaction, candidates, peerConnection) {
         //console.log(" onIcecandidate : " + peerConnection.localDescription.type )
         let to = null;
         if (this.asyncCandidates && this.candidates.length) {
           //console.log( message.dailog)
           to = this.dialog.to.replace("<sip:", "").replace(">", "");
           this.logger("CANDIDATE TO" + to, "DEBUG");
           this.logger("CANDIDATE TO" + this.to.name, "DEBUG");
           this.dialog.invite(to, JSON.stringify(this.candidates), "ice/candidate");
         } else {
           if (peerConnection.localDescription.type === "offer") {
             this.sessionDescription = parseSdp.call(this, peerConnection.localDescription);
             if (this.dialog) {
               to = this.dialog.to.replace("<sip:", "").replace(">", "");
               this.logger("CANDIDATE TO" + to, "DEBUG");
               this.logger("CANDIDATE TO" + this.to.name, "DEBUG");
               this.dialog.invite(to, this.sessionDescription);
             } else {
               this.dialog = this.webrtc.protocol.invite(this.to.name, this.sessionDescription);
               this.callId = this.dialog.callId;
               this.webrtc.fire("onInvite", this, this.to, this.sessionDescription);
             }
           }
           if (peerConnection.localDescription.type === "answer") {
             this.sessionDescription = peerConnection.localDescription;
             if (this.sessionDescription && !(this.error)) {
               this.fire("onCreateAnwser", this.to, this.sessionDescription, this, this.dialog);
             }
           }
         }
       });

       this.listen(this, "onCreateAnwser", function (to, sessionDescription, webrtcTransaction, diag) {
         var response = this.dialog.currentTransaction.createResponse(200, "OK", this.sessionDescription.sdp, "application/sdp");
         response.send();
       });
     }

     createPeerConnection() {
       try {
         // CREATE PeerConnection
         this.logger(this.webrtc.settings.optional, "DEBUG");
         //console.log(this.webrtc.settings.optional)
         this.RTCPeerConnection = new RTCPeerConnection(this.webrtc.settings.optional);

         // MANAGE EVENT CANDIDATES
         this.RTCPeerConnection.onicecandidate = (event) => {
           // FIX firefox fire many time onicecandidate  iceGatheringState === complete
           let old = this.iceGatheringState;
           if (event.target) {
             this.iceGatheringState = event.target.iceGatheringState || this.RTCPeerConnection.iceGatheringState;
           } else {
             this.iceGatheringState = this.RTCPeerConnection.iceGatheringState;
           }
           let type = this.RTCPeerConnection.localDescription.type;
           //console.log(this.iceGatheringState)
           //console.log(type)
           if (type === "offer" && this.iceGatheringState === 'complete' && old !== "complete") {
             //console.log("PASSS CANDIDATE")
             this.fire("onIcecandidate", this, this.candidates, this.RTCPeerConnection);
           } else if (event && event.candidate === null) {
             // candidates null !!!
           } else {
             this.logger("WEBRTC : ADD CANDIDATE", "DEBUG");
             if (event.candidate) {
               this.candidates.push(event.candidate);
             }
             if (type === "answer") {
               this.fire("onIcecandidate", this, this.candidates, this.RTCPeerConnection);
               this.RTCPeerConnection.onicecandidate = null;
             }
           }
         };

         // MANAGE STREAM
         this.RTCPeerConnection.onaddstream = (event) => {
           //console.log(event)
           this.setRemoteStream(event);
           this.logger("WEBRTC : ADD STREAM ", "DEBUG");
         };
         return this.RTCPeerConnection;
       } catch (e) {
         this.logger(e, "ERROR");
         this.webrtc.fire("onError", this, e);
       }
     }

     // FIXME TRY TO RECEIVE DTMF RTP-EVENT
     /*initDtmfReceiver (mediaStream){
       console.log(this.RTCPeerConnection)
       if ( ! this.RTCPeerConnection.createDTMFSender ) {
         throw new Error(" RTCPeerConnection method createDTMFSender() !!!! which is not support by this browser");
       }
         if (mediaStream !== null) {
         try {
           var remoteAudioTrack = mediaStream.getAudioTracks()[0];
           var dtmfSender = this.RTCPeerConnection.createDTMFSender(remoteAudioTrack);
           dtmfSender.ontonechange = (tone) => {
             this.logger("dtmfOnToneChange", "DEBUG") ;
             this.webrtc.fire("dtmfOnToneChange", tone , this);
           };
         }catch(e){
           throw e ;
         }

         } else {
         throw new Error( 'No local stream to create DTMF Sender', 500)
         }
     }*/

     initDtmfSender(mediaStream) {

       switch (this.webrtc.settings.dtmf) {
       case "SIP-INFO":
         var func = function () {};
         func.prototype.insertDTMF = (key, duration, gap) => {
           var description = "Signal=" + key + "\nDuration=" + duration;
           var type = "application/dtmf-relay";
           this.dialog.info(description, type);
         };
         this.dtmfSender = new func();
         break;
       case "RTP-EVENT":
         if (!this.RTCPeerConnection.createDTMFSender) {
           throw new Error(" RTCPeerConnection method createDTMFSender() !!!! which is not support by this browser", 500);
         }
         if (mediaStream !== null) {
           var localAudioTrack = mediaStream.getAudioTracks()[0];
           this.dtmfSender = this.RTCPeerConnection.createDTMFSender(localAudioTrack);
           this.dtmfSender.ontonechange = (tone) => {
             this.webrtc.fire("dtmfOnToneChange", tone, this);
           };

         } else {
           throw new Error('No local stream to create DTMF Sender', 500);
         }
         break;
       }
     }

     sendDtmf(code, key, event) {
       if (this.dialog.status !== this.dialog.statusCode.ESTABLISHED) {
         return;
       }
       if (this.dtmfSender) {
         var duration = 500;
         var gap = 50;
         this.logger('DTMF SEND ' + key + '  duration :  ' + duration + ' gap :  ' + gap, "DEBUG");
         return this.dtmfSender.insertDTMF(key, duration, gap);
       }
       throw new Error(" DTMF SENDER not ready");
     }

     createOffer() {
       return this.RTCPeerConnection.createOffer((sessionDescription) => {
           try {
             this.sessionDescription = parseSdp.call(this, sessionDescription);
             this.from.setDescription(this.RTCPeerConnection.setLocalDescription(this.sessionDescription, () => {
                 // ASYNC CANDIDATES
                 if (this.asyncCandidates) {
                   // INVITE
                   this.dialog = this.webrtc.protocol.invite(this.to.name, this.sessionDescription);
                   this.callId = this.dialog.callId;
                   this.webrtc.fire("onInvite", this, this.to, this.sessionDescription);
                 } else {
                   // SYNC CANDIDATES
                   /*this.webrtc.listen(this, "onIcecandidate" , function(transaction, candidates, peerConnection){
                     if ( peerConnection.localDescription.type == "offer" ){
                       this.sessionDescription = parseSdp.call(this, peerConnection.localDescription ) ;
                       if ( this.dialog ){
                         var to = this.dialog.to.replace("<sip:", "").replace(">","") ;
                         this.dialog.invite(to, this.sessionDescription);
                       }else{
                         this.dialog = this.webrtc.protocol.invite(this.to.name, this.sessionDescription);
                         this.webrtc.fire("onInvite", this, this.to.name, this.sessionDescription );
                         this.callId = this.dialog.callId ;
                       }
                     }
                   })*/
                 }
               },
               (error) => {
                 this.error = error;
                 this.webrtc.fire("onError", this, error);
               }));
           } catch (e) {
             throw e;
           }
         },
         (error) => {
           this.webrtc.fire("onError", this, error);
         },
         this.from.settings.constraintsOffer);
     }

     setRemoteStream(event) {
       if (event) {
         //console.log(event.stream.getVideoTracks());
         this.to.createMediaStream(null, null);
         this.to.mediaStream.setStream(event.stream);
         var type = this.RTCPeerConnection.remoteDescription.type;
         if (event.type === "video" ||  event.type === "addstream") {
           this.webrtc.notificationsCenter.fire("onRemoteStream", type, event, this.to.mediaStream, this);
         }
       }
       return this.to.createMediaStream;
     }

     setRemoteDescription(type, user, description, dialog) {
       //console.log("setRemoteDescription")
       this.currentTransaction = dialog.currentTransaction;
       let desc = {
         type: type,
         sdp: description
       };
       //console.log( desc );
       let remoteDesc = parseSdp.call(this, desc);
       let ClassDesc = new RTCSessionDescription(remoteDesc);

       this.remoteDescription = this.RTCPeerConnection.setRemoteDescription(
         ClassDesc,
         () => {
           if (this.RTCPeerConnection.remoteDescription.type === "offer") {
             //console.log("WEBRTC : onRemoteDescription ");
             //this.doAnswer(dialog);
             this.webrtc.fire("onOffer", this.webrtc, this);
             this.webrtc.fire("onRemoteDescription", this.from, this, this.to);
           } else {
             this.webrtc.fire("onOffHook", this, dialog);
           }
         },
         (error) => {
           this.error = error;
           this.webrtc.fire("onError", this, error);
         }
       );
       return this.remoteDescription;
     }

     doAnswer(dialog) {
       return this.RTCPeerConnection.createAnswer(
         (sessionDescription) => {
           this.from.setDescription(sessionDescription);
           this.RTCPeerConnection.setLocalDescription(sessionDescription, () => {
               this.sessionDescription = sessionDescription;
               if (this.asyncCandidates) {
                 this.fire("onCreateAnwser", this.to, this.sessionDescription, this, dialog);
               }
               this.webrtc.fire("onOffHook", this, dialog);
             },
             (error) => {
               this.error = error;
               this.webrtc.fire("onError", this, error);
             });
         },
         // error
         (e) => {
           this.error = e;
           this.webrtc.fire("onError", this, e);
         },
         this.from.settings.constraints
       );
     }

     bye() {
       if (this.dialog) {
         this.dialog.bye();
       }
     }

     cancel() {
       if (this.currentTransaction) {
         this.currentTransaction.cancel();
       }
       this.webrtc.closeTransaction(this, this.to.name);
     }

     decline() {
       if (this.currentTransaction) {
         this.currentTransaction.decline();
       }
       this.webrtc.closeTransaction(this, this.to.name);
     }

     close() {
       this.logger("WEBRTC CLOSE TRANSACTION  : " + this.callId, "DEBUG");
       if (this.RTCPeerConnection) {
         this.RTCPeerConnection.close();
       } else {
         this.logger("WEBRTC  TRANSACTION ALREADY CLOSED : " + this.callId, "WARNING");
       }
       if (this.webrtc) {
         this.webrtc.unListen("onKeyPress", this.sendDtmf);
       }
       this.clear();
       return this;
     }

     clear() {
       if (this.RTCPeerConnection) {
         this.RTCPeerConnection = null;
         delete this.RTCPeerConnection;
       }
       if (this.webrtc) {
         this.webrtc = null;
         delete this.webrtc;
       }
       if (this.currentTransaction) {
         this.currentTransaction = null;
         delete this.currentTransaction;
       }
       if (this.candidates) {
         this.candidates = null;
         delete this.candidates;
       }
       if (this.dialog) {
         this.dialog = null;
         delete this.dialog;
       }
       if (this.from) {
         this.from = null;
         delete this.from;
       }
       if (this.to) {
         this.to = null;
         delete this.to;
       }
       if (this.error) {
         this.error = null;
         delete this.error;
       }
     }
   }

  return Transaction;
}
