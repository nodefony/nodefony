#https://www.gnu.org/software/make/manual/html_node/index.html

DISTRIB := $(shell uname)
VERBOSE = 0
NODE_VERSION := $(shell node -v)

PWD := $(shell pwd)

VERSION := $(subst v,,$(subst .,,$(NODE_VERSION)))
#$(error $(VERSION))
VERSION := $(shell expr $(VERSION) )

APP_NAME := $(shell nodefony app 2>/dev/null )

NODEFONY_VERSION := $(shell nodefony version 2>/dev/null )

LINE := NODEFONY $(NODEFONY_VERSION)  PLATFORM : $(DISTRIB)   NODE VERSION : $(NODE_VERSION)   APPLICATION : $(APP_NAME)   DEBUG : $(VERBOSE)
$(info $(LINE))

all:  npm install

install:
	@echo "";
	@echo "#########################################" ;
	@echo "#      NODEFONY INSTALL BUNDLES         #" ;
	@echo "#########################################" ;
	@echo "";
	@if [ $(VERBOSE) = 0 ] ; then \
		echo "nodefony npm:install";\
		npm start npm:install ;\
	else \
		echo "nodefony -d npm:install";\
		npm start -d npm:install ;\
	fi \

build:
	@echo "";
	@echo "#########################################" ;
	@echo "#            NODEFONY BUILD             #" ;
	@echo "#########################################" ;
	@echo "";

	make clean ;

	make certificates ;

	make npm ;

	make install && echo "success nodefony install !" || echo "failure nodefony install !" ;

	make sequelize && echo "success nodefony sequelize !" || echo "failure nodefony sequelize !" ;

	@if [ $(VERBOSE) = 0 ] ; then \
		echo "nodefony router:display:routes";\
		npm start router:display:routes ;\
		echo "nodefony router:match:url /";\
		npm start router:match:url /\
		echo "nodefony npm:list";\
		npm start npm:list ;\
	else \
		echo "nodefony -d router:display:routes";\
		npm start -d router:display:routes ;\
		echo "nodefony -d router:display:match /";\
		npm start -d router:display:match /\
		echo "nodefony -d npm:list";\
		npm start -d npm:list ;\
	fi \

#
# PM2 MANAGEMENT PRODUCTION
#
startup:
	./node_modules/pm2/bin/pm2 startup

start:
	npm run pm2 -- update
	npm start pm2
	#npm run pm2 -- logs $(APP_NAME)
	npm run pm2 monit $(APP_NAME)
stop:
	./node_modules/pm2/bin/pm2 stop $(APP_NAME)

kill:
	./node_modules/pm2/bin/pm2 kill

show:
	./node_modules/pm2/bin/pm2 show $(APP_NAME)

monitor:
	./node_modules/pm2/bin/pm2 monit $(APP_NAME)

status:
	./node_modules/pm2/bin/pm2 status

reload:
	./node_modules/pm2/bin/pm2 reload $(APP_NAME)

restart:
	./node_modules/pm2/bin/pm2 restart $(APP_NAME)

logs:
	./node_modules/pm2/bin/pm2 logs $(APP_NAME)

clean-log:
	./node_modules/pm2/bin/pm2 flush

# NODEFONY BUILD FRAMEWORK
npm:
	@echo "" ;
	@echo "#######################################################" ;
	@echo "#                node.js  INSTALLATION                #" ;
	@echo "#######################################################" ;
	@echo "" ;

	@[ $(VERSION) -ge 600 ]  || ( echo '$(NODE_VERSION) NODEFONY ERROR NODE VERSION must have version >= v6.0.0  See https://nodejs.org/en/download/package-manager for upgrade version '; exit 1; )

	@if [  -f package.json  ] ; then \
		if [ $(VERBOSE) = 0 ] ; then \
			echo "npm  install" ;\
			npm  install  ;\
		else \
			echo "npm -ddd install" ;\
			npm -ddd install  ;\
		fi \
	fi

outdated:
	@echo "" ;
	@echo "#######################################################" ;
	@echo "#           node.js  outdated dependencies            #" ;
	@echo "#######################################################" ;
	@echo "" ;
	npm outdated --deph=0

list:
	@echo "" ;
	@echo "#######################################################" ;
	@echo "#           node.js  list  dependencies               #" ;
	@echo "#######################################################" ;
	@echo "" ;
	npm ls --depth=0

deploy:
	./node_modules/pm2/bin/pm2 update
	npm  install --only=production
	npm start pm2

webpack:
	@echo "";
	@echo "#########################################" ;
	@echo "#     NODEFONY WEBPACK COMPILE          #" ;
	@echo "#########################################" ;
	@echo "";
	npm start webpack:dump ;\

