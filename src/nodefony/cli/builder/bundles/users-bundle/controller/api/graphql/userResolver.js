module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    async user(obj, field, context, info) {
      const user = context.getUser()
      const usersService = context.get("users");
      return await usersService.findOne(field.username, user);
    },

    async users(obj, field, context, info) {
      const user = context.getUser()
      const usersService = context.get("users");
      let res = await usersService.find({}, {}, user);
      return res.rows;
    }
  },
  Mutation: {
    async addUser(field, context) {
      const user = context.getUser()
      const usersService = context.get("users");
      let res = await usersService.create(field, user);
      return res;
    }
  }
}
