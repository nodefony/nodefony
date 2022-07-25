module.exports = {
  //  provides all functions for each API endpoint
  async user(field, context) {
    const user = context.getUser()
    const usersService = context.get("users");
    return await usersService.findOne(field.username,user);
  },

  async users(field, context) {
    const user = context.getUser()
    const usersService = context.get("users");
    let res = await usersService.find({},{}user);
    return res.rows   ;
  },

  async addUser(field, context) {
    const user = context.getUser()
    const usersService = context.get("users");
    let res = await usersService.create(field, user);
    return res;
  }
}
