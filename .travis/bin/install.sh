#!/bin/sh
echo "INSTALL NODEFONY TRAVIS ENVIRONEMENT $DB ACTIVE ";

if [ "$DB" = "mysql" ]
then
  echo "NODEFONY TRAVIS ENVIRONEMENT MYSQL ACTIVE " ;
  cp .travis/config/config.yml app/config/config.yml ;
fi

if [ "$DB" = "mongodb" ]
then
  cp .travis/config/configMongo.yml config/config.yml ;
  echo "NODEFONY TRAVIS ENVIRONEMENT MONGODB ACTIVE " ;
fi

cat /etc/hosts

#configuring the system
npm link src/nodefony
make build
if [ "$DB" = "mongodb" ]
then
  make mongoose
fi

if [ "$DB" = "mysql" ]
then
  ./nodefony generate:bundle generated
  make deploy &
  sleep 60;
  make status &
else
  ./nodefony generate:bundle generated
  ./nodefony dev &
fi
