module.exports = {
  //  provides all functions for each API endpoint
  async user(field, context) {
    const usersService = context.get("users");
    return await usersService.findOne(field.username);
  },

  async users(field, context) {
    const usersService = context.get("users");
    let res = await usersService.find();
    return res.rows   ;
  },

  async addUser(field, context) {
    const usersService = context.get("users");
    let res = await usersService.create(field);
    return res;
  }
}
