<template><div><p align="center">
  <img src="https://github.com/nodefony/nodefony/raw/master/src/nodefony/bundles/framework-bundle/Resources/public/images/nodefony-logo.png"><br>
</p>
<h1 align="center">NODEFONY V7</h1>
<p><a href="https://nodei.co/npm/nodefony" target="_blank" rel="noopener noreferrer"><img src="https://nodei.co/npm/nodefony.png?downloads=true&amp;downloadRank=true&amp;stars=true" alt="npm package" loading="lazy"><ExternalLinkIcon/></a></p>
<p><a href="https://github.com/nodefony/nodefony/issues" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/github/issues/nodefony/nodefony.svg" alt="Issues Status" loading="lazy"><ExternalLinkIcon/></a> <a href="https://github.com/nodefony/nodefony/actions" target="_blank" rel="noopener noreferrer"><img src="https://github.com/nodefony/nodefony/workflows/nodefony/badge.svg" alt="Build Status" loading="lazy"><ExternalLinkIcon/></a> <a href="https://bestpractices.coreinfrastructure.org/projects/495" target="_blank" rel="noopener noreferrer"><img src="https://bestpractices.coreinfrastructure.org/projects/495/badge" alt="CII Best Practices" loading="lazy"><ExternalLinkIcon/></a></p>
<p>Nodefony is Node.js full-stack web framework.</p>
<p>Nodefony can be used to develop a complete solution to create a Fullstack Web Application, Secure Api, or Microservices.</p>
<h2 id="table-of-content" tabindex="-1"><a class="header-anchor" href="#table-of-content" aria-hidden="true">#</a> Table of content</h2>
<ul>
<li><a href="#features">Features</a></li>
<li><a href="#requirements">Requirements</a></li>
<li><a href="#install">Linux OSX Installation</a></li>
<li><a href="#installwin32">Windows Installation </a></li>
<li><a href="#buildcli">Build Nodefony Project with CLI (Command Line Interface)</a></li>
<li><a href="#buildstarter">Build Nodefony Project with STARTER</a></li>
<li><a href="#start">Start Development Mode</a></li>
<li><a href="#start_prod">Start Production Mode</a></li>
<li><a href="#configurations">Configurations</a></li>
<li><a href="#bundles">Quick Start</a></li>
<li><a href="#https">HTTPS Access</a></li>
<li><a href="#references--thanks">References / Thanks</a></li>
<li><a href="#authors">Authors</a></li>
<li><a href="#license">License</a></li>
<li><a href="#demo">Demo</a></li>
</ul>
<h2 id="nodefony-features" tabindex="-1"><a class="header-anchor" href="#nodefony-features" aria-hidden="true">#</a> <a name="features"></a>Nodefony features :</h2>
<ul>
<li>Servers  (<a href="https://nodejs.org/dist/latest-v8.x/docs/api/https.html" target="_blank" rel="noopener noreferrer">http(s)<ExternalLinkIcon/></a>, <a href="https://github.com/theturtle32/WebSocket-Node" target="_blank" rel="noopener noreferrer">websocket(s)<ExternalLinkIcon/></a>, statics, sockjs)</li>
<li><a href="https://nodejs.org/api/http2.html" target="_blank" rel="noopener noreferrer">HTTP2<ExternalLinkIcon/></a> ready node module provides an implementation of the HTTP/2 (push server ready).</li>
<li>Dynamics routing</li>
<li>ORM <a href="http://docs.sequelizejs.com" target="_blank" rel="noopener noreferrer">Sequelize<ExternalLinkIcon/></a></li>
<li>ORM <a href="http://mongoosejs.com/index.html" target="_blank" rel="noopener noreferrer">mongoose<ExternalLinkIcon/></a></li>
<li>Simple Databases Services connections (Redis, Mongo, Elasticsearch, mysql, sqlite ...).</li>
<li>MVC Templating Server Side (<a href="https://github.com/twigjs/twig.js" target="_blank" rel="noopener noreferrer">Twig<ExternalLinkIcon/></a>)</li>
<li>Notion of real-time context in Action Controller (websocket).</li>
<li>Notion of synchronous or asynchronous execution in Action Controller (Promise, Async, Await).</li>
<li>Services Containers, Dependency Injection (Design Patterns)</li>
<li>Sessions Manager (ORM, Memcached)</li>
<li>Authentication Manager (Digest, Basic, oAuth, Local, ldap, jwt, openid, passportjs)</li>
<li>WAF ( Web application firewall )</li>
<li>Cross-Origin Resource Sharing (<a href="https://www.w3.org/TR/cors/" target="_blank" rel="noopener noreferrer">CORS<ExternalLinkIcon/></a>)</li>
<li>Production Management (<a href="https://github.com/Unitech/pm2/" target="_blank" rel="noopener noreferrer">PM2<ExternalLinkIcon/></a>)</li>
<li>RealTime API (<a href="http://autogrowsystems.github.io/faye-go/" target="_blank" rel="noopener noreferrer">Bayeux Protocol<ExternalLinkIcon/></a>)</li>
<li>Webpack Assets management (Like WDS with HMR hot module Replacement)</li>
<li>C++ Addons (Binding in Bundle)</li>
<li>Translations</li>
<li>CLI (Command Line Interface)</li>
<li>Monitororing , Debug Bar</li>
<li>Unit Test Api in framework context (<a href="https://mochajs.org/" target="_blank" rel="noopener noreferrer">MOCHA<ExternalLinkIcon/></a>)</li>
</ul>
<p><strong>Nodefony assimilates into the ecosystem of node.js with services like</strong> :</p>
<ul>
<li><a href="https://webpack.js.org/" target="_blank" rel="noopener noreferrer">WEBPACK<ExternalLinkIcon/></a> Module bundler for assets management of application .</li>
<li><a href="https://github.com/sockjs" target="_blank" rel="noopener noreferrer">SockJS<ExternalLinkIcon/></a> Server ( Like WDS 'Webpack Dev Server' and HMR management )</li>
<li><a href="https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener" target="_blank" rel="noopener noreferrer">WATCHER<ExternalLinkIcon/></a> node.js for auto reload-files in developement mode .</li>
<li><a href="http://pm2.keymetrics.io/" target="_blank" rel="noopener noreferrer">PM2<ExternalLinkIcon/></a> Production Process Manager for Node.js .</li>
<li><a href="http://passportjs.org/" target="_blank" rel="noopener noreferrer">Passport<ExternalLinkIcon/></a> Simple, unobtrusive authentication for Node.js .</li>
<li><s><a href="https://github.com/angular/angular-cli" target="_blank" rel="noopener noreferrer">Angular<ExternalLinkIcon/></a> Experimental Bundle Generator ( Angular cli no longer allows the ejection of a webpack config)</s></li>
</ul>
<p><strong>Nodefony 7  adds the following features</strong> :</p>
<ul>
<li><a href="https://github.com/facebookincubator/create-react-app" target="_blank" rel="noopener noreferrer">React<ExternalLinkIcon/></a> Experimental Bundle Generator ( Now an React Project can be merge into a Nodefony Bundle )</li>
<li><a href="https://vuejs.org" target="_blank" rel="noopener noreferrer">Vue.js<ExternalLinkIcon/></a> Experimental Bundle Generator ( Now an Vue.js Project can be merge into a Nodefony Bundle )</li>
<li><a href="https://swagger.io/" target="_blank" rel="noopener noreferrer">Api swagger-ui<ExternalLinkIcon/></a> ( Documentation Api with swagger and openapi AOS3)</li>
<li><a href="https://graphql.org/" target="_blank" rel="noopener noreferrer">Api graphql<ExternalLinkIcon/></a> ( Documentation Api with graphiql)</li>
</ul>
<p>Evolution priorities for the next version will focus on robustness, unit testing, documentation and security.</p>
<p>You can follow Nodefony build with github actions at <strong><a href="https://github.com/nodefony/nodefony/actions" target="_blank" rel="noopener noreferrer">https://github.com/nodefony/nodefony/actions<ExternalLinkIcon/></a></strong></p>
<h2 id="nodefony-implement-modules-with-commonjs-and-ecmascript-6-class-inheritance" tabindex="-1"><a class="header-anchor" href="#nodefony-implement-modules-with-commonjs-and-ecmascript-6-class-inheritance" aria-hidden="true">#</a> Nodefony implement modules with CommonJS and ECMAScript 6 ( Class, Inheritance ).</h2>
<p>The development framework will not be ported to typescript, but will wait for the version with type syntax in Emacsript</p>
<p><strong><a href="https://github.com/tc39/proposal-type-annotations" target="_blank" rel="noopener noreferrer">proposal-type-annotations<ExternalLinkIcon/></a></strong></p>
<h2 id="resources-for-newcomers" tabindex="-1"><a class="header-anchor" href="#resources-for-newcomers" aria-hidden="true">#</a> <strong>Resources for Newcomers</strong></h2>
<h4 id="nodefony-starter-demo" tabindex="-1"><a class="header-anchor" href="#nodefony-starter-demo" aria-hidden="true">#</a> -  <strong><a href="https://nodefony.net" target="_blank" rel="noopener noreferrer">Nodefony Starter Demo<ExternalLinkIcon/></a></strong></h4>
<h4 id="nodefony-core" tabindex="-1"><a class="header-anchor" href="#nodefony-core" aria-hidden="true">#</a> -  <strong><a href="https://github.com/nodefony/nodefony" target="_blank" rel="noopener noreferrer">Nodefony CORE<ExternalLinkIcon/></a></strong></h4>
<h4 id="nodefony-documentation" tabindex="-1"><a class="header-anchor" href="#nodefony-documentation" aria-hidden="true">#</a> -  <strong><a href="https://nodefony.net/documentation/nodefony" target="_blank" rel="noopener noreferrer">Nodefony Documentation<ExternalLinkIcon/></a></strong></h4>
<h4 id="documentation-in-progress" tabindex="-1"><a class="header-anchor" href="#documentation-in-progress" aria-hidden="true">#</a> Documentation in progress !!</h4>
<h2 id="requirements" tabindex="-1"><a class="header-anchor" href="#requirements" aria-hidden="true">#</a> <a name="requirements"></a>Requirements</h2>
<h4 id="on-your-system-you-must-have-installed" tabindex="-1"><a class="header-anchor" href="#on-your-system-you-must-have-installed" aria-hidden="true">#</a> On your system <em>you must have Installed</em> :</h4>
<ul>
<li>
<p><strong><a href="http://git-scm.com/" target="_blank" rel="noopener noreferrer">GIT<ExternalLinkIcon/></a></strong>  is Distributed version control system</p>
</li>
<li>
<p><strong><a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js<ExternalLinkIcon/></a></strong> ® is a Platform built on Chrome's JavaScript runtime ( &gt;= 8 )</p>
</li>
<li>
<p><strong><a href="https://www.npmjs.com/" target="_blank" rel="noopener noreferrer">npm<ExternalLinkIcon/></a></strong> or <strong><a href="https://yarnpkg.com/lang/en/" target="_blank" rel="noopener noreferrer">yarn<ExternalLinkIcon/></a></strong> or <strong><a href="https://pnpm.io/cli/install" target="_blank" rel="noopener noreferrer">pnpm<ExternalLinkIcon/></a></strong>  Packages Manager for javascript application</p>
</li>
<li>
<p><strong><a href="https://github.com/nvm-sh/nvm/" target="_blank" rel="noopener noreferrer">nvm<ExternalLinkIcon/></a></strong>  Node Version Manager - POSIX-compliant bash script to manage multiple active node.js versions</p>
</li>
<li>
<p><strong><a href="https://www.openssl.org/" target="_blank" rel="noopener noreferrer">OpenSSL<ExternalLinkIcon/></a></strong> Toolkit for the Transport Layer Security (TLS) and Secure Sockets Layer (SSL) protocols</p>
</li>
<li>
<p><strong><a href="https://www.gnu.org/software/bash/" target="_blank" rel="noopener noreferrer">GNU Bash<ExternalLinkIcon/></a></strong> Bash is the GNU Project's shell</p>
</li>
</ul>
<h4 id="operating-systems" tabindex="-1"><a class="header-anchor" href="#operating-systems" aria-hidden="true">#</a> Operating Systems :</h4>
<ul>
<li>
<p>LINUX</p>
<ul>
<li>Debian, Ubuntu (Checked, Tested)</li>
<li>RASPBIAN Raspberry Pi (Checked)</li>
</ul>
</li>
<li>
<p>MACOS (Checked, Tested)</p>
</li>
<li>
<p>WINDOWS (Checked)</p>
</li>
<li>
<p>FreeBSD (Checked)</p>
<ul>
<li>pkg install bash gmake gcc6</li>
<li>setenv CC &quot;/usr/local/bin/gcc&quot;</li>
<li>setenv CXX &quot;/usr/local/bin/g++&quot;</li>
<li>cd /usr/local/bin/ ;ln -s pythonx.x python</li>
</ul>
</li>
<li>
<p><s>OpenBSD (Not Checked yet )</s></p>
</li>
<li>
<p><s><a href="https://github.com/nodefony/nodefony-electron" target="_blank" rel="noopener noreferrer">ELECTRON<ExternalLinkIcon/></a> Experimental Nodefony Electron  ( Now an Electron Context can be use in Nodefony Project )</s></p>
</li>
<li>
<p>EMBEDDED SYSTEM ( Very difficult : large memory footprint )</p>
</li>
</ul>
<h2 id="linux-or-osx-installation-recommanded" tabindex="-1"><a class="header-anchor" href="#linux-or-osx-installation-recommanded" aria-hidden="true">#</a> <a name="install"></a> Linux or OSX Installation (Recommanded)</h2>
<p><strong><a href="https://github.com/nvm-sh/nvm#installation-and-update" target="_blank" rel="noopener noreferrer">NVM<ExternalLinkIcon/></a> Installation (Node Version Manager )</strong> :</p>
<ul>
<li><a href="https://github.com/creationix/nvm" target="_blank" rel="noopener noreferrer">NVM<ExternalLinkIcon/></a> Node Version Manager - Simple bash script to manage multiple active node.js versions</li>
</ul>
<p>To install or update nvm, you can use the install script:</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">curl</span> -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh <span class="token operator">|</span> <span class="token function">bash</span>
<span class="token comment"># or</span>
<span class="token function">wget</span> -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh <span class="token operator">|</span> <span class="token function">bash</span>

