/**
 *    @Route ("/users")
 */
module.exports = class usersController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
    // CSRF cross-site request forgery
    this.setCsrfToken("nodefony_csrf", {
      secret: "Les longs sanglots de l'hiver",
      cookie: {
        signed: false,
        secure: true,
        path: "/users",
        maxAge: 200
      },
      ignoreMethods: ["GET"]
    });
    this.entity = this.getEntity("user");
    this.ormName = this.getOrm().name;
  }

  /**
   *    @Method ({"GET", "POST"})
   *    @Route ( "/create", name="nodefony-user-create")
   *
   */
  createAction() {
    switch (this.method) {
    case "GET":
      return this.render("app:users:createUser.html.twig", {
        langs: this.get("translation").getLangs(),
        locale: this.getLocale()
      });
    case "POST":
      // FORM DATA
      if (nodefony.typeOf(this.query.roles) === "string") {
        this.query.roles = [this.query.roles];
      }
      this.checkAuthorisation(null, this.query);
      return this.create()
        .then((user) => {
          let message = `${this.translate("added", "users")} ${user.username}`;
          this.setFlashBag("info", message);
          this.logger(message, "INFO");
          return this.redirectToRoute("home");
        })
        .catch((error) => {
          this.setFlashBag("error", error.message);
          this.logger(error, "ERROR");
          return this.redirectToRoute("nodefony-user-create");
        });
    default:
      throw new Error("Bad Method");
    }
  }

  /**
   *    @Method ({"GET","POST", "PUT"})
   *    @Route ( "/update/{username}", name="nodefony-user-update")
   */
  updateAction(username) {
    this.checkAuthorisation(username, this.query);
    switch (this.method) {
    case "GET":
      return this.findOne(username)
        .then((result) => {
          if (result) {
            return this.render("app:users:createUser.html.twig", {
              user: result,
              langs: this.get("translation").getLangs(),
              locale: this.getLocale()
            });
          }
          throw new Error(`User ${username} not found`);
        }).catch(e => {
          throw e;
        });
    case "PUT":
    case "POST":
      return this.findOne(username)
        .then((user) => {
          if (nodefony.typeOf(this.query.roles) === "string") {
            this.query.roles = [this.query.roles];
          }
          let value = {
            username: this.query.username || null,
            email: this.query.email,
            name: this.query.name,
            surname: this.query.surname,
            gender: this.query.gender,
            roles: this.query.roles || [],
            lang: this.query.lang
          };
          if (this.query.passwd && this.query["old-passwd"]) {
            let encoder = this.getNodefonyEntity("user").getEncoder();
            let check = encoder.isPasswordValid(this.query["old-passwd"], user.password);
            if (check) {
              value.password = this.query.passwd;
            } else {
              throw new Error(`User ${username} bad passport`);
            }
          }
          if (user) {
            return this.update(user, value)
              .then(() => {
                let message = `Update User ${user.username} OK`;
                this.setFlashBag("info", message);
                this.logger(message, "INFO");
                return this.redirectToRoute("home");
              });
          }
          throw new Error(`User ${username} not found`);
        })
        .catch((error) => {
          this.setFlashBag("error", error.message);
          this.logger(error, "ERROR");
          return this.redirectToRoute("nodefony-user-update", {
            username: username
          });
        });
    default:
      throw new Error("Bad Method");
    }
  }

  /**
   *    @Method ({"GET", "POST", "DELETE"})
   *    @Route ("/delete/{username}", name="nodefony-user-delete")
   *
   */
  deleteAction(username) {
    this.checkAuthorisation(username);
    return this.findOne(username)
      .then((user) => {
        if (user) {
          return this.delete(user)
            .then((result) => {
              let message = `Delete User ${result.username} OK`;
              this.setFlashBag("info", message);
              if (this.getUser().username === username) {
                this.session.invalidate();
              }
              return this.redirectToRoute("nodefony-user");
            }).catch(e => {
              this.logger(e, "ERROR");
              this.setFlashBag("error", e.message);
              return this.redirectToRoute("nodefony-user");
            });
        }
        let error = new nodefony.Error(`User ${username} not found`, this.context);
        this.setFlashBag("error", error.message);
        this.logger(error, "ERROR");
        return this.redirectToRoute("nodefony-user");
      }).catch(e => {
        throw e;
      });
  }

  /**
   *    @Method ({"GET", "PUT", "POST", "DELETE"})
   *    @Route ( "/{username}",name="nodefony-user",defaults={"username" = ""})
   *
   */
  userAction(username) {
    if (username) {
      switch (this.method) {
      case "PUT":
        return this.updateAction(username);
      case "DELETE":
        return this.deleteAction(username);
      case "GET":
        return this.findOne(username)
          .then((result) => {
            return this.render("app:users:readUsers.html.twig", {
              users: [result]
            });
          }).catch(e => {
            throw e;
          });
      }
    }
    switch (this.method) {
    case "POST":
      return this.createAction();
    default:
      return this.find()
        .then((result) => {
          return this.render("app:users:readUsers.html.twig", {
            users: result
          });
        }).catch(e => {
          throw e;
        });
    }
  }

  checkAuthorisation(username, query) {
    let granted = this.is_granted("ROLE_ADMIN");
    if (username) {
      let user = this.getUser();
      if (!user) {
        throw new nodefony.authorizationError("Unauthorized", 401, this.context);
      }
      if (user.username !== username) {
        if (!granted) {
          throw new nodefony.authorizationError("Unauthorized Role", 401, this.context);
        }
      }
    }
    if (query && query.role && query.role.length) {
      if (query.role.indexOf("ROLE_ADMIN") >= 0 && (!granted)) {
        throw new nodefony.authorizationError("Unauthorized Role", 401, this.context);
      }
    }
    return true;
  }

  find() {
    switch (this.ormName) {
    case "mongoose":
      return this.entity.find();
    case "sequelize":
      return this.entity.findAll();
    }
  }

  findOne(username) {
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
      });
    }
  }

  update(user, value) {
    switch (this.ormName) {
    case "mongoose":
    case "sequelize":
      return user.update(value);
    }
  }

  create() {
    switch (this.ormName) {
    case "mongoose":
    case "sequelize":
      return this.entity.create({
        username: this.query.username || null,
        email: this.query.email,
        password: this.query.passwd,
        name: this.query.name,
        surname: this.query.surname,
        gender: this.query.gender,
        roles: this.query.roles
      });
    }
  }

  delete(user) {
    switch (this.ormName) {
    case "mongoose":
      return user.remove({
        force: true
      });
    case "sequelize":
      return user.destroy();
    }
  }

};