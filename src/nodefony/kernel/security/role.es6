module.exports = nodefony.register('Role', () => {

  class Role {
    constructor(role) {
      this.role = role;
    }

    getRole() {
      return this.role;
    }
  }
  return Role;
});