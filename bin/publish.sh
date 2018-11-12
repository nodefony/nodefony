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
      npm_version;
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
      npm_version;
      echo "COMMIT DEMO-BUNDLE $version";
      git commit -a -m demo-bundle release $version
      echo "PUSH DEMO-BUNDLE TO REMOTE";
      git push
      echo "TAG DEMO-BUNDLE v$version";
      git tag v$version
      git tag
      git push origin v$version
      echo "PUBLISH BUNDLE : @nodefony/$file";
      npm_publish $pathdemo/$file ;
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
  npm_version;
  add_bundle;
  for package in ${packages[@]}; do
    echo "UPGRADE PACKAGE nodefony with : @nodefony/$package";
    npm install @nodefony/$package
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
  echo "CLEAN $1 DIRECTORY";
  rm -rf node_modules ;
  yarn;
  npm install;
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
        generate_changelog
        echo "copy CHANGELOG.md";
        cp CHANGELOG.md $pathnodefony ;
        echo "COMMIT CHANGELOG PROJECT $version";
        git commit -a -m nodefony changelog $version
        git push
        break ;;
      No )
        break ;;
    esac
  done
}

generate_changelog () {
  cd $pathproject
  mv CHANGELOG.md CHANGELOG.md.old
  if [ $1 ]
  then
    ./node_modules/.bin/gren changelog --username=nodefony  --repo=nodefony-core --tags=$1 --data-source=commits --generate  --override
  else
    ./node_modules/.bin/gren changelog --username=nodefony  --repo=nodefony-core --tags=$version --data-source=commits --generate  --override
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
  publish_demo_bundles
  sleep 10;
  # UPGRADE NODEFONY
  upgrade_nodefony
  # COMMIT PROJECT
  commit_project
  # TOOLS CHANGELOG
  tools
  # PUBLISH NODEFONY
  publish_nodefony
}

menu () {
  declare -a commands=("publish" "changelog" "Quit");
  # MENU
  select yn in ${commands[@]}; do
    case $yn in
      "changelog" )
        generate_changelog;
        break ;;
      "publish" )
        publish ;
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
  "commit_project" )
    commit_project;
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
