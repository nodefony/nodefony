module.exports = nodefony.register('User', () => {

  const User = class User {

    constructor(username, password, roles = [], enabled = true, userNonExpired = true, credentialsNonExpired = true, userNonLocked = true) {
      if ('' === username || null === username || undefined === username) {
        throw new Error('The username cannot be empty.');
      }
      this.username = username;
      this.password = password;
      this.enabled = enabled;
      this.accountNonExpired = userNonExpired;
      this.credentialsNonExpired = credentialsNonExpired;
      this.accountNonLocked = userNonLocked;
      this.roles = roles;
    }

    getRoles() {
      return this.roles;
    }

    getPassword() {
      return this.password;
    }

    getUsername() {
      return this.username;
    }

    isAccountNonExpired() {
      return this.accountNonExpired;
    }

    isAccountNonLocked() {
      return this.accountNonLocked;
    }

    isCredentialsNonExpired() {
      return this.credentialsNonExpired;
    }

    isEnabled() {
      return this.enabled;
    }

  };

  return User;
});