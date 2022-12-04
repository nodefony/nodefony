#!/usr/bin/env bash

rm -rf ./app/Resources/databases/nodefony.db
npx nodefony build
npx nodefony dev