$ <span class="token builtin class-name">source</span> ~/.bashrc <span class="token comment"># or source ~/.bash_profile</span>
$ nvm ls-remote <span class="token comment"># show all remote versions  </span>
$ nvm <span class="token function">ls</span> <span class="token comment"># show local versions</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong><a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js<ExternalLinkIcon/></a> Installation with <a href="https://github.com/creationix/nvm" target="_blank" rel="noopener noreferrer">NVM<ExternalLinkIcon/></a></strong> :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>nvm <span class="token function">install</span> <span class="token function">node</span> <span class="token comment"># "node" is an alias for the latest version</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong><a href="https://nodefony.net" target="_blank" rel="noopener noreferrer">Nodefony<ExternalLinkIcon/></a> Excutable Installation (Globally)</strong> :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">npm</span> <span class="token parameter variable">-g</span> <span class="token function">install</span> nodefony

<span class="token comment"># or with yarn</span>

<span class="token function">yarn</span> global <span class="token function">add</span> nodefony
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Error that you can usually find</strong> :</p>
<ul>
<li>EACCES error  <a href="https://docs.npmjs.com/getting-started/fixing-npm-permissions" target="_blank" rel="noopener noreferrer">See Global install How to Prevent Permissions Errors<ExternalLinkIcon/></a> (Reinstall npm with a Node Version Manager)</li>
<li>Different Node.js version (NODE_MODULE_VERSION XX) use 'nodefony rebuild'</li>
</ul>
<h2 id="windows-installation" tabindex="-1"><a class="header-anchor" href="#windows-installation" aria-hidden="true">#</a> <a name="installwin32"></a> Windows Installation</h2>
<p><strong><a href="https://nodejs.org/en/" target="_blank" rel="noopener noreferrer">Node.js<ExternalLinkIcon/></a> Installation</strong> :
<a href="https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows" target="_blank" rel="noopener noreferrer">nvm-windows<ExternalLinkIcon/></a>
to easily switch Node versions between different projects.
or To install or update Node.js, you can download installer here <a href="https://nodejs.org/en/" target="_blank" rel="noopener noreferrer">Node.js<ExternalLinkIcon/></a></p>
<p><strong><a href="https://nodefony.net" target="_blank" rel="noopener noreferrer">Nodefony<ExternalLinkIcon/></a>  Installation</strong> :</p>
<p>Launch a CMD terminal</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">npm</span> <span class="token parameter variable">-g</span> <span class="token function">install</span> nodefony

