module.exports = function (stage) {

  'use strict';


  const defaultAparser = function (value, block) {
    if (value) {
      return value;
    }
    return null;
  };

  const rtpmapParser = function (value, block) {
    //a=rtpmap:<payload type> <encoding name>/<clock rate>[/<encoding parameters>]
    if (value) {
      var obj = {
        payloadType: null,
        encodingName: null,
        clockRate: null,
        encodingParameters: null,
        raw: value
      };
      var res = value.split(" ");
      for (var i = 0; i < res.length; i++) {
        switch (i) {
        case 0:
          obj.payloadType = res[i];
          break;
        case 1:
          var ret = res[i].split("/");
          obj.encodingName = ret[0];
          if (ret[1]) {
            obj.clockRate = ret[1];
          }
          if (ret[2]) {
            obj.encodingParameters = ret[2];
          }
          break;
        }
      }

      if (!(obj.encodingName in block.rtpmap)) {
        var index = block.rtpmap.push(obj);
        block.rtpmap["rtpmap_" + obj.payloadType] = block.rtpmap[index - 1];
      }
      return obj;
    }
    return null;
  };

  var candidateParser = function (value, block) {
    /* a=candidate:0 1 UDP 2122252543 169.254.105.57 65488 typ host
     * a=candidate:6glsxoSzDfHGkyMz 1 UDP 2130706431 93.20.94.1 35796 typ host
     * a=candidate:2 1 UDP 1694498815 192.0.2.3 45664 typ srflx raddr 10.0.1.1 rport 8998
     * a=candidate:86628240 1 udp 2122260223 192.168.10.234 64435 typ host generation 0 network-id 3
     *
     *
     *
     *
     *   candidate-attribute   = "candidate" ":"
     *	   foundation SP
     *	   component-id SP
     *         transport SP
     *         priority SP
     *         connection-address SP     ;from RFC 4566
     *         port         ;port from RFC 4566 SP
     *         cand-type
     *          [SP rel-addr]
     *          [SP rel-port]
     *          *(SP extension-att-name SP
     *               extension-att-value)
     */
    if (value) {

      var obj = {
        foundation: null,
        componentId: null,
        transport: null,
        transportExt: null,
        priority: null,
        connectionAddress: null,
        port: null,
        candidateType: null,
        remoteAddr: null,
        remotePort: null,
        generation: null,
        networkId: null,
        raw: value
      };
      var res = value.split(" ");
      for (var i = 0; i < res.length; i++) {
        switch (i) {
        case 0:
          obj.foundation = res[i];
          break;
        case 1:
          obj.componentId = res[i];
          break;
        case 2:
          obj.transport = res[i];
          var ret = res[i].split("/");
          obj.transport = ret[0];
          if (ret[1]) {
            obj.transportExt = ret[1];
          }
          break;
        case 3:
          obj.priority = res[i];
          break;
        case 4:
          obj.connectionAddress = res[i];
          break;
        case 5:
          obj.port = res[i];
          break;
        default:
          switch (res[i]) {
          case "typ":
            obj.candidateType = res[i + 1];
            break;
          case "raddr":
            obj.remoteAddr = res[i + 1];
            break;
          case "rport":
            obj.remotePort = res[i + 1];
            break;
          case "generation":
            obj.generation = res[i + 1];
            break;
          case "network-id":
            obj.networkId = res[i + 1];
            break;
          }
          break;
        }
      }
      block.candidates.push(obj);
      return value;
    }
    return null;
  };

  const aAttribute = {
    "cat": defaultAparser,
    "keywds": defaultAparser,
    "tool": defaultAparser,
    "ptime": defaultAparser,
    "maxptime": defaultAparser,
    "rtpmap": rtpmapParser,
    "orient": defaultAparser,
    "type": defaultAparser,
    "charset": defaultAparser,
    "sdplang": defaultAparser,
    "lang": defaultAparser,
    "framerate": defaultAparser,
    "quality": defaultAparser,
    "fmtp": defaultAparser,
    "candidate": candidateParser
  };

  const aAttributeDirection = {
    "recvonly": defaultAparser,
    "sendrecv": defaultAparser,
    "sendonly": defaultAparser,
    "inactive": defaultAparser
  };

  /*
   *	SDP PROTOCOL
   *
   */
  const parserSdp = class parserSdp {

    constructor(body) {
      if (!body) {
        throw new Error("SDP parser no data found !! ");
      }
      //this.line = body.split("\n");
      //this.nbLines = this.line.length ;
      //this.size = body.length ;
      this.raw = body;
      this.blocks = [];
      this.sessionBlock = null;
      this.audioBlock = null;
      this.videoBlock = null;
      this.detectBlocks();
      this.parseBlocks();
    }

    detectBlocks() {
      var line = this.raw.split("\n");
      var nbLines = line.length;
      var first = 0;
      var m = null;
      for (var i = 0; i < nbLines; i++) {
        var res = line[i].split("=");
        var key = res[0].replace(/ |\n|\r/g, "");
        var value = res[1];
        let data = null;
        let size = null;
        let media = null;
        let type = null;
        switch (key) {
        case "m":
          if (first === 0) {
            data = line.slice(first, i);
            size = data.length;
          } else {
            data = line.slice(first + 1, i);
            size = data.length;
          }
          let parseM = this.parseMline(m);
          if (parseM) {
            media = parseM;
            type = parseM.media;
          } else {
            media = null;
            type = "session";
          }
          this.blocks.push({
            type: type,
            direction: null,
            //start		: first,
            //end		: i,
            data: data,
            //size		: size,
            media: media,
            information: "",
            attributes: [],
            bandwidths: [],
            candidates: [],
            connection: null,
            encryption: null
          });
          first = i;
          m = value;
          break;
        }
      }
      var data = line.slice(first + 1, nbLines);
      var size = data.length;
      var media = null;
      var type = null;
      var parseM = this.parseMline(m);
      if (parseM) {
        media = parseM;
        type = parseM.media;
      } else {
        media = null;
        type = "session";
      }
      this.blocks.push({
        type: type,
        direction: null,
        //start		: first,
        //end		: nbLines,
        data: data,
        //size		: size,
        media: media,
        information: "",
        attributes: [],
        bandwidths: [],
        candidates: [],
        connection: null,
        encryption: null
      });
    }

    parseMline(data) {
      // RFC https://tools.ietf.org/html/rfc4566#section-5.14
      //=<media> <port>/<number of ports> <proto> <fmt> ...
      let obj = null;
      if (data) {
        obj = {
          media: "",
          port: "",
          nbPort: 0,
          proto: "",
          fmt: [],
          raw: data
        };
        var res = data.split(" ");
        for (var i = 0; i < res.length; i++) {
          switch (i) {
          case 0:
            obj.media = res[i];
            break;
          case 1:
            var ret = res[i].split("/");
            obj.port = ret[0];
            if (ret[1]) {
              obj.nbPort = ret[1];
            } else {
              obj.nbPort = 1;
            }
            break;
          case 2:
            obj.proto = res[i];
            break;
          default:
            obj.fmt.push(res[i]);
          }
        }
        return obj;
      }
      return null;
    }

    parseAline(data, block) {
      //a=<attribute>:<value>
      let obj = {};
      if (!data) {
        return obj;
      }
      let res = data.split(":");
      let attribute = res[0].replace(/ |\n|\r/g, "");
      let value = res[1];
      if (aAttribute[attribute]) {
        obj[attribute] = aAttribute[attribute](value, block);
      } else {
        switch (attribute) {
        case "setup":
          obj[attribute] = value;
          block.setup = value;
          break;
        default:
          if (aAttributeDirection[attribute]) {
            var ele = aAttributeDirection[attribute](attribute, block);
            obj[attribute] = ele;
            block.direction = ele;
          } else {
            obj[attribute] = value;
          }
        }
      }
      return obj;
    }

    parseCline(data) {
      //c=<nettype> <addrtype> <connection-address>
      if (data) {
        var obj = {
          nettype: null,
          addrtype: null,
          address: null,
          raw: data
        };
        var res = data.split(" ");
        for (var i = 0; i < res.length; i++) {
          switch (i) {
          case 0:
            obj.nettype = res[i];
            break;
          case 1:
            obj.addrtype = res[i];

            break;
          case 2:
            obj.address = res[i];
            break;
          }
        }
        return obj;
      }
      return null;
    }

    parseOline(data) {
      //o=<username> <sess-id> <sess-version> <nettype> <addrtype> <unicast-address>
      let obj = null;
      if (data) {
        obj = {
          username: null,
          sessId: null,
          sessVersion: null,
          nettype: null,
          addrtype: null,
          unicastAddr: null,
          raw: data
        };
        let res = data.split(" ");
        for (let i = 0; i < res.length; i++) {
          switch (i) {
          case 0:
            obj.username = res[i];
            break;
          case 1:
            obj.sessId = res[i];
            break;
          case 2:
            obj.sessVersion = res[i];
            break;
          case 3:
            obj.nettype = res[i];
            break;
          case 4:
            obj.addrtype = res[i];
            break;
          case 5:
            obj.unicastAddr = res[i];
            break;
          }
        }
        return obj;
      }
      return null;
    }

    /*
     *	TIME DESCRIPTION
     */
    parseTline(data) {
      //t=<start-time> <stop-time>
      if (data) {
        var obj = {
          start: null,
          stop: null,
          raw: data
        };
        var res = data.split(" ");
        for (var i = 0; i < res.length; i++) {
          switch (i) {
          case 0:
            obj.start = res[i];
            break;
          case 1:
            obj.stop = res[i];
            break;
          }
        }
        return obj;
      }
      return null;
    }

    parseRline(data) {
      //r=<repeat interval> <active duration> <offsets from start-time>
      if (data) {
        var obj = {
          interval: null,
          duration: null,
          offsets: null,
          raw: data
        };
        var res = data.split(" ");
        for (var i = 0; i < res.length; i++) {
          switch (i) {
          case 0:
            obj.interval = res[i];
            break;
          case 1:
            obj.duration = res[i];
            break;
          case 2:
            obj.offsets = res[i];
            break;
          }
        }
        return obj;
      }
      return null;
    }

    /** BLOCK MEDIA
     *    Media description, if present
     *  m=  (media name and transport address)
     *  i= (media title)
     *  c= (connection information -- optional if included at
     *     session level)
     *  b= (zero or more bandwidth information lines)
     *  k= (encryption key)
     *  a= (zero or more media attribute lines)
     */
    blockMediaParser(block) {
      block.rtpmap = [];
      for (var j = 0; j < block.data.length; j++) {
        var res = block.data[j].split("=");
        var key = res[0].replace(/ |\n|\r/g, "");
        var value = res[1];
        switch (key) {
        case "a":
          block.attributes.push(this.parseAline(value, block));
          break;
        case "c":
          block.connection = this.parseCline(value);
          break;
        case "i":
          block.information = value;
          break;
        case "b":
          block.bandwidths.push(value);
          break;
        case "k":
          block.encryption = value;
          break;
        }
      }
      return block;
    }

    /*  BLOCK SESSION
     *    session description
     *  v=  (protocol version)
     *  o=  (originator and session identifier)
     *  s=  (session name)
     *  i= (session information)
     *  u= (URI of description)
     *  e= (email address)
     *  p= (phone number)
     *  c= (connection information -- not required if included in
     *     all media)
     *  b= (zero or more bandwidth information lines)
     *     One or more time descriptions ("t=" and "r=" lines; see below)
     *  z= (time zone adjustments)
     *  k= (encryption key)
     *  a= (zero or more session attribute lines)
     *     Zero or more media descriptions
     */
    blockSessionParser(block) {
      block.protocol = null;
      block.originator = null;
      block.timeZone = null;
      block.sessionName = null;
      block.originator = null;
      block.protocol = null;
      block.uri = null;
      block.phoneNumber = null;
      block.email = null;
      block.timeDescription = null;
      block.timeRepeat = null;

      for (var j = 0; j < block.data.length; j++) {
        var res = block.data[j].split("=");
        var key = res[0].replace(/ |\n|\r/g, "");
        var value = res[1];
        switch (key) {
        case "v":
          block.protocol = value;
          break;
        case "o":
          block.originator = this.parseOline(value);
          break;
        case "s":
          block.sessionName = value;
          break;
        case "u":
          block.uri = value;
          break;
        case "e":
          block.email = value;
          break;
        case "p":
          block.phoneNumber = value;
          break;
        case "z":
          block.timeZone = value;
          break;
        case "a":
          block.attributes.push(this.parseAline(value, block));
          break;
        case "c":
          block.connection = this.parseCline(value);
          break;
        case "i":
          block.information = value;
          break;
        case "b":
          block.bandwidths.push(value);
          break;
        case "k":
          block.encryption = value;
          break;
          // TIME DESCRIPTION
        case "t":
          block.timeDescription = this.parseTline(value);
          break;
        case "r":
          block.timeRepeat = this.parseRline(value);
          break;
        }
      }
      return block;
    }

    parseBlocks() {
      for (var i = 0; i < this.blocks.length; i++) {
        switch (this.blocks[i].type) {
        case "session":
          this.sessionBlock = this.blockSessionParser(this.blocks[i]);
          break;
        case "audio":
          this.audioBlock = this.blockMediaParser(this.blocks[i]);
          break;
        case "video":
          this.videoBlock = this.blockMediaParser(this.blocks[i]);
          break;
        }
      }
    }
  };

  stage.io.protocols.sdp = parserSdp;

  return parserSdp;
};