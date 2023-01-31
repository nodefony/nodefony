module.exports = {

  Query: {
    async getActivity (obj, field, context, info) {
      const {
        username
      } = field;
      const security = context.get("security");
      const jwtFactory = security.getFactory("jwt");
      const orm = context.getORM();
      // const ormName = context.kernel.getOrm();
      const jwtEntity = orm.getEntity("jwt");
      const userEntity = orm.getEntity("user");
      const options = {
        include: [{
          model: userEntity,
          required: true
        }]
      };
      if (username) {
        options.where = {
          username
        };
      }
      return jwtEntity.findAndCountAll(options)
        .then((res) => res.rows.map((item) => ({
          jwt: item,
          decode: jwtFactory.decodeJwtToken(item.token)
        })));
    }
  },

  Mutation: {

  }

};
