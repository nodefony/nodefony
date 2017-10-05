 /*
  *
  *
  */

 const Url = require("url");

 module.exports = nodefony.registerCommand("Monitoring", function () {

   const monitoring = class monitoring extends nodefony.cliKernel {

     constructor(container, command, options) {

       super("Monitoring", container, container.get("notificationsCenter"), options);

       let cmd = command[0].split(":");
       let args = command[1];
       switch (cmd[1]) {
       case "test":
         this.serverLoad = this.container.get("serverLoad");
         let proto = null;
         let url = null;
         let nb = null;
         let concurence = null;
         switch (cmd[2]) {
         case "load":
           try {
             url = Url.parse(args[0]);
             nb = parseInt(args[1], 10);
             concurence = parseInt(args[2], 10);
           } catch (e) {
             this.showHelp();
             this.terminate(1);
           }
           if (!url.protocol) {
             proto = "http";
             url.protocol = "http:";
             url.href = "http://" + url.href;
           } else {
             proto = url.protocol.replace(":", "");
           }
           this.serverLoad.handleConnection({
             type: proto,
             nbRequest: nb ||  1000,
             concurence: concurence || 40,
             url: url.href,
             method: 'GET'
           }, this);
           break;
         default:
           this.showHelp();
           this.terminate(0);
         }
         break;
       default:
         this.showHelp();
         this.terminate(0);
       }
     }

     send(data /*, encodage*/ ) {
       let message = JSON.parse(data);
       if (message.message === "END LOAD TEST") {
         this.displayTable(message);
         this.logger(data, "INFO");
       } else {
         this.logger(data, "INFO");
       }
     }

     close(code) {
       if (code) {
         return this.terminate(code);
       }
       return this.terminate(0);
     }

     displayTable(ele) {
       var obj = new Array(5);
       for (var val in ele) {
         switch (val) {
         case "average":
           obj[3] = ele[val];
           break;
         case "averageNet":
           obj[0] = ele[val];
           break;
         case "requestBySecond":
           obj[1] = ele[val];
           break;
         case "totalTime":
           obj[2] = ele[val];
           break;
         case "cpu":
           obj[4] = ele[val].percent;

           break;
         }
       }
       let head = [
         "Average By Requests ( ms )",
         "Average Requests By Seconde",
         "Total Time (s)",
         "Average By Concurences (s)",
         "Average CPU (%)"
       ];
       super.displayTable([obj], {
         head: head,
         align: ["center", "center", "center", "center", "center"]
       });
     }
   };
   return {
     name: "Monitoring",
     commands: {
       Test: ["Monitoring:test:load URL [nbRequests] [concurence]", "load test example : nodefony Monitoring:test:load http://localhost:5151/demo 10000 100 "],
     },
     cli: monitoring
   };
 });
