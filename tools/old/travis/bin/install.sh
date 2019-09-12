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

git submodule sync
git submodule update --init --recursive

# Install Nodefony
npm link src/nodefony
# Build trunk
nodefony build

if [ "$DB" = "mysql" ]
then
  nodefony generate:bundle generated
  #make deploy &
  nodefony pm2 &
  sleep 60;
  #make status &
  nodefony status &
else
  nodefony generate:bundle generated
  nodefony dev &
fi