<span class="token comment"># or with yarn</span>

<span class="token function">yarn</span> global <span class="token function">add</span> nodefony
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Add NPM global bin in $Path windows</strong> :</p>
<p>On the Windows System Property Menu, configure <em>Path</em> environment variable by adding :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>C:<span class="token punctuation">\</span>Users<span class="token punctuation">\</span>myuser<span class="token punctuation">\</span>AppData<span class="token punctuation">\</span>Roaming<span class="token punctuation">\</span>npm
or
C:<span class="token punctuation">\</span>Users<span class="token punctuation">\</span>myuser<span class="token punctuation">\</span>AppData<span class="token punctuation">\</span>Roaming<span class="token punctuation">\</span>npm<span class="token punctuation">\</span>bin
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="use-nodefony-cli" tabindex="-1"><a class="header-anchor" href="#use-nodefony-cli" aria-hidden="true">#</a> <a name="usecli"></a> Use nodefony cli:</h2>
<p><strong>Cli command when use Global installation</strong></p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ nodefony <span class="token parameter variable">-v</span>
<span class="token number">7.0</span>.0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Cli command when By using yarn or npm in trunk</strong></p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token comment">#Or by using yarn</span>
<span class="token function">yarn</span> run nodefony

<span class="token comment">#Or by using npm</span>
<span class="token function">npm</span> run nodefony
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>By using npx</strong>
<em><strong>note: npx is included with npm &gt; v5.2 or can be installed separately.</strong></em></p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>npx nodefony
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>The long way with the full path</strong></p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>./node_modules/.bin/nodefony
<span class="token comment">#Or with the shortcut using npm bin</span>
<span class="token variable"><span class="token variable">$(</span><span class="token function">npm</span> bin<span class="token variable">)</span></span>/nodefony
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="build-project-with-nodefony-cli-recommended" tabindex="-1"><a class="header-anchor" href="#build-project-with-nodefony-cli-recommended" aria-hidden="true">#</a> <a name="buildcli"></a> Build Project with nodefony cli (recommended):</h2>
<p><strong>Cli Usage INTERACTIVE MODE</strong> :</p>
<p>YOU CAN USE CLI INTERACTIVE MODE (nodefony without args) :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ nodefony

?  Nodefony CLI <span class="token builtin class-name">:</span>  <span class="token punctuation">(</span>Use arrow keys<span class="token punctuation">)</span>
❯ Create Nodefony Web Project
Create Micro Service Project
PM2 Tools
--------
Help
Quit
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Cli Usage NO INTERRATIVE</strong> :</p>
<p>YOU CAN USE CLI NO INTERACTIVE (nodefony with args) :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token comment">#  CLI generate project name : myproject</span>

$ npx nodefony create myproject
$ <span class="token builtin class-name">cd</span> myproject
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Cli Help</strong> :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ npx nodefony <span class="token parameter variable">-h</span>

nodefony                                                                                              
    create <span class="token punctuation">[</span>-i<span class="token punctuation">]</span> name <span class="token punctuation">[</span>path<span class="token punctuation">]</span>                       Create New Nodefony Project                  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="build-project-with-github-starter" tabindex="-1"><a class="header-anchor" href="#build-project-with-github-starter" aria-hidden="true">#</a> <a name="buildstarter"></a> Build Project with Github Starter :</h2>
<p><strong>CLI</strong> :</p>
<p>Clone nodefony starter</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ <span class="token function">git</span> clone https://github.com/nodefony/nodefony-starter.git
$ <span class="token builtin class-name">cd</span> nodefony
$ npx nodefony build
  <span class="token punctuation">..</span>.
  <span class="token punctuation">..</span>.
