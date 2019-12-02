 class users extends nodefony.Service {

   constructor(container) {
     super("users", container);
     if (this.kernel.ready) {
       this.initialize();
     } else {
       this.kernel.once("onReady", () => {
         this.initialize();
       });
     }
   }

   initialize() {
     this.orm = this.kernel.getORM();
     this.ormName = this.orm.name;
     this.entity = this.orm.getEntity("user");
   }

   find(query = {}, options = {}) {
     try {
       switch (this.ormName) {
       case "mongoose":
         if (options.limit || options.offset || options.page) {
           return this.entity.paginate(query, {
               page: options.page,
               limit: options.limit,
               offset: options.offset
             })
             .then((res) => {
               return res;
             }).catch(e => {
               throw e;
             });
         }
         return this.entity.find(query, options)
           .then((res) => {
             return res;
           }).catch(e => {
             throw e;
           });
       case "sequelize":
         if (query.limit || query.offset) {
           return this.entity.findAndCountAll(query)
             .then((res) => {
               let tab = [];
               if (!res) {
                 return {
                   total: tab.length,
                   rows: tab
                 };
               }
               res.rows.map((el) => {
                 tab.push(el.get({
                   plain: true
                 }));
               });
               return {
                 total: res.count,
                 rows: tab
               };
             }).catch(e => {
               throw e;
             });
         }
         return this.entity.findAll(query)
           .then((res) => {
             let tab = [];
             if (!res) {
               return {
                 total: tab.length,
                 rows: tab
               };
             }
             res.map((el) => {
               tab.push(el.get({
                 plain: true
               }));
             });
             return {
               total: tab.length,
               rows: tab
             };
           });
       }
     } catch (e) {
       throw e;
     }
   }

   findOne(username) {
     try {
       switch (this.ormName) {
       case "mongoose":
         return this.entity.findOne({
           username: username
         });
       case "sequelize":
         return this.entity.findOne({
             where: {
               username: username
             }
           })
           .then((el) => {
             if (!el) {
               return null;
             }
             return el.get({
               plain: true
             });
           });
       }
     } catch (e) {
       throw e;
     }
   }

   async update(user, value) {
     //console.log(value)
     //console.log(user)
     switch (this.ormName) {
     case "mongoose":
       let session = null;
       try {
         session = await this.orm.startTransaction("user");
         return user.updateOne(value)
           .then((user) => {
             session.commitTransaction();
             return user;
           }).catch(e => {
             session.abortTransaction();
             throw e;
           });
       } catch (e) {
         if (session) {
           session.abortTransaction();
         }
         throw e;
       }
       break;
     case "sequelize":
       let transaction = null;
       try {
         transaction = await this.orm.startTransaction("user");
         const {
           username
         } = user;
         return this.entity.update(value, {
             where: {
               username: username
             }
           }, {
             transaction: transaction
           })
           .then((user) => {
             transaction.commit();
             return user;
           }).catch(e => {
             transaction.rollback();
             throw e;
           });
       } catch (e) {
         if (transaction) {
           transaction.rollback();
         }
         throw e;
       }
     }
   }

   async create(query) {
     switch (this.ormName) {
     case "sequelize":
       let transaction = null;
       try {
         transaction = await this.orm.startTransaction("user");
         return this.entity.create({
             username: query.username || null,
             email: query.email,
             password: query.passwd,
             name: query.name,
             surname: query.surname,
             gender: query.gender,
             roles: query.roles
           }, {
             transaction: transaction
           })
           .then((user) => {
             transaction.commit();
             return user;
           }).catch(e => {
             transaction.rollback();
             throw e;
           });
       } catch (e) {
         if (transaction) {
           transaction.rollback();
         }
         throw e;
       }
       break;
     case "mongoose":
       let session = null;
       try {
         session = await this.orm.startTransaction("user");
         return this.entity.create({
             username: query.username || null,
             email: query.email,
             password: query.passwd,
             name: query.name,
             surname: query.surname,
             gender: query.gender,
             roles: query.roles
           })
           .then((user) => {
             session.commitTransaction();
             return user;
           }).catch(e => {
             session.abortTransaction();
             throw e;
           });
       } catch (e) {
         if (session) {
           session.abortTransaction();
         }
         throw e;
       }
     }
   }

   async delete(username) {
     switch (this.ormName) {
     case "mongoose":
       let session = null;
       try {
         return this.entity.findOne({
             username: username
           })
           .then(async (user) => {
             if (!user) {
               throw new nodefony.Error(`User ${username} not found`);
             }
             session = await this.orm.startTransaction("user");
             return user.remove({
                 force: true
               })
               .then((user) => {
                 session.commitTransaction();
                 return user;
               }).catch(e => {
                 session.abortTransaction();
                 throw e;
               });
           })
           .catch(e => {
             if (session) {
               session.abortTransaction();
             }
             throw e;
           });

       } catch (e) {
         if (session) {
           session.abortTransaction();
         }
         throw e;
       }
       break;
     case "sequelize":
       let transaction = null;
       try {
         return this.entity.findOne({
             where: {
               username: username
             }
           })
           .then(async (user) => {
             if (!user) {
               throw new nodefony.Error(`User ${username} not found`);
             }
             transaction = await this.orm.startTransaction("user");
             return user.destroy({
                 transaction: transaction
               })
               .then((user) => {
                 transaction.commit();
                 return user;
               }).catch(e => {
                 transaction.rollback();
                 throw e;
               });
           });
       } catch (e) {
         if (transaction) {
           transaction.rollback();
         }
         throw e;
       }
     }
   }
 }

 module.exports = users;