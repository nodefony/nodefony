# **NODEFONY  FRAMEWORK**  
[![Issues Status](https://img.shields.io/github/issues/nodefony/nodefony.svg)](https://github.com/nodefony/nodefony/issues) [![Build Status](https://travis-ci.org/nodefony/nodefony.svg?branch=master)](https://travis-ci.org/nodefony/nodefony) [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/495/badge)](https://bestpractices.coreinfrastructure.org/projects/495)  [![bitHound Overall Score](https://www.bithound.io/github/nodefony/nodefony/badges/score.svg)](https://www.bithound.io/github/nodefony/nodefony)

Nodefony is Node.js full-stack web framework.  

Nodefony can be used to develop a complete solution to create a web application.

The Nodefony project is inspired by the PHP Symfony framework, a developer can find most of the concepts, configurations and patterns of Symfony framework.

Nodefony is not an exhaustive port of symfony !

Nodefony features :
- Servers  ([http(s)](https://nodejs.org/dist/latest-v8.x/docs/api/https.html), [websocket(s)](https://github.com/theturtle32/WebSocket-Node), statics, sockjs)
- Dynamics routing
- ORM ([Sequelize](http://docs.sequelizejs.com/))
- Simple Databases connection (mongo, redis ...)
- MVC templating ([Twig](https://github.com/twigjs/twig.js))
- HMR hot module Replacement  (auto-reload controller views routing in developement mode)
- Notion of real-time context in Action Controller (websocket).
- Notion of synchronous or asynchronous execution in Action Controller (Promise).
- Services Containers, Dependency Injection (Design Patterns)
- Sessions Manager (ORM, memcached)
- Authentication Manager (Digest, Basic, oAuth, Local, ldap)
- Firewall ( Application Level )
- Cross-Origin Resource Sharing ([CORS](https://www.w3.org/TR/cors/))
- Production Management ([PM2](https://github.com/Unitech/pm2/))
- RealTime API ([Bayeux Protocol](http://autogrowsystems.github.io/faye-go/))
- Translations
- CLI (Command Line Interface)
- Monitororing , Debug Bar
- Unit Test Api in framework context ([MOCHA](https://mochajs.org/))

Nodefony assimilates into the ecosystem of node.js with services like :
- [WEBPACK](https://webpack.js.org/) Module bundler for assets management of application .
- [WATCHER](https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener) node.js for auto reload-files in developement mode .
- [PM2](http://pm2.keymetrics.io/) Production Process Manager for Node.js .
- [Passport](http://passportjs.org/) Simple, unobtrusive authentication for Node.js .

Nodefony 3  adds the following features :
- [Angular](https://github.com/angular/angular-cli) Bundle Generator ( Now an Angular Project can be merge into a Nodefony Bundle )
- ~~[React](https://github.com/facebookincubator/create-react-app) Bundle Generator ( Soon an React Project can be merge into a Nodefony Bundle )~~
- [SockJS](https://github.com/sockjs) Server ( Like WDS 'Webpack Dev Server' and HMR management )
- New cli Management (Command Line Interface )
- ~~[Electron](https://github.com/nodefony/nodefony-electron) Experimental Nodefony Electron  ( Now an Electron Context can be use in Nodefony Project  )~~

Now in this version  3 Beta,  Nodefony is evolved to a stable version without major fundamental changes.

Evolution priorities up to the stable version will focus on robustness, unit testing, documentation and security.

#### Now nodefony is ported with ECMAScript 6 ( Class, Inheritance ).

You can follow Nodefony build on travis at **[https://travis-ci.org/nodefony/nodefony](https://travis-ci.org/nodefony/nodefony)**

##  **Resources for Newcomers**

#### -  **[Nodefony Demo](https://nodefony.net)**  
#### -  **[Nodefony Documentation](https://nodefony.net/documentation/default/nodefony)**
#### -  **[Nodefony Monitoring](https://nodefony.net/nodefony)**

#### Documentation in progress !!

## __Table of content__

- [Requirements](#requirements)
- [Install](#install)
- [Start Development Mode](#start)
- [Configurations](#configurations)
- [Command line Interface](#cli)
- [Get Started](#bundles)
- [Start Production Mode](#start_prod)
- [HTTPS Access](#https)
- [References / Thanks](#references--thanks)
- [Authors](#authors)
- [License](#license)
- [Demo](#demo)


## <a name="requirements"></a>Requirements

#### On your system *you must have Installed* :   
- ###### **[GIT](http://git-scm.com/)**  is Distributed version control system

-  **[GNU Make](https://www.gnu.org/software/make/)**  is a Tool which controls the generation of executables

-  **[Node.js](https://nodejs.org/)** ® is a Platform built on Chrome's JavaScript runtime ( >= 6 )

-  **[npm](https://www.npmjs.com/)** or **[yarn](https://yarnpkg.com/lang/en/)**  Packages Manager for javascript application

   npm will be automatically installed by Node.js

#### Operating Systems : **[Install Node.js via Package](https://nodejs.org/en/download/package-manager)**

- LINUX
  - debian (Checked, Tested)
  - RASPBIAN Raspberry Pi (Checked)

- FreeBSD (Checked)
  - pkg install bash rsync gmake gcc6
  - setenv CC "/usr/local/bin/gcc"
  - setenv CXX "/usr/local/bin/g++"
  - cd /usr/local/bin/ ;ln -s pythonx.x python
  - replace make by gmake

- ~~OpenBSD (Not Checked yet )~~

- MACOS (Checked, Tested)

- ~~WINDOWS (Not ported yet )~~

- EMBEDDED SYSTEM ( Very difficult : large memory footprint )  

## <a name="install"></a>Install Framework **More Info : [ Getting Started with Nodefony ](https://nodefony.net/documentation/Beta/nodefony/started)**  

**Node.js** :

```bash
$ git clone https://github.com/nodefony/nodefony.git

$ cd nodefony

$ make build
```

## <a name="start"></a>Start Development Mode

Start the server to check:
```bash
# TO START NODEFONY IN DEVELOPMENT NODE

$ ./nodefony dev

// debug mode
$ ./nodefony -d dev
```

Access to App with URL : http://localhost:5151

[![nodefony](https://raw.githubusercontent.com/nodefony/nodefony-core/master/src/nodefony/bundles/documentationBundle/Resources/public/images/nodefony.png)](https://nodefony.net)

## <a name="configurations"></a>Configurations Kernel
Open **[./config/config.yml](https://github.com/nodefony/nodefony-core/blob/master/config/config.yml)**  if you want change httpPort, domain ,servers, add bundle, locale ...
```yml
system:
  domain                        : localhost                             # nodefony can listen only one domain ( no vhost )  /    [::1] for IPV6 only
  domainAlias:                                                          # domainAlias string only <<regexp>>   example ".*\\.nodefony\\.com  ^nodefony\\.eu$ ^.*\\.nodefony\\.eu$"
    - "^127.0.0.1$"
  httpPort                      : 5151
  httpsPort                     : 5152
  statics                       : true
  security                      : true
  realtime                      : true
  monitoring                    : true
  documentation                 : true
  unitTest                      : true
  locale                        : "en_en"

  servers:
    http                        : true
    https	                : true
    ws			        : true
    wss			        : true
    certificats:
      key                       : "config/certificates/server/privkey.pem"
      cert                      : "config/certificates/server/fullchain.pem"
      ca                        : "config/certificates/ca/nodefony-root-ca.crt.pem"
      options:
        rejectUnauthorized      : false

  bundles                       :
    demo                        : "src/bundles/demoBundle"                 
```

## <a name="cli"></a>Command Line Interface
```bash
$./nodefony -h            
 _   _    ___    ____    _____   _____    ___    _   _  __   __
| \ | |  / _ \  |  _ \  | ____| |  ___|  / _ \  | \ | | \ \ / /
|  \| | | | | | | | | | |  _|   | |_    | | | | |  \| |  \ V /
| |\  | | |_| | | |_| | | |___  |  _|   | |_| | | |\  |   | |  
|_| \_|  \___/  |____/  |_____| |_|      \___/  |_| \_|   |_|  

Version : 3.0.0-beta Platform : darwin Process : nodefony PID : 15336

Usage: nodefony [options] <cmd> [args...]

Options:

-d, --debug         Nodefony debug
-h, --help          Nodefony help
-v, --version       Nodefony version
-i, --interactive   Nodefony cli Interactive Mode

Command :

nodefony
    dev							 	 Run Nodefony Development Server  
    prod							 	 Run Nodefony Preprod Server
    pm2							 	 Run Nodefony Production Server ( PM2 mode )
    app							 	 Get Nodefony App name  
    npm:install							 Install all NPM framework packages
    npm:list							 List all NPM installed packages
framework
    generate:bundle nameBundle path                                  Generate a nodefony Bundle  Example : nodefony generate:bundle myBundle ./src/bundles
    generate:bundle:angular nameBundle path                          Generate a Angular Bundle  Example : nodefony generate:bundle:angular myBundle ./src/bundles
    generate:bundle:react nameBundle path                            Generate a React Bundle Example : nodefony generate:bundle:react myBundle ./src/bundles
    generate:controller  nameController bundlePath                   Generate a controller Example : nodefony generate:controller myController ./src/bundles/myBundle
    generate:command nameCommand path                                Generate a command js file in bundle path
    generate:service nameService path                                Generate a service js file in bundle path
    router:generate:routes                                           Generate all routes
    router:generate:route routeName                                  Generate one route Example : nodefony router:generate:route home
    router:match:url url                                             Get route who match url Example : nodefony router:match:url /nodefony
    webpack:dump                                                     Compile webpack for all bundles
security
    encoders:Digest firewall login password [realm]                  Generate encoding keys digest MD5 Example : nodefony encoders:Digest secured_area login password
sequelize
    Sequelize:fixtures:load                                          Load data fixtures to your database
    Sequelize:generate:entities [force]                              Generate All Entities force to delete table if exist  example : nodefony Sequelize:generate:entities force
    Sequelize:query:sql connectionName SQL                           query sql in database connection  example : nodefony  Sequelize:query:sql nodefony  'select * from users'
    Sequelize:entity:findAll entity                                  query findAll ENTITY
monitoring
    Monitoring:test:load URL [nbRequests] [concurence]               load test example : nodefony Monitoring:test:load http://localhost:5151/demo 10000 100
unitTest
    unitTest:list:all                                                List all unit tests
    unitTest:list:bundle bundleName                                  List all bundle unit tests
    unitTest:launch:all                                              Launch all tests Example : nodefony unitTest:launch:all
    unitTest:launch:bundle bundleName { testfile }                   Launch bundle tests Example: nodefony unitTest:launch:bundle demoBundle responseTest.js
```

## <a name="bundles"></a>Get Started
#### Generate hello Bundle :
CLI Generate new bundle :    generate:bundle nameBundle path

```bash
$ ./nodefony generate:bundle helloBundle src/bundles

Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : GENERATE bundle : helloBundle LOCATION : /Users/cci/repository/nodefony/src/bundles
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :helloBundle
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :Command
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :controller
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :defaultController.js
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :services
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :tests
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :helloBundleTest.js
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :Resources
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :config
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :config.yml
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :routing.yml
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :webpack
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :webpack.common.js
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :webpack.dev.config.js
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :webpack.prod.config.js
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :security.yml
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :public
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :js
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :hello.js
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :css
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :hello.css
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :images
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :assets
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :js
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :css
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :fonts
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :images
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :translations
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :views
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :index.html.twig
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :doc
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :1.0
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :readme.md
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create symbolic link :Default
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :core
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create Directory :Entity
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :helloBundle.js
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create symbolic link :readme.md
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : Create File      :package.json
Wed Jul 19 2017 15:22:12 INFO SERVICE CLI KERNEL  : INSTALL ASSETS LINK IN WEB PUBLIC DIRECTORY  : /Users/cci/repository/nodefony-core/web/
┌─────────┬───────────────────┬────────────────────────────────────────────┬───────────┬────────────────┐
│ BUNDLES │ DESTINATION PATH  │ SOURCE PATH                                │ SIZE      │ ASSETS COMPILE │
├─────────┼───────────────────┼────────────────────────────────────────────┼───────────┼────────────────┤
│ hello   │ ./web/helloBundle │ ./src/bundles/helloBundle/Resources/public │ 483 bytes │ 0 bytes        │
└─────────┴───────────────────┴────────────────────────────────────────────┴───────────┴────────────────┘
Wed Jul 19 2017 15:22:12 INFO CONSOLE   : NODEFONY Kernel Life Cycle Terminate CODE : 0
```
### Start Servers to check new Bundle hello:
```bash
$ ./nodefony -d dev

# TO STOP
$ <ctrl-c>
```

#### Now helleBundle is auto-insert in framework with watcher active and auto-config Webpack Module bundler

### watchers :

#### The bundle generation engine build bundle config with  node.js watcher configuration

#### In developement mode  is very usefull to auto-reload files as controllers , views , routing , translations

#### without having to reboot the server.

You can see helloBundle config   : vim  ./src/bundles/helloBundle/Resources/config/config.yml
```yml
########## nodefony CONFIG BUNDLE  helloBundle  ############
name :                          helloBundle
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
#        config:        true		# only  routing.yml
#        views:         true
#        translations:  true
#        webpack:       true
#
watch:                          true
```
### Webpack Module bundler :

#### The bundle generation engine build bundle config with a predefined webpack configuration

#### In this way webpack is very usefull to manage all assets of bundle

#### In developement mode watch  is very usefull to auto-compile webpack module bundle

#### without having to reboot the server

You can see helloBundle config webpack : vim  ./src/bundles/helloBundle/Resources/config/webpack/webpack-dev.config.js
```js
const path = require("path");
const webpack = require('webpack');
const ExtractTextPluginCss = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const public = path.resolve(__dirname, "..", ".." ,"public");
const commonConfig = require("./webpack.common.js");
const webpackDevClient = "webpack-dev-server/client?https://"+kernel.hostHttps+"/";

module.exports = webpackMerge( {
    entry       : {
      hello  : [ "./js/hello.js" ],
    },
    output      : {
      path      : public,
      filename  : "./assets/js/[name].js",
      library   : "[name]",
      libraryTarget: "umd"
    },
    devtool     : "source-map",
    externals   : {},
    resolve     : {},
    plugins     : []
}, commonConfig );
```

### <a name="start_prod"></a>Start Production Mode
```
# TO START NODEFONY IN CLUSTER NODE PM2
$ make start

# TO KILL PM2 DEAMON
$ make kill

# TO STOP APPLICATION WITHOUT KILL PM2 DEAMON
$ make stop
```
You can see PM2 config : vim  ./config/pm2.config.js

Access to bundle route with URL : http://localhost:5151/hello

## <a name="https"></a>Nodefony HTTPS Access
By default nodefony listen secure port in 5152

During the installation process all the openssl parts were generated ( self-signed localhost certificate ).

You must Add a Trusted CA in your browser : nodefony-root-ca.crt.pem

You can find certificate authority (ca) here:

```
./config/certificates/ca/nodefony-root-ca.crt.pem

```
Access  with URL : https://localhost:5152/hello

## <a name="monitoring"></a>Monitoring FRAMEWORK

Access to monitoring route with URL : http://localhost:5151/nodefony

[![MONITORING](https://raw.githubusercontent.com/nodefony/nodefony-core/master/doc/default/cluster.png)](https://nodefony.net/nodefony)

Monitoring in progress !!!

## <a name="references--thanks"></a>References / Thanks
#### NPM : *Will be automatically installed by Makefile*

```

```

**Big thanks:**


**Related Links:**
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Framework Symfony](http://symfony.com/)
- [Twig.js](https://github.com/justjohn/twig.js/wiki)
- [PM2](https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md)
- [WEBPACK](https://webpack.js.org/)

More informations  **[Nodefony Documentation](https://nodefony.net/documentation/default/nodefony)**

## <a name="authors"></a>Authors

- Christophe CAMENSULI  [github/ccamensuli](https://github.com/ccamensuli)

##  <a name="license"></a>License

[CeCILL-B](https://github.com/nodefony/nodefony/blob/master/LICENSE)

##  <a name="demo"></a>Demo

[Demo](https://nodefony.net)