$ <span class="token function">npm</span> start
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>CLI INTERATIVE</strong> :</p>
<p>YOU CAN USE CLI INTERACTIVE MODE TO BUILD PROJECT (nodefony without args)</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ <span class="token function">git</span> clone https://github.com/nodefony/nodefony-starter.git
$ <span class="token builtin class-name">cd</span> nodefony
$ <span class="token function">ls</span> <span class="token parameter variable">-l</span>
-rw-r--r--     <span class="token number">1</span> cci  staff   <span class="token number">21306</span> <span class="token number">27</span> mar <span class="token number">19</span>:22 README.md
drwxr-xr-x    <span class="token number">12</span> cci  staff     <span class="token number">384</span> <span class="token number">27</span> mar <span class="token number">19</span>:25 app
drwxr-xr-x     <span class="token number">3</span> cci  staff      <span class="token number">96</span> <span class="token number">27</span> mar <span class="token number">19</span>:22 bin
drwxr-xr-x     <span class="token number">7</span> cci  staff     <span class="token number">224</span> <span class="token number">27</span> mar <span class="token number">19</span>:26 config
drwxr-xr-x     <span class="token number">3</span> cci  staff      <span class="token number">96</span> <span class="token number">27</span> mar <span class="token number">19</span>:22 doc
drwxr-xr-x  <span class="token number">1342</span> cci  staff   <span class="token number">42944</span> <span class="token number">27</span> mar <span class="token number">19</span>:24 node_modules
-rw-r--r--     <span class="token number">1</span> cci  staff     <span class="token number">997</span> <span class="token number">27</span> mar <span class="token number">19</span>:22 package.json
drwxr-xr-x     <span class="token number">3</span> cci  staff      <span class="token number">96</span> <span class="token number">27</span> mar <span class="token number">19</span>:22 src
drwxr-xr-x     <span class="token number">4</span> cci  staff     <span class="token number">128</span> <span class="token number">29</span> mar <span class="token number">11</span>:13 tmp
drwxr-xr-x    <span class="token number">12</span> cci  staff     <span class="token number">384</span> <span class="token number">29</span> mar <span class="token number">11</span>:01 web
-rw-r--r--     <span class="token number">1</span> cci  staff  <span class="token number">542660</span> <span class="token number">27</span> mar <span class="token number">19</span>:24 yarn.lock

$ npx nodefony

?  Nodefony CLI <span class="token builtin class-name">:</span>  <span class="token punctuation">(</span>Use arrow keys<span class="token punctuation">)</span>
❯ Build Project
 Generater
 Tools
 PM2 Tools
 --------
 Help
 Quit
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="serving-a-nodefony-project-via-an-development-server" tabindex="-1"><a class="header-anchor" href="#serving-a-nodefony-project-via-an-development-server" aria-hidden="true">#</a> <a name="start"></a>Serving a Nodefony project via an development server</h2>
<p><strong>Starting Development Servers</strong> :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ npx nodefony dev

<span class="token comment"># TO STOP</span>
$ <span class="token operator">&lt;</span>ctrl-c<span class="token operator">></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Starting Development Servers in Debug Mode (-d)</strong> :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ npx nodefony <span class="token parameter variable">-d</span> dev

<span class="token comment"># TO STOP</span>
$ <span class="token operator">&lt;</span>ctrl-c<span class="token operator">></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>OR YOU CAN USE CLI INTERACTIVE MODE (nodefony without args)</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code> _   _    ___    ____    _____   _____    ___    _   _  __   __
<span class="token operator">|</span> <span class="token punctuation">\</span> <span class="token operator">|</span> <span class="token operator">|</span>  / _ <span class="token punctuation">\</span>  <span class="token operator">|</span>  _ <span class="token punctuation">\</span>  <span class="token operator">|</span> ____<span class="token operator">|</span> <span class="token operator">|</span>  ___<span class="token operator">|</span>  / _ <span class="token punctuation">\</span>  <span class="token operator">|</span> <span class="token punctuation">\</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token punctuation">\</span> <span class="token punctuation">\</span> / /
<span class="token operator">|</span>  <span class="token punctuation">\</span><span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span>  _<span class="token operator">|</span>   <span class="token operator">|</span> <span class="token operator">|</span>_    <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span>  <span class="token punctuation">\</span><span class="token operator">|</span> <span class="token operator">|</span>  <span class="token punctuation">\</span> V /
<span class="token operator">|</span> <span class="token operator">|</span><span class="token punctuation">\</span>  <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span>_<span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span>_<span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span>___  <span class="token operator">|</span>  _<span class="token operator">|</span>   <span class="token operator">|</span> <span class="token operator">|</span>_<span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span> <span class="token operator">|</span><span class="token punctuation">\</span>  <span class="token operator">|</span>   <span class="token operator">|</span> <span class="token operator">|</span>  
<span class="token operator">|</span>_<span class="token operator">|</span> <span class="token punctuation">\</span>_<span class="token operator">|</span>  <span class="token punctuation">\</span>___/  <span class="token operator">|</span>____/  <span class="token operator">|</span>_____<span class="token operator">|</span> <span class="token operator">|</span>_<span class="token operator">|</span>      <span class="token punctuation">\</span>___/  <span class="token operator">|</span>_<span class="token operator">|</span> <span class="token punctuation">\</span>_<span class="token operator">|</span>   <span class="token operator">|</span>_<span class="token operator">|</span>  

Version <span class="token builtin class-name">:</span> <span class="token number">4.0</span>.0 Platform <span class="token builtin class-name">:</span> linux  Process <span class="token builtin class-name">:</span> nodefony PID <span class="token builtin class-name">:</span> <span class="token number">31635</span>

Fri Jul <span class="token number">27</span> <span class="token number">2018</span> <span class="token number">17</span>:01:11 INFO nodefony <span class="token builtin class-name">:</span> WELCOME PROJECT <span class="token builtin class-name">:</span> myproject <span class="token number">1.0</span>.0

?  Nodefony CLI <span class="token builtin class-name">:</span>  
❯ Start Servers Development
  Start Servers Pre-Production
  Start Servers Production
  Install Project
  Rebuild Project
  Generater
  Tools
  PM2 Tools
  Run Test
  --------
  Help
  Quit
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Starting Development Servers in Inspector mode (--inspect)</strong> :</p>
<p><a href="https://nodejs.org/en/docs/guides/debugging-getting-started" target="_blank" rel="noopener noreferrer">Nodejs Debugging Guide<ExternalLinkIcon/></a></p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ <span class="token function">npm</span> <span class="token parameter variable">-g</span> <span class="token function">install</span> npx

$ npx --node-arg<span class="token operator">=</span>--inspect nodefony dev
// new version npx <span class="token operator">></span> <span class="token number">7</span>
$ npx --node-options<span class="token operator">=</span>--inspect nodefony dev

