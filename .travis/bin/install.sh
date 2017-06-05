#!/bin/sh

echo "INSTALL NODEFONY TRAVIS ENVIRONEMENT $DB ACTIVE ";

if [ "$DB" = "mysql" ]
then
	echo "NODEFONY TRAVIS ENVIRONEMENT MYSQL ACTIVE " ;
	cp .travis/config/config.yml app/config/config.yml ;
else
	echo "NODEFONY TRAVIS ENVIRONEMENT SQLITE ACTIVE " ;
fi

#configuring the system
make build

if [ "$DB" = "mysql" ]
then
	./console generate:bundle:angular generatedBundle ./src/bundles
	make deploy & 
	sleep 30;
	make status &
else
	./console generate:bundle generatedBundle ./src/bundles
	./nodefony_dev &
fi

