<p align="center">
  <img src="https://github.com/nodefony/nodefony/raw/master/src/nodefony/bundles/framework-bundle/Resources/public/images/nodefony-logo.png"><br>
</p>
<h1 align="center">NODEFONY V6 Micro Service</h1>

<h2 align="center">Tools Chain <h2>

## Table of content
-   [Features](#features)
-   [Requirements](#requirements)
-   [Linux OSX Installation](#install)
-   [Build CLient Library](#build)
-   [Test Library](#test)
-   [Command Line Interface](#cli)
-   [Library Webpack Usage](#webpack)

## <a name="features"></a>Tools Chain features :
  -   ES6 transpilation (webpack / Babel)
  -   CLI (Command Line Interface)
  -   Unit Tests with Mocha

# <a name="requirements"></a>Requirements :

#### On your system _you must have Installed_ :

-   **[GIT](http://git-scm.com/)**  is Distributed version control system

-   **[Node.js](https://nodejs.org/)** ® is a Platform built on Chrome's JavaScript runtime ( >= 10 )

-   **[npm](https://www.npmjs.com/)** or **[yarn](https://yarnpkg.com/lang/en/)**  Packages Manager for javascript application

**[NVM](https://github.com/creationix/nvm) Installation (Node Version Manager )** :
-   [NVM](https://github.com/creationix/nvm) Node Version Manager - Simple bash script to manage multiple active node.js versions

  To install or update nvm, you can use the install script:
```sh
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
# or
$ wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

$ source ~/.bashrc # or source ~/.bash_profile
$ nvm ls-remote # show all remote versions  
$ nvm ls # show local versions
```

**[Node.js](https://nodejs.org/) Installation with [NVM](https://github.com/creationix/nvm)** :
```sh
nvm install node # "node" is an alias for the latest version
```

# <a name="install"></a> install :
```sh

$ npm install

```


## <a name="build"></a>Tools Chain Build :


## <a name="Use"></a> Use Micro Service :

```bash


```

OR YOU CAN USE CLI INTERACTIVE MODE
```bash
$ npm start

? CLI (Use arrow keys)
❯ Build
Start
Development
Production
Pm2
Test
Quit
```

- you can change settings in config/config.js

## <a name="production"></a> Run Production  (daemonized) :
```
$ npm run prod

```

**Starting Development Servers in Inspector mode (--inspect)** :

[Nodejs Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started)
```bash
$ npm -g install npx

$ npx --node-arg=--inspect npm run dev

# check chrome://inspect in your browser
```


## <a name="tools"></a> Tools Prodution Mode
```
# Monitoring (Memory, Process, Logs ...):
$ npm run  monit

# Kill  :
$ npm run kill

# stop  :
$ npm run  stop

# logs
$ npm run log

```