<span class="token comment"># check chrome://inspect in your browser</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="serving-a-nodefony-project-via-a-production-server" tabindex="-1"><a class="header-anchor" href="#serving-a-nodefony-project-via-a-production-server" aria-hidden="true">#</a> <a name="start_prod"></a>Serving a Nodefony Project via a Production server :</h2>
<p><strong>Starting a Nodefony project with <a href="http://pm2.keymetrics.io/" target="_blank" rel="noopener noreferrer">PM2<ExternalLinkIcon/></a></strong> :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ npx nodefony prod
or
$ npx nodefony start
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Tools PM2 You can see PM2 config : config/pm2.config.js</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token comment"># To See log</span>
$ npx nodefony logs

<span class="token comment"># To List Status of Production projects</span>
$ npx nodefony list

<span class="token comment"># TO KILL PM2 DEAMON</span>
$ npx nodefony <span class="token function">kill</span>

<span class="token comment"># TO STOP APPLICATION WITHOUT KILL PM2 DEAMON</span>
$ npx nodefony stop

<span class="token comment"># YOU can use all pm2 command by using</span>
$ <span class="token function">yarn</span> pm2 monit
$ <span class="token function">yarn</span> pm2 <span class="token punctuation">[</span>list<span class="token operator">|</span><span class="token function">ls</span><span class="token operator">|</span>status<span class="token punctuation">]</span>
$ <span class="token function">yarn</span> pm2 stop all
or
$ <span class="token function">npm</span> run pm2 logs <span class="token parameter variable">--lines</span> <span class="token number">200</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Checking a Nodefony Project Pre-Production (Usefull to check Clusters Node)</strong> :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ npx nodefony preprod
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="serving-a-nodefony-project-with-https-or-wss" tabindex="-1"><a class="header-anchor" href="#serving-a-nodefony-project-with-https-or-wss" aria-hidden="true">#</a> <a name="https"></a>Serving a Nodefony project with HTTPS or WSS</h2>
<p>By default nodefony listen secure port in 5152 @see config/config.js</p>
<p>During the installation process all the openssl parts were generated ( self-signed localhost certificate ).</p>
<p>You can Change default openssl configuration in :</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">ls</span> <span class="token parameter variable">-l</span> config/openssl

├── ca
│   └── openssl.cnf
└── ca_intermediate
    └── openssl.cnf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>You must Add a Trusted CA in your Browser : projectName-root-ca.crt.pem
You can find certificate authority (ca) here:</p>
<pre><code>config/certificates/ca/projectName-root-ca.crt.pem
</code></pre>
<h4 id="access-to-secure-app-with-url-https-localhost-5152" tabindex="-1"><a class="header-anchor" href="#access-to-secure-app-with-url-https-localhost-5152" aria-hidden="true">#</a> Access to Secure App with URL : <a href="https://localhost:5152" target="_blank" rel="noopener noreferrer">https://localhost:5152<ExternalLinkIcon/></a></h4>
<h4 id="access-to-app-with-url-http-localhost-5151" tabindex="-1"><a class="header-anchor" href="#access-to-app-with-url-http-localhost-5151" aria-hidden="true">#</a> Access to App with URL : <a href="http://localhost:5151" target="_blank" rel="noopener noreferrer">http://localhost:5151<ExternalLinkIcon/></a></h4>
<p><a href="https://nodefony.net" target="_blank" rel="noopener noreferrer"><img src="https://raw.githubusercontent.com/nodefony/nodefony/master/src/nodefony/bundles/monitoring-bundle/Resources/public/images/nodefony.png" alt="nodefony" loading="lazy"><ExternalLinkIcon/></a></p>
<h2 id="framework-configurations" tabindex="-1"><a class="header-anchor" href="#framework-configurations" aria-hidden="true">#</a> <a name="configurations"></a>Framework Configurations</h2>
<p>Open <strong><a href="https://github.com/nodefony/nodefony/blob/master/config/config.js" target="_blank" rel="noopener noreferrer">config/config.js<ExternalLinkIcon/></a></strong>  if you want change httpPort, domain ,servers, add bundle, locale ...</p>
<div class="language-javascript line-numbers-mode" data-ext="js"><pre v-pre class="language-javascript"><code><span class="token doc-comment comment">/**
 *  NODEFONY FRAMEWORK
 *
 *       KERNEL CONFIG
 *
 *   Domain listen : Nodefony can listen only one domain ( no vhost )
 *     Example :
 *      domain :  0.0.0.0      // for all interfaces
 *      domain :  [::1]        // for IPV6 only
 *      domain :  192.168.1.1  // IPV4
 *      domain :  mydomain.com // DNS
 *
 *   Domain Alias : string only "&lt;&lt;regexp>>" use domainCheck : true
 *     Example :
 *      domainAlias:[
 *        "^127.0.0.1$",
 *        "^localhost$",
 *        ".*\\.nodefony\\.com",
 *        "^nodefony\\.eu$",
 *        "^.*\\.nodefony\\.eu$"
 *      ]
 */</span>
