# Welcome to redis-bundle







## redis-cli
 ```
CONFIG SET requirepass "nodefony"
ACL SETUSER nodefony on >nodefony
#ACL SETUSER nodefony ~* &* +@all
ACL SETUSER nodefony on >nodefony ~* &* +@all

ACL LIST
 ```


## DOCKER
