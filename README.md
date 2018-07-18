<p align="center">
  <img src="https://github.com/nodefony/nodefony-core/raw/master/src/nodefony/bundles/frameworkBundle/Resources/public/images/nodefony-logo.png"><br>
</p>
<h1 align="center">NODEFONY  FRAMEWORK</h1>

[![Issues Status](https://img.shields.io/github/issues/nodefony/nodefony.svg)](https://github.com/nodefony/nodefony/issues) [![Build Status](https://travis-ci.org/nodefony/nodefony.svg?branch=master)](https://travis-ci.org/nodefony/nodefony) [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/495/badge)](https://bestpractices.coreinfrastructure.org/projects/495)

Nodefony is Node.js full-stack web framework.  

Nodefony can be used to develop a complete solution to create a web application.

The Nodefony project is inspired by the PHP Symfony framework, a developer can find most of the concepts, configurations and patterns of Symfony framework.

Nodefony is not an exhaustive port of symfony !

## Table of content

-   [Features](#features)
-   [Requirements](#requirements)
-   [Install](#install)
-   [Start Development Mode](#start)
-   [Start Production Mode](#start_prod)
-   [Configurations](#configurations)
-   [Get Started](#bundles)
-   [HTTPS Access](#https)
-   [References / Thanks](#references--thanks)
-   [Authors](#authors)
-   [License](#license)
-   [Demo](#demo)

## <a name="features"></a>Nodefony features :

-   Servers  ([http(s)](https://nodejs.org/dist/latest-v8.x/docs/api/https.html), [websocket(s)](https://github.com/theturtle32/WebSocket-Node), statics, sockjs)
-   [HTTP2](https://nodejs.org/api/http2.html)  http2 ready node module provides an implementation of the HTTP/2 (push server ready).
-   Dynamics routing
-   ORM ([Sequelize](http://docs.sequelizejs.com/), [mongoose](http://mongoosejs.com/index.html))
-   Simple Databases connection (mongo, ...)
-   MVC templating ([Twig](https://github.com/twigjs/twig.js))
-   Notion of real-time context in Action Controller (websocket).
-   Notion of synchronous or asynchronous execution in Action Controller (Promise).
-   Services Containers, Dependency Injection (Design Patterns)
-   Sessions Manager (ORM, memcached)
-   Authentication Manager (Digest, Basic, oAuth, Local, ldap, jwf)
-   WAF ( Web application firewall )
-   Cross-Origin Resource Sharing ([CORS](https://www.w3.org/TR/cors/))
-   Production Management ([PM2](https://github.com/Unitech/pm2/))
-   RealTime API ([Bayeux Protocol](http://autogrowsystems.github.io/faye-go/))
-   Webpack Assets management (Like WDS with HMR hot module Replacement)
-   C++ Addons (Binding in Bundle)
-   Translations
-   CLI (Command Line Interface)
-   Monitororing , Debug Bar
-   Unit Test Api in framework context ([MOCHA](https://mochajs.org/))

**Nodefony assimilates into the ecosystem of node.js with services like** :

-   [WEBPACK](https://webpack.js.org/) Module bundler for assets management of application .
-   [SockJS](https://github.com/sockjs) Server ( Like WDS 'Webpack Dev Server' and HMR management )
-   [WATCHER](https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener) node.js for auto reload-files in developement mode .
-   [PM2](http://pm2.keymetrics.io/) Production Process Manager for Node.js .
-   [Passport](http://passportjs.org/) Simple, unobtrusive authentication for Node.js .
-   [Angular](https://github.com/angular/angular-cli) Experimental Bundle Generator ( Now an Angular Project can be merge into a Nodefony Bundle )
-   [React](https://github.com/facebookincubator/create-react-app) Experimental Bundle Generator ( Now an React Project can be merge into a Nodefony Bundle )

**Nodefony 4  adds the following features** :

-   C++ Addons (Binding in Bundle)
-   Authorisations
-   HTTP2
-   WEBPACK 4  


Now in this version  4 Beta,  Nodefony is evolved to a stable version without major fundamental changes.

Evolution priorities up to the stable version will focus on robustness, unit testing, documentation and security.

#### Nodefony is ported with ECMAScript 6 ( Class, Inheritance ).

You can follow Nodefony build on travis at **<https://travis-ci.org/nodefony/nodefony>**

## **Resources for Newcomers**

#### -  **[Nodefony Demo](https://nodefony.net)**

#### -  **[Nodefony Documentation](https://nodefony.net/documentation/default/nodefony)**

#### -  **[Nodefony Monitoring](https://nodefony.net/nodefony)**

#### Documentation in progress !!



## <a name="requirements"></a>Requirements

#### On your system _you must have Installed_ :

-   ###### **[GIT](http://git-scm.com/)**  is Distributed version control system

-   **[Node.js](https://nodejs.org/)** ® is a Platform built on Chrome's JavaScript runtime ( >= 6 )

-   **[npm](https://www.npmjs.com/)** or **[yarn](https://yarnpkg.com/lang/en/)**  Packages Manager for javascript application


#### Operating Systems : **[Install Node.js via Package](https://nodejs.org/en/download/package-manager)**

-   LINUX

    -   debian (Checked, Tested)
    -   RASPBIAN Raspberry Pi (Checked)

-   FreeBSD (Checked)

    -   pkg install bash rsync gmake gcc6
    -   setenv CC "/usr/local/bin/gcc"
    -   setenv CXX "/usr/local/bin/g++"
    -   cd /usr/local/bin/ ;ln -s pythonx.x python
    -   replace make by gmake

-   ~~OpenBSD (Not Checked yet )~~

-   MACOS (Checked, Tested)

-   ~~WINDOWS (Not ported yet )~~

-   ~~[ELECTRON](https://github.com/nodefony/nodefony-electron) Experimental Nodefony Electron  ( Now an Electron Context can be use in Nodefony Project )~~

-   EMBEDDED SYSTEM ( Very difficult : large memory footprint )  

## <a name="install"></a>Install Framework **More Info : [ Getting Started with Nodefony ](https://nodefony.net/documentation/Beta/nodefony/started)**

**npm** :

```bash
$ npm -g install nodefony
```

**yarn** :

```bash
$ yarn global add nodefony
```

[See Global install How to Prevent Permissions Errors](https://docs.npmjs.com/getting-started/fixing-npm-permissions)

**Generating a Nodefony project** :

```bash
$ nodefony create  myproject
$ cd myproject
```

**Usage** :

```bash
$ nodefony help

Usage: nodefony <command:task:action> [args...]

  Options:
    -d, --debug         Nodefony debug
    -h, --help          Nodefony help
    -v, --version       Nodefony version
    -i, --interactive   Nodefony cli Interactive Mode
    -j, --json          Nodefony json response

nodefony                                                                                              
         create [-i] name [path]                       Create New Nodefony Project  
```

**Generating a Nodefony Project Interactive Mode** :

```bash
$ nodefony
 _   _    ___    ____    _____   _____    ___    _   _  __   __
| \ | |  / _ \  |  _ \  | ____| |  ___|  / _ \  | \ | | \ \ / /
|  \| | | | | | | | | | |  _|   | |_    | | | | |  \| |  \ V /
| |\  | | |_| | | |_| | | |___  |  _|   | |_| | | |\  |   | |  
|_| \_|  \___/  |____/  |_____| |_|      \___/  |_| \_|   |_|  

Version : 4.0.0-beta.1 Platform : darwin Process : nodefony PID : 16368

?  Nodefony CLI :  (Use arrow keys)
❯ Create Nodefony Project
Help
Quit
```

## <a name="start"></a>Serving a Nodefony project via a development servers

**Starting Development Servers** :

```bash
$ cd myproject
$ nodefony dev

// debug mode
$ nodefony -d dev

# TO STOP
$ <ctrl-c>
```
**Starting Development Servers in Debug Mode (-d)** :
```bash
$ nodefony -d dev

# TO STOP
$ <ctrl-c>
```

**Starting Development Servers in Inspector mode (--inspect)** :

[Nodejs Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started)
```bash
$ npm -g install npx

$ npx --node-arg=--inspect nodefony dev

# check chrome://inspect in your browser
```

**Serving a Nodefony project via Interactive Mode** :

```bash
$ nodefony
 _   _    ___    ____    _____   _____    ___    _   _  __   __
| \ | |  / _ \  |  _ \  | ____| |  ___|  / _ \  | \ | | \ \ / /
|  \| | | | | | | | | | |  _|   | |_    | | | | |  \| |  \ V /
| |\  | | |_| | | |_| | | |___  |  _|   | |_| | | |\  |   | |  
|_| \_|  \___/  |____/  |_____| |_|      \___/  |_| \_|   |_|  

Version : 4.0.0-beta.1 Platform : darwin Process : nodefony PID : 16421

?  Nodefony CLI :  (Use arrow keys)
❯ Start Server Development
Start Server Pre-Production
Start Server Production
Install
Build
Generate Bundle
Generate Controller
Webpack Dump
Generate Certificates
Run Test
Outdated
Reset
Help
Quit
```

## <a name="start_prod"></a>Serving a Nodefony Project via a Production server :

**Starting a Nodefony project with [PM2](http://pm2.keymetrics.io/)** :
```bash
$ nodefony prod
```
You can see PM2 config : config/pm2.config.js
```bash
# TO KILL PM2 DEAMON
$ nodefony kill

# TO STOP APPLICATION WITHOUT KILL PM2 DEAMON
$ nodefony stop
```

**Checking a Nodefony Project Pre-Production (cluster mode)** :
```bash
$ nodefony preprod
```

## <a name="https"></a>Serving a Nodefony project with HTTPS

By default nodefony listen secure port in 5152

During the installation process all the openssl parts were generated ( self-signed localhost certificate ).

You must Add a Trusted CA in your Browser : projectName-root-ca.crt.pem

You can find certificate authority (ca) here:

    config/certificates/ca/projectName-root-ca.crt.pem

#### Access to Secure App with URL : <https://localhost:5152>
#### Access to App with URL : <http://localhost:5151>

[![nodefony](https://raw.githubusercontent.com/nodefony/nodefony-core/master/src/nodefony/bundles/documentationBundle/Resources/public/images/nodefony.png)](https://nodefony.net)

## <a name="configurations"></a>Framework Configurations

Open **[config/config.yml](https://github.com/nodefony/nodefony-core/blob/master/config/config.yml)**  if you want change httpPort, domain ,servers, add bundle, locale ...

```yml
system:
  domain                        : localhost             # nodefony can listen only one domain ( no vhost )  /    [::1] for IPV6 only
  domainAlias:   # domainAlias string only <<regexp>>   example ".*\\.nodefony\\.com  ^nodefony\\.eu$ ^.*\\.nodefony\\.eu$"
    - "^127.0.0.1$"
  httpPort                      : 5151
  httpsPort                     : 5152
  statics                       : true
  security                      : true
  realtime                      : true
  monitoring                    : true
  documentation                 : true
  unitTest                      : true
  demo                          : true
  locale                        : "en_en"
  servers:
    protocol                    : "2.0"             #  2.0 || 1.1
    http                        : true
    https                       : true
    ws                          : true
    wss			                    : true
    certificats:
      key                       : "config/certificates/server/privkey.pem"
      cert                      : "config/certificates/server/fullchain.pem"
      ca                        : "config/certificates/ca/projectName-root-ca.crt.pem"
      options:
        rejectUnauthorized      : true
  devServer:
    inline                      : true
    hot                         : false
    hotOnly                     : false
    overlay                     : true
    logLevel                    : info        # none, error, warning or info
    progress                    : false
    protocol                    : https
    websocket                   : true
  bundles:
    hello-bundle                : "file:src/bundles/hello-bundle"
```

## <a name="bundles"></a>Get Started

### Install Nodefony  :
```
$ npm -g install nodefony
```

### Install Project  :
```
$ nodefony create  myproject
$ cd myproject
```

### Generating Bundle  :

CLI Generate new bundle : default path src/bundles

```bash
$ nodefony generate:bundle name path
```

###  Generate New Bundle Interactive

```bash
$ nodefony
?  Nodefony CLI :  
  Start Server Development
  Start Server Pre-Production
  Start Server Production
  Install
  Build
❯ Generate Bundle
  Generate Controller
  Webpack Dump
  Generate Certificates
  Run Test
  Outdated
  Reset
  Help
  Quit
```

### Starting Servers to check new Bundle hello:

```bash
$ nodefony dev
```
Access to bundle route with URL : <http://localhost:5151/hello>

Access to bundle route with URL : <https://localhost:5152/hello>

#### Now hello-bundle is auto-insert in framework with watcher active and auto-config Webpack Module bundler

### Example controller  : src/bundles/hello-bundle/controller/defaultController.js

```js
module.exports = class defaultController extends nodefony.controller {
  constructor (container, context){
    super(container, context);
  }
  indexAction() {
    try {
      return this.render("hello-bundle::index.html.twig", {
        name: "hello-bundle"
      });
    } catch (e) {
      throw e;
    }
  }
};
```

### Example view  (twig) : src/bundles/hello-bundle/Resources/views/index.html.twig

```twig
{% extends '/app/Resources/views/base.html.twig' %}

{% block title %}Welcome {{name}}! {% endblock %}

{% block stylesheets %}
  {{ parent() }}
  <!-- WEBPACK BUNDLE -->
  <link rel='stylesheet' href='{{CDN("stylesheet")}}/hello-bundle/assets/css/hello.css' />
{% endblock %}

{% block body %}
      <img class='displayed' src='{{CDN("image")}}/framework-bundle/images/nodefony-logo-white.png'>
      <h1 class='success'>
        <a href='{{url('documentation')}}'>
          <strong style='font-size:45px'>NODEFONY</strong>
        </a>
        <p>{{trans('welcome')}} {{name}}</p>
      </h1>
{% endblock %}

{% block javascripts %}
  {{ parent() }}
  <!-- WEBPACK BUNDLE -->
  <script src='{{CDN("javascript")}}/hello-bundle/assets/js/hello.js'></script>
{% endblock %}
```

### watchers :

#### The bundle generation engine build bundle config with  node.js watcher configuration

#### In developement mode  is very usefull to auto-reload files as controllers , views , routing , translations

#### without having to reboot the server.

You can see hello-bundle config   : src/bundles/hello-bundle/Resources/config/config.yml

```yml
########## nodefony CONFIG BUNDLE  hello-bundle  ############
name :                          hello-bundle
version:                        "1.0.0"
locale :                        en_en

#
#  WATCHERS
#
#    watchers Listen to changes, deletion, renaming of files and directories
#    of different components
#
#    For watch all components
#
#      watch:			true
#    or
#      watch:
#        controller:	true
#        config:        true		# only  routing
#        views:         true
#        translations:  true
#        webpack:       true
#        services:      true
#
watch:                          true
```

### Webpack Module bundler :

#### The bundle generation engine build bundle config with a predefined webpack configuration

#### In this way webpack is very usefull to manage all assets of bundle

#### In developement mode watch  is very usefull to auto-compile webpack module bundle

#### without having to reboot the server

You can see hello-bundle config webpack : src/bundles/hello-bundle/Resources/config/webpack.config.js

```js
module.exports = webpackMerge({
  context: context,
  target: "web",
  entry       : {
    hello  : [ "./js/hello.js" ]
  },
  output: {
    path: public,
    publicPath: publicPath,
    filename: "./js/[name].js",
    library: "[name]",
    libraryTarget: "umd"
  },
  externals: {},
  resolve: {},
  module: {...}
});
```


## <a name="monitoring"></a>Monitoring FRAMEWORK

Access to monitoring route with URL : <http://localhost:5151/nodefony>

[![MONITORING](https://raw.githubusercontent.com/nodefony/nodefony-core/master/doc/default/cluster.png)](https://nodefony.net/nodefony)

Monitoring in progress !!!

**Big thanks:**

**Related Links:**

-   [Node.js](https://nodejs.org/)
-   [npm](https://www.npmjs.com/)
-   [Framework Symfony](http://symfony.com/)
-   [Twig.js](https://github.com/justjohn/twig.js/wiki)
-   [PM2](https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md)
-   [WEBPACK](https://webpack.js.org/)

More informations  **[Nodefony Documentation](https://nodefony.net/documentation/default/nodefony)**

## <a name="authors"></a>Authors

-   Christophe CAMENSULI  [github/ccamensuli](https://github.com/ccamensuli)

## <a name="license"></a>License

[CeCILL-B](https://github.com/nodefony/nodefony/blob/master/LICENSE)

## <a name="demo"></a>Demo

[Demo](https://nodefony.net)