<span class="token keyword">const</span> path <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"path"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">system</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">domain</span><span class="token operator">:</span> <span class="token string">"0.0.0.0"</span><span class="token punctuation">,</span>
    <span class="token literal-property property">domainAlias</span><span class="token operator">:</span> <span class="token punctuation">[</span>
      <span class="token string">"^127.0.0.1$"</span><span class="token punctuation">,</span>
      <span class="token string">"^localhost$"</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token literal-property property">httpPort</span><span class="token operator">:</span> <span class="token number">5151</span><span class="token punctuation">,</span>
    <span class="token literal-property property">httpsPort</span><span class="token operator">:</span> <span class="token number">5152</span><span class="token punctuation">,</span>
    <span class="token literal-property property">domainCheck</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
    <span class="token literal-property property">locale</span><span class="token operator">:</span> <span class="token string">"en_en"</span><span class="token punctuation">,</span>
    <span class="token doc-comment comment">/**
     * BUNDLES CORE
     */</span>
    <span class="token literal-property property">security</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token literal-property property">realtime</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token literal-property property">monitoring</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token literal-property property">mail</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token literal-property property">documentation</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
    <span class="token literal-property property">unitTest</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token literal-property property">redis</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
    <span class="token literal-property property">mongo</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
    <span class="token literal-property property">elastic</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
    <span class="token doc-comment comment">/**
     * SERVERS
     */</span>
    <span class="token literal-property property">servers</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token literal-property property">statics</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
      <span class="token literal-property property">protocol</span><span class="token operator">:</span> <span class="token string">"2.0"</span><span class="token punctuation">,</span> <span class="token comment">//  2.0 || 1.1</span>
      <span class="token literal-property property">http</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
      <span class="token literal-property property">https</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
      <span class="token literal-property property">ws</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
      <span class="token literal-property property">wss</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
      <span class="token literal-property property">certificats</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">key</span><span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span><span class="token string">"config"</span><span class="token punctuation">,</span> <span class="token string">"certificates"</span><span class="token punctuation">,</span> <span class="token string">"server"</span><span class="token punctuation">,</span> <span class="token string">"privkey.pem"</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token literal-property property">cert</span><span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span><span class="token string">"config"</span><span class="token punctuation">,</span> <span class="token string">"certificates"</span><span class="token punctuation">,</span> <span class="token string">"server"</span><span class="token punctuation">,</span> <span class="token string">"fullchain.pem"</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token literal-property property">ca</span><span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span><span class="token string">"config"</span><span class="token punctuation">,</span> <span class="token string">"certificates"</span><span class="token punctuation">,</span> <span class="token string">"ca"</span><span class="token punctuation">,</span> <span class="token string">"nodefony-root-ca.crt.pem"</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token literal-property property">options</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token literal-property property">rejectUnauthorized</span><span class="token operator">:</span> <span class="token boolean">true</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token doc-comment comment">/**
     * DEV SERVER
     */</span>
    <span class="token literal-property property">devServer</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token literal-property property">inline</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
      <span class="token literal-property property">hot</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
      <span class="token literal-property property">hotOnly</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
      <span class="token literal-property property">overlay</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
      <span class="token literal-property property">logLevel</span><span class="token operator">:</span> <span class="token string">"info"</span><span class="token punctuation">,</span> <span class="token comment">// none, error, warning or info</span>
      <span class="token literal-property property">progress</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
      <span class="token literal-property property">protocol</span><span class="token operator">:</span> <span class="token string">"https"</span><span class="token punctuation">,</span>
      <span class="token literal-property property">websocket</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token doc-comment comment">/**
     *  BUNDLES LOCAL REGISTRATION
     *    Example :
     *       bundles: <span class="token punctuation">{</span>
     *         hello-bundle : "file:src/bundles/hello-bundle",
     *         test-bundle  : path.resolve("src","bundles","test-bundle")
     *       <span class="token punctuation">}</span>
     */</span>
    <span class="token literal-property property">bundles</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token operator">...</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="quick-start" tabindex="-1"><a class="header-anchor" href="#quick-start" aria-hidden="true">#</a> <a name="bundles"></a>Quick Start</h2>
<h3 id="install-nodefony" tabindex="-1"><a class="header-anchor" href="#install-nodefony" aria-hidden="true">#</a> Install Nodefony :</h3>
<div class="language-text line-numbers-mode" data-ext="text"><pre v-pre class="language-text"><code>$ npm -g install nodefony
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><a href="https://docs.npmjs.com/getting-started/fixing-npm-permissions" target="_blank" rel="noopener noreferrer">See Global install How to Prevent Permissions Errors<ExternalLinkIcon/></a></p>
<h3 id="create-project" tabindex="-1"><a class="header-anchor" href="#create-project" aria-hidden="true">#</a> Create Project :</h3>
<div class="language-text line-numbers-mode" data-ext="text"><pre v-pre class="language-text"><code>$ nodefony create myproject
$ cd myproject
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="generating-a-new-bundle" tabindex="-1"><a class="header-anchor" href="#generating-a-new-bundle" aria-hidden="true">#</a> Generating a New Bundle :</h3>
<p>CLI Generate new bundle : default path src/bundles</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ nodefony generate:bundle name <span class="token punctuation">[</span>path<span class="token punctuation">]</span>

<span class="token comment"># Or Generate a New Bundle Interactive</span>
$ nodefony

?  Nodefony CLI <span class="token builtin class-name">:</span>  Generater
?  Nodefony CLI <span class="token builtin class-name">:</span>  <span class="token punctuation">(</span>Use arrow keys<span class="token punctuation">)</span>
❯ Generate New Bundle
  Generate New Controller
  Generate New Service
  Generate New Entity
  Generate New Nodefony Project
  Generate Openssl Certificates
  Generate Haproxy Configuration
  Generate Nginx Configuration
  Generate letsEncrypt Webroot Configuration
  --------
  Quit
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="starting-servers-to-check-new-bundle-hello" tabindex="-1"><a class="header-anchor" href="#starting-servers-to-check-new-bundle-hello" aria-hidden="true">#</a> Starting Servers to check new Bundle hello:</h3>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>$ <span class="token function">npm</span> start
or
$ nodefony dev
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Access to bundle route with URL : <a href="http://localhost:5151/hello" target="_blank" rel="noopener noreferrer">http://localhost:5151/hello<ExternalLinkIcon/></a></p>
<p>Access to bundle route with URL : <a href="https://localhost:5152/hello" target="_blank" rel="noopener noreferrer">https://localhost:5152/hello<ExternalLinkIcon/></a></p>
<h4 id="now-hello-bundle-is-auto-insert-in-framework-with-watcher-active-and-auto-config-webpack-module-bundler" tabindex="-1"><a class="header-anchor" href="#now-hello-bundle-is-auto-insert-in-framework-with-watcher-active-and-auto-config-webpack-module-bundler" aria-hidden="true">#</a> Now hello-bundle is auto-insert in framework with watcher active and auto-config Webpack Module bundler</h4>
<h3 id="example-controller-src-bundles-hello-bundle-controller-defaultcontroller-js" tabindex="-1"><a class="header-anchor" href="#example-controller-src-bundles-hello-bundle-controller-defaultcontroller-js" aria-hidden="true">#</a> Example controller  : src/bundles/hello-bundle/controller/defaultController.js</h3>
<div class="language-javascript line-numbers-mode" data-ext="js"><pre v-pre class="language-javascript"><code><span class="token doc-comment comment">/**
 *	<span class="token keyword">@class</span> defaultController
 *	<span class="token keyword">@constructor</span>
 *	<span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">{</span><span class="token keyword">class</span><span class="token punctuation">}</span></span> <span class="token parameter">container</span>
 *	<span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">{</span><span class="token keyword">class</span><span class="token punctuation">}</span></span> <span class="token parameter">context</span>
 *  @Route ("/hello")
 */</span>
<span class="token keyword">class</span> <span class="token class-name">defaultController</span> <span class="token keyword">extends</span> <span class="token class-name">nodefony<span class="token punctuation">.</span>Controller</span> <span class="token punctuation">{</span>

  <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token parameter">container<span class="token punctuation">,</span> context</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">super</span><span class="token punctuation">(</span>container<span class="token punctuation">,</span> context<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// start session</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">startSession</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 *    @Route ("",
 *      name="hello-route")
 */</span>
  <span class="token function">indexAction</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span><span class="token string">"hello-bundle::index.html.twig"</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
			<span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token keyword">this</span><span class="token punctuation">.</span>bundle<span class="token punctuation">.</span>name<span class="token punctuation">,</span>
			<span class="token literal-property property">description</span><span class="token operator">:</span> <span class="token keyword">this</span><span class="token punctuation">.</span>bundle<span class="token punctuation">.</span>package<span class="token punctuation">.</span>description    
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

module<span class="token punctuation">.</span>exports <span class="token operator">=</span> defaultController<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="example-view-twig-src-bundles-hello-bundle-resources-views-index-html-twig" tabindex="-1"><a class="header-anchor" href="#example-view-twig-src-bundles-hello-bundle-resources-views-index-html-twig" aria-hidden="true">#</a> Example view (twig) : src/bundles/hello-bundle/Resources/views/index.html.twig</h3>
<div class="language-twig line-numbers-mode" data-ext="twig"><pre v-pre class="language-twig"><code><span class="token twig language-twig"><span class="token delimiter punctuation">{%</span> <span class="token tag-name keyword">extends</span> <span class="token string"><span class="token punctuation">'</span>./base.html.twig<span class="token punctuation">'</span></span> <span class="token delimiter punctuation">%}</span></span>
<span class="token twig language-twig"><span class="token delimiter punctuation">{%</span> <span class="token tag-name keyword">set</span> error <span class="token operator">=</span> getFlashBag<span class="token punctuation">(</span><span class="token string"><span class="token punctuation">"</span>error<span class="token punctuation">"</span></span><span class="token punctuation">)</span> <span class="token delimiter punctuation">%}</span></span>
<span class="token twig language-twig"><span class="token delimiter punctuation">{%</span> <span class="token tag-name keyword">set</span> info <span class="token operator">=</span> getFlashBag<span class="token punctuation">(</span><span class="token string"><span class="token punctuation">"</span>info<span class="token punctuation">"</span></span><span class="token punctuation">)</span> <span class="token delimiter punctuation">%}</span></span>
<span class="token twig language-twig"><span class="token delimiter punctuation">{%</span> <span class="token tag-name keyword">block</span> body <span class="token delimiter punctuation">%}</span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>hello<span class="token punctuation">"</span></span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>img</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span>displayed</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span>/framework-bundle/images/nodefony-logo.png</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span><span class="token twig language-twig"><span class="token delimiter punctuation">{{</span> name <span class="token delimiter punctuation">}}</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h2</span><span class="token punctuation">></span></span><span class="token twig language-twig"><span class="token delimiter punctuation">{{</span> description <span class="token delimiter punctuation">}}</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h2</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>img</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>displayed<span class="token punctuation">"</span></span>  <span class="token special-attr"><span class="token attr-name">style</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span> width:10%; height:10%<span class="token punctuation">"</span></span></span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>/framework-bundle/images/nodejs/nodejs-new-pantone-black.png<span class="token punctuation">"</span></span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>img</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>displayed<span class="token punctuation">"</span></span> <span class="token special-attr"><span class="token attr-name">style</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span> width:15%; height:15%<span class="token punctuation">"</span></span></span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>/framework-bundle/images/webpack/webpack.svg<span class="token punctuation">"</span></span><span class="token punctuation">></span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
<span class="token twig language-twig"><span class="token delimiter punctuation">{%</span> <span class="token tag-name keyword">endblock</span> <span class="token delimiter punctuation">%}</span></span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="watchers" tabindex="-1"><a class="header-anchor" href="#watchers" aria-hidden="true">#</a> watchers :</h3>
<h4 id="the-bundle-generation-engine-build-bundle-config-with-node-js-watcher-configuration" tabindex="-1"><a class="header-anchor" href="#the-bundle-generation-engine-build-bundle-config-with-node-js-watcher-configuration" aria-hidden="true">#</a> The bundle generation engine build bundle config with  node.js watcher configuration</h4>
<h4 id="in-developement-mode-is-very-usefull-to-auto-reload-files-as-controllers-views-routing-translations" tabindex="-1"><a class="header-anchor" href="#in-developement-mode-is-very-usefull-to-auto-reload-files-as-controllers-views-routing-translations" aria-hidden="true">#</a> In developement mode  is very usefull to auto-reload files as controllers , views , routing , translations</h4>
<h4 id="without-having-to-reboot-the-server" tabindex="-1"><a class="header-anchor" href="#without-having-to-reboot-the-server" aria-hidden="true">#</a> without having to reboot the server.</h4>
<p>You can see hello-bundle config   : src/bundles/hello-bundle/Resources/config/config.js</p>
<div class="language-javascript line-numbers-mode" data-ext="js"><pre v-pre class="language-javascript"><code>module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">locale</span>      <span class="token operator">:</span> <span class="token string">"en_en"</span><span class="token punctuation">,</span>
  <span class="token doc-comment comment">/**
   *    WATCHERS
   *
   *  watchers Listen to changes, deletion, renaming of files and directories
   *  of different components
   *
   *  For watch all components
   *      watch:                    true
   *  or
   *      watch:<span class="token punctuation">{</span>
   *        controller:             true,
   *        config:                 true,        // only routing and services
   *        views:                  true,
   *        translations:           true,
   *        webpack:                true
   *      <span class="token punctuation">}</span>
   *
   */</span>
  <span class="token literal-property property">watch</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>

  <span class="token doc-comment comment">/**
   * DEV SERVER
   */</span>
  <span class="token literal-property property">devServer</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">hot</span><span class="token operator">:</span> <span class="token boolean">false</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="webpack-module-bundler" tabindex="-1"><a class="header-anchor" href="#webpack-module-bundler" aria-hidden="true">#</a> Webpack Module bundler :</h3>
<h4 id="the-bundle-generation-engine-build-bundle-config-with-a-predefined-webpack-configuration" tabindex="-1"><a class="header-anchor" href="#the-bundle-generation-engine-build-bundle-config-with-a-predefined-webpack-configuration" aria-hidden="true">#</a> The bundle generation engine build bundle config with a predefined webpack configuration</h4>
<h4 id="in-this-way-webpack-is-very-usefull-to-manage-all-assets-of-bundle" tabindex="-1"><a class="header-anchor" href="#in-this-way-webpack-is-very-usefull-to-manage-all-assets-of-bundle" aria-hidden="true">#</a> In this way webpack is very usefull to manage all assets of bundle</h4>
<h4 id="in-developement-mode-watch-is-very-usefull-to-auto-compile-webpack-module-bundle" tabindex="-1"><a class="header-anchor" href="#in-developement-mode-watch-is-very-usefull-to-auto-compile-webpack-module-bundle" aria-hidden="true">#</a> In developement mode watch  is very usefull to auto-compile webpack module bundle</h4>
<h4 id="without-having-to-reboot-the-server-1" tabindex="-1"><a class="header-anchor" href="#without-having-to-reboot-the-server-1" aria-hidden="true">#</a> without having to reboot the server</h4>
<p>You can see hello-bundle config webpack : src/bundles/hello-bundle/Resources/config/webpack.config.js</p>
<div class="language-javascript line-numbers-mode" data-ext="js"><pre v-pre class="language-javascript"><code><span class="token comment">// Default context &lt;bundle base directory></span>
<span class="token comment">//const context = path.resolve(__dirname, "..", "public");</span>
<span class="token keyword">const</span> <span class="token keyword">public</span> <span class="token operator">=</span> path<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">".."</span><span class="token punctuation">,</span> <span class="token string">"public"</span><span class="token punctuation">,</span> <span class="token string">"assets"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> publicPath <span class="token operator">=</span> <span class="token string">"/hello-bundle/assets/"</span><span class="token punctuation">;</span>
<span class="token keyword">let</span> wpconfig <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
<span class="token keyword">let</span> dev <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>kernel<span class="token punctuation">.</span>environment <span class="token operator">===</span> <span class="token string">"dev"</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  wpconfig <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"./webpack/webpack.dev.config.js"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
  wpconfig <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"./webpack/webpack.prod.config.js"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  dev <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token function">webpackMerge</span><span class="token punctuation">(</span>config<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token comment">//context: context,</span>
  <span class="token literal-property property">target</span><span class="token operator">:</span> <span class="token string">"web"</span><span class="token punctuation">,</span>
  <span class="token literal-property property">entry</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">hello</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token string">"./Resources/js/hello.js"</span><span class="token punctuation">]</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">output</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">path</span><span class="token operator">:</span> <span class="token keyword">public</span><span class="token punctuation">,</span>
    <span class="token literal-property property">publicPath</span><span class="token operator">:</span> publicPath<span class="token punctuation">,</span>
    <span class="token literal-property property">filename</span><span class="token operator">:</span> <span class="token string">"./js/[name].js"</span><span class="token punctuation">,</span>
    <span class="token literal-property property">library</span><span class="token operator">:</span> <span class="token string">"[name]"</span><span class="token punctuation">,</span>
    <span class="token literal-property property">libraryExport</span><span class="token operator">:</span> <span class="token string">"default"</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">externals</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token operator">...</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">resolve</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token operator">...</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">module</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token operator">...</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">plugins</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token operator">...</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">devServer</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">inline</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token literal-property property">hot</span><span class="token operator">:</span> <span class="token boolean">false</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="monitoring-framework" tabindex="-1"><a class="header-anchor" href="#monitoring-framework" aria-hidden="true">#</a> <a name="monitoring"></a>Monitoring FRAMEWORK</h2>
<p>Access to monitoring route with URL : <a href="http://localhost:5151/nodefony" target="_blank" rel="noopener noreferrer">http://localhost:5151/nodefony<ExternalLinkIcon/></a></p>
<p><a href="https://nodefony.net/nodefony" target="_blank" rel="noopener noreferrer"><img src="https://raw.githubusercontent.com/nodefony/nodefony/master/src/nodefony/bundles/monitoring-bundle/Resources/public/images/monitor.png" alt="MONITORING" loading="lazy"><ExternalLinkIcon/></a></p>
<p>Monitoring in progress !!!</p>
<h2 id="who-use-nodefony" tabindex="-1"><a class="header-anchor" href="#who-use-nodefony" aria-hidden="true">#</a> Who Use Nodefony:</h2>
<p float="left">
  <a href="https://www.sfr.fr" target="_blank">
    <img src="https://raw.githubusercontent.com/nodefony/nodefony/master/tools/images/sfr.jpg"/>
  </a>
  &nbsp&nbsp&nbsp&nbsp&nbsp
  <a href="https://www.sfr.fr" target="_blank">
    <img src="https://raw.githubusercontent.com/nodefony/nodefony/master/tools/images/logo.png"/>
  </a>
  &nbsp&nbsp&nbsp&nbsp&nbsp
  <a href="https://www.d-lake.fr" target="_blank">
    <img src="https://raw.githubusercontent.com/nodefony/nodefony/dev/tools/images/d-lake.png"/>
  </a>
  &nbsp&nbsp&nbsp&nbsp&nbsp
  <a href="https://emersya.com" target="_blank">
    <img src="https://raw.githubusercontent.com/nodefony/nodefony/dev/tools/images/emersya.png"/>
  </a>
</p>
<h2 id="big-thanks" tabindex="-1"><a class="header-anchor" href="#big-thanks" aria-hidden="true">#</a> Big thanks:</h2>
<ul>
<li><a href="https://www.d-lake.fr/" target="_blank" rel="noopener noreferrer">D-Lake<ExternalLinkIcon/></a> French specialist in infrastructure and data security.</li>
<li><a href="https://emersya.com" target="_blank" rel="noopener noreferrer">Emersya<ExternalLinkIcon/></a> Emersya has pioneered a unique way of interacting with products online using 3D technology.</li>
</ul>
<h2 id="related-links" tabindex="-1"><a class="header-anchor" href="#related-links" aria-hidden="true">#</a> Related Links:</h2>
<ul>
<li><a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js<ExternalLinkIcon/></a></li>
<li><a href="https://www.npmjs.com/" target="_blank" rel="noopener noreferrer">npm<ExternalLinkIcon/></a></li>
<li><a href="http://symfony.com/" target="_blank" rel="noopener noreferrer">Framework Symfony<ExternalLinkIcon/></a></li>
<li><a href="https://github.com/justjohn/twig.js/wiki" target="_blank" rel="noopener noreferrer">Twig.js<ExternalLinkIcon/></a></li>
<li><a href="https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md" target="_blank" rel="noopener noreferrer">PM2<ExternalLinkIcon/></a></li>
<li><a href="https://webpack.js.org/" target="_blank" rel="noopener noreferrer">WEBPACK<ExternalLinkIcon/></a></li>
</ul>
<p>More informations  <strong><a href="https://nodefony.net/documentation" target="_blank" rel="noopener noreferrer">Nodefony Documentation<ExternalLinkIcon/></a></strong></p>
<h2 id="authors" tabindex="-1"><a class="header-anchor" href="#authors" aria-hidden="true">#</a> <a name="authors"></a>Authors</h2>
<ul>
<li>Christophe CAMENSULI  <a href="https://github.com/ccamensuli" target="_blank" rel="noopener noreferrer">github/ccamensuli<ExternalLinkIcon/></a></li>
</ul>
<h2 id="license" tabindex="-1"><a class="header-anchor" href="#license" aria-hidden="true">#</a> <a name="license"></a>License</h2>
<p><a href="https://github.com/nodefony/nodefony/blob/master/LICENSE" target="_blank" rel="noopener noreferrer">CeCILL-B<ExternalLinkIcon/></a></p>
<h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo" aria-hidden="true">#</a> <a name="demo"></a>Demo</h2>
<p><a href="https://nodefony.net" target="_blank" rel="noopener noreferrer">Demo<ExternalLinkIcon/></a></p>
</div></template>