framework:
	@echo "";
	@echo "#######################################" ;
	@echo "#            GIT SUBMODULES           #" ;
	@echo "#######################################" ;
	@echo "";

	@if [ -e .gitmodules ] ; then \
		git submodule sync ; \
		git submodule update --init --recursive ; \
	fi

	@echo "";
	@echo "####################################################" ;
	@echo "#            CREATE FRAMEWORK REPOSITORY           #" ;
	@echo "####################################################" ;
	@echo "";

	@if [ ! -d tmp ] ; then  \
		mkdir tmp ;\
	fi
	@if [ ! -d tmp/upload ] ; then  \
		mkdir tmp/upload ;\
	fi
	@if [ ! -d bin ] ; then  \
		mkdir bin ;\
	fi
	@if [ ! -d app/Resources/databases ] ; then  \
		mkdir -p app/Resources/databases ;\
	fi
	@if [ ! -d web ] ; then  \
		mkdir web ;\
	fi
	@if [ ! -d web/js ] ; then  \
		mkdir web/js ;\
	fi
	@if [ ! -d web/css ] ; then  \
		mkdir web/css ;\
	fi
	@if [ ! -d web/images ] ; then  \
		mkdir web/images ;\
	fi
	@if [ ! -d web/fonts ] ; then  \
		mkdir web/fonts ;\
	fi
	@if [ ! -d web/assets ] ; then  \
		mkdir  web/assets ;\
	fi
	@if [ ! -d web/assets/js ] ; then  \
		mkdir web/assets/js ;\
	fi
	@if [ ! -d web/assets/css ] ; then  \
		mkdir web/assets/css ;\
	fi
	@if [ ! -d web/assets/images ] ; then  \
		mkdir web/assets/images ;\
	fi
	@if [ ! -e web/favicon.ico ] ; then \
		echo " copy favicon.ico " ;\
		cp app/Resources/public/favicon.ico web/ ;\
	fi
	@if [ ! -e web/robots.txt ] ; then  \
		echo " copy robots.txt " ;\
		cp app/Resources/public/robots.txt web/ ;\
	fi

sequelize:
	npm start Sequelize:generate:entities
	npm start Sequelize:fixtures:load

mongoose:
	npm start mongo:fixtures:load

clean:
	@if [ -e  node_modules ] ; then \
		echo ""; \
		echo "############################################" ;\
		echo "#            CLEAN  NODE MODULES           #" ;\
		echo "############################################" ;\
		echo ""; \
		rm -rf node_modules/.bin ; \
		rm -rf node_modules/* ; \
	fi
	@if [ -e  tmp ] ; then \
		echo ""; \
		echo "##########################################" ;\
		echo "#            CLEAN  TEMPORARY            #" ;\
		echo "##########################################" ;\
		echo ""; \
		rm -rf tmp/* ; \
	fi
	@if [ -e  web ] ; then \
		echo ""; \
		echo "###################################################" ;\
		echo "#            CLEAN  WEB PUBLIC DIRECTOY           #" ;\
		echo "###################################################" ;\
		echo ""; \
		rm -rf web/* ; \
	fi
	@if [ -e  package-lock.json ] ; then \
	echo ""; \
	echo "###################################################" ;\
	echo "#            CLEAN  package-lock.json              #" ;\
	echo "###################################################" ;\
	echo ""; \
	rm -f package-lock.json ; \
	fi
	@if [ -e yarn.lock ] ; then \
	echo ""; \
	echo "###################################################" ;\
	echo "#            CLEAN  yarn.lock                     #" ;\
	echo "###################################################" ;\
	echo ""; \
	rm -f yarn.lock ; \
	fi

	make framework ;

test:
	npm test ;

certificates:
	@echo "";
	@echo "#########################################" ;
	@echo "#         NODEFONY CERTIFICATES         #" ;
	@echo "#########################################" ;
	@echo "";
	rm -rf config/certificates ;
	./bin/generateCertificates.sh;

docker-build:
	@echo "";
	@echo "#########################################" ;
	@echo "#         NODEFONY DOCKER BUILD         #" ;
	@echo "#########################################" ;
	@echo "";

	make framework ;

	make npm ;

	make install ;

	make certificates ;

docker-compose: docker-compose-stop
	$(MAKE) -C docker compose-start

docker-compose-stop:
	$(MAKE) -C docker compose-stop

docker-compose-rm: docker-compose-stop
	$(MAKE) -C docker compose-rm

docker-compose-clean:
	$(MAKE) -C docker clean

.EXPORT_ALL_VARIABLES:
.PHONY: vendors doc compose
