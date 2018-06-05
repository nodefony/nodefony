#!/usr/bin/env bash


for file in $(find ./src -iname "*.twig"); do
  if grep monitoringBundle $file &>/dev/null; then
    sed -i "" 's,monitoringBundle,monitoring-bundle,g' $file
  fi
done
