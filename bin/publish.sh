#!/usr/bin/env bash

version=`nodefony version`;
pathproject=$(pwd);
pathbundles=$(pwd)"/src/nodefony/bundles";
pathdemo=$(pwd)"/src/bundles";
pathnodefony=$(pwd)"/src/nodefony";
declare -a packages=();

cd $pathproject
# outdated packages
echo "Do you wish to search outdated packages nodefony $version ?"
select yn in "Yes" "No"; do
  case $yn in
    Yes )
      nodefony outdated ;
      break ;;
    No )
      break ;;
  esac
done

# WEBPACK
echo "Do you wish compile (dump) webpack project bundles ?"
select yn in "Yes" "No"; do
  case $yn in
    Yes )
      nodefony webpack:dump
      break ;;
    No )
      break ;;
  esac
done

# PUBLISH CORE BUNDLES
cd $pathbundles ;
for file in $(ls $pathbundles ); do
  if grep -q ".*-bundle" <<< $file &>/dev/null; then
    cd $pathbundles/$file;
    packages=(${packages[@]} $file);
    echo "CLEAN $pathbundles/$file DIRECTORY";
    rm -rf node_modules
    yarn
    npm install
    echo "PUBLISH CORE BUNDLES : @nodefony/$file ";
    #npm publish --access=public
  fi
done

# PUBLISH DEMO BUNDLE
cd $pathproject ;
for file in $(ls $pathdemo ); do
  if grep -q "demo-bundle" <<< $file &>/dev/null; then
    cd $pathdemo/$file;
    echo "CLEAN $pathdemo/$file DIRECTORY";
    rm -rf node_modules
    yarn
    npm install
    echo "PUBLISH BUNDLE : @nodefony/$file";
    #npm publish --access=public
  fi
done

# UPGRADE NODEFONY
sleep 2;
cd $pathnodefony;
for package in ${packages[@]}; do
  echo "UPGRADE PACKAGE nodefony with : @nodefony/$package";
  #npm install @nodefony/$package
done

# TOOLS
cd $pathproject
echo "Do you wish to copy README and CHANGELOG project in nodefony package ?"
select yn in "Yes" "No"; do
  case $yn in
    Yes )
      echo "copy README.md";
      #cp README.md $pathnodefony ;
      echo "copy CHANGELOG.md";
      #cp CHANGELOG.md $pathnodefony ;
      break ;;
    No )
      break ;;
  esac
done

# COMMIT PROJECT
cd $pathproject;
git status
echo "Do you wish to commit this nodefony release $version ?"
select yn in "Yes" "No"; do
  case $yn in
    Yes )
      echo "COMMIT PROJECT $version";
      #git commit -a -m nodefony release $version
      echo "TAG PROJECT v$version";
      #git tag v$version
      #git tag
      #git push origin v$version
      break ;;
    No )
      break ;;
  esac
done

# PUBLISH NODEFONY
echo "Ready to publish nodefony release : $version ?"
select yn in "Yes" "No"; do
  case $yn in
    Yes )
      cd $pathnodefony ;
      echo "CLEAN NODEFONY REPOSITORY";
      rm -rf node_modules
      yarn
      npm install
      echo "PUBLISH NODEFONY $version";
      #npm publish --access=public
      break ;;
    No )
      break ;;
  esac
done
