module.exports = nodefony.register('Role', () => {

  const Role = class Role {

    constructor(role) {
      this.role = role;
    }

    getRole() {
      return this.role;
    }

  };

  return Role;
});