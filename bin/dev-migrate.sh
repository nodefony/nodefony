#!/usr/bin/env bash

rm -rf ./app/Resources/databases/nodefony.db

npx nodefony sequelize:create:database
npx nodefony sequelize:migrate
npx nodefony sequelize:sync
