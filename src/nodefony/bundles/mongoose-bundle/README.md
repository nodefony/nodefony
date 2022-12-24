# Welcome to mongoose-bundle


## mongodb tools  

- MongoDB Compass  (Compass)[https://www.mongodb.com/try/download/compass]
- MongoDB Shell    (Shell)[https://www.mongodb.com/try/download/shell]

## Docker
  https://hub.docker.com/_/mongo

## Create User for mongo
```
mongosh > use nodefony
mongosh > db.createUser({user:"nodefony",pwd:"nodefony",roles:[{ role:"readWrite",db:"nodefony"}]})

```
