#!/usr/bin/env bash

version=`nodefony version`;
pathproject=$(pwd);
pathbundles=$(pwd)"/src/nodefony/bundles";
pathdemo=$(pwd)"/src/bundles";
pathnodefony=$(pwd)"/src/nodefony";
declare -a packages=();

outdated_packages () {
  cd $pathproject
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
}

compile_packages () {
  cd $pathproject
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
}

publish_core_bundles () {

  for file in $(ls $pathbundles ); do
    if grep -q ".*-bundle" <<< $file &>/dev/null; then
      packages=(${packages[@]} $file);
      echo "PUBLISH CORE BUNDLES : @nodefony/$file ";
      publish $pathbundles/$file
    fi
  done
}

publish_demo_bundles () {
  cd $pathproject ;
  for file in $(ls $pathdemo ); do
    if grep -q "demo-bundle" <<< $file &>/dev/null; then
      echo "PUBLISH BUNDLE : @nodefony/$file";
      publish $pathdemo/$file ;
    fi
  done
}

publish_nodefony () {
  echo "Ready to publish nodefony release : $version ?"
  select yn in "Yes" "No"; do
    case $yn in
      Yes )
        echo "PUBLISH NODEFONY $version";
        publish $pathnodefony ;
        break ;;
      No )
        break ;;
    esac
  done
}

publish () {
  cd $1 ;
  echo "CLEAN $1 DIRECTORY";
  rm -rf node_modules ;
  yarn;
  npm install;
  #npm publish --access=public;
}

upgrade_nodefony () {
  cd $pathnodefony;
  for package in ${packages[@]}; do
    echo "UPGRADE PACKAGE nodefony with : @nodefony/$package";
    #npm install @nodefony/$package
  done
}

commit_project () {
  cd $pathproject;
  git status
  echo "Do you wish to commit this nodefony release $version ?"
  select yn in "Yes" "No"; do
    case $yn in
      Yes )
        echo "COMMIT PROJECT $version";
        #git commit -a -m nodefony release $version
        echo "PUSH PROJECT TO REMOTE";
        #git push
        echo "TAG PROJECT v$version";
        #git tag v$version
        #git tag
        #git push origin v$version
        break ;;
      No )
        break ;;
    esac
  done
}

tools (){
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
}

generate_changelog () {
  cd $pathproject
  ./node_modules/.bin/gren changelog --username=nodefony  --repo=nodefony-core --tags=$version --data-source=commits --generate  --override
}

##########
#  Main  #
##########
# outdated packages
outdated_packages
# webpack
compile_packages
# PUBLISH CORE BUNDLES
publish_core_bundles
# PUBLISH DEMO BUNDLE
publish_demo_bundles

sleep 2;

# UPGRADE NODEFONY
upgrade_nodefony
# TOOLS
tools
# COMMIT PROJECT
commit_project
# PUBLISH NODEFONY
publish_nodefony
