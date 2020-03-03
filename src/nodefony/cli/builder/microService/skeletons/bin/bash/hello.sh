#!/usr/bin/env bash
version=`nodefony version`;

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
