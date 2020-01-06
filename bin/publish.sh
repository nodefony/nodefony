#!/usr/bin/env bash

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

add_bundle () {
  for file in $(ls $pathbundles ); do
    if grep -q ".*-bundle" <<< $file &>/dev/null; then
      packages=(${packages[@]} $file);
    fi
  done
}

publish_core_bundles () {
  for file in $(ls $pathbundles ); do
    if grep -q ".*-bundle" <<< $file &>/dev/null; then
      #packages=(${packages[@]} $file);
      echo "PUBLISH CORE BUNDLES : @nodefony/$file ";
      npm_publish $pathbundles/$file
    fi
  done
}

publish_demo_bundles () {
  cd $pathproject ;
  for file in $(ls $pathdemo ); do
    if grep -q "demo-bundle" <<< $file &>/dev/null; then
      cd $pathdemo/$file;
      echo "PUBLISH BUNDLE : @nodefony/$file";
      npm_publish $pathdemo/$file ;
      echo "COMMIT DEMO-BUNDLE $version";
      git commit -a -m "demo-bundle release $version"
      echo "PUSH DEMO-BUNDLE TO REMOTE";
      git push
      echo "TAG DEMO-BUNDLE v$version";
      git tag v$version
      git tag
      git push origin v$version
    fi
  done
}

publish_nodefony () {
  echo "Ready to publish nodefony release : $version ?"
  select yn in "Yes" "No"; do
    case $yn in
      Yes )
        echo "PUBLISH NODEFONY $version";
        npm_publish $pathnodefony ;
        break ;;
      No )
        break ;;
    esac
  done
}

upgrade_nodefony () {
  cd $pathnodefony;
  add_bundle;
  for package in ${packages[@]}; do
    echo "UPGRADE PACKAGE nodefony with : @nodefony/$package@$version";
    npm install @nodefony/$package@$version
  done
}

commit_project () {
  cd $pathproject;
  echo "Do you wish to commit this nodefony release $version ?"
  select yn in "Yes" "No"; do
    case $yn in
      Yes )
        echo "COMMIT PROJECT $version";
        git commit -a -m "nodefony release $version"
        echo "PUSH PROJECT TO REMOTE";
        git push
        echo "TAG PROJECT v$version";
        git tag v$version
        git tag
        git push origin v$version
        break ;;
      No )
        break ;;
    esac
  done
}

npm_publish () {
  cd $1 ;
  npm_version;
  echo "CLEAN $1 DIRECTORY";
  rm -rf node_modules ;
  rm -f package.lock.json;
  rm -f yarn.lock;
  yarn;
  npm install;
  sleep 2;
  npm publish --access=public;
}

npm_version () {
  if [ $1 ]
  then
    npm version $1 --allow-same-version --git-tag-version false
  else
    npm version $version --allow-same-version --git-tag-version false
  fi
}

tools (){
  cd $pathproject
  echo "Do you wish to copy README and Generate CHANGELOG project in nodefony package ?"
  select yn in "Yes" "No"; do
    case $yn in
      Yes )
        echo "copy README.md";
        cp README.md $pathnodefony ;
        echo "copy README.md in $pathnodefony/cli/builder/project/skeletons";
        cp README.md $pathnodefony/cli/builder/project/skeletons ;
        generate_changelog
        echo "copy CHANGELOG.md";
        cp CHANGELOG.md $pathnodefony ;
        echo "COMMIT CHANGELOG PROJECT $version";
        git commit -a -m "nodefony changelog $version"
        git push
        break ;;
      No )
        break ;;
    esac
  done
}

build(){
  cd $pathnodefony
  echo "Build webpackck nodefony for browser";
  npm run build
}

generate_changelog () {
  cd $pathproject
  mv CHANGELOG.md CHANGELOG.md.old
  if [ $1 ]
  then
    ./node_modules/.bin/gren changelog --username=nodefony  --repo=nodefony-core --tags=$1 --data-source=commits --generate  --override
  else
    ./node_modules/.bin/gren changelog --username=nodefony  --repo=nodefony-core --tags=v$version --data-source=commits --generate  --override
  fi
  sed -i "" 's,# Changelog,---,g' CHANGELOG.md.old
  echo >> CHANGELOG.md;
  cat CHANGELOG.md.old >> CHANGELOG.md ;
  rm CHANGELOG.md.old ;
}

publish (){
  # outdated packages
  #outdated_packages
  # webpack
  compile_packages
  # PUBLISH CORE BUNDLES
  publish_core_bundles
  # PUBLISH DEMO BUNDLE
  #publish_demo_bundles
  sleep 10;
  # UPGRADE NODEFONY
  upgrade_nodefony
  # COMMIT PROJECT
  commit_project
  # TOOLS CHANGELOG
  tools
  # BUILD nodefony
  build
  # PUBLISH NODEFONY
  publish_nodefony
}

menu () {
  declare -a commands=("build" "publish" "changelog" "Quit");
  # MENU
  select yn in ${commands[@]}; do
    case $yn in
      "changelog" )
        generate_changelog;
        break ;;
      "publish" )
        publish ;
        break ;;
      "build" )
        build ;
        break ;;
      "Quit" )
        exit;
    esac
  done
}

##########
#  Main  #
##########
clear;

version=`nodefony version`;
pathproject=$(pwd);
pathbundles=$(pwd)"/src/nodefony/bundles";
pathdemo=$(pwd)"/src/bundles";
pathnodefony=$(pwd)"/src/nodefony";
declare -a packages=();

echo "
 _   _    ___    ____    _____   _____    ___    _   _  __   __
| \ | |  / _ \  |  _ \  | ____| |  ___|  / _ \  | \ | | \ \ / /
|  \| | | | | | | | | | |  _|   | |_    | | | | |  \| |  \ V /
| |\  | | |_| | | |_| | | |___  |  _|   | |_| | | |\  |   | |
|_| \_|  \___/  |____/  |_____| |_|      \___/  |_| \_|   |_|

    version : $version
    GIT tags :
`git tag`
    GIT status :
`git status`
";


# PARSE ARGS
case $1 in
  "publish" )
    publish ;
    break ;;
  "changelog" )
    generate_changelog $2;
    break ;;
  "upgrade_nodefony" )
    upgrade_nodefony;
    break ;;
  "tools" )
    tools;
    break ;;
  "build" )
    build;
    break ;;
  "commit_project" )
    commit_project;
    break ;;
  "publish_nodefony" )
    publish_nodefony;
    break ;;
  * )
    echo "
    __  __
   |  \/  |   ___   _ __    _   _
   | |\/| |  / _ \ | '_ \  | | | |
   | |  | | |  __/ | | | | | |_| |
   |_|  |_|  \___| |_| |_|  \__,_|

    ";
    menu;
    break ;;
esac
