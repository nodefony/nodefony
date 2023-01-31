class User {
  constructor (
    username,
    password,
    roles = [],
    lang = "en-en",
    enabled = true,
    userNonExpired = true,
    credentialsNonExpired = true,
    accountNonLocked = true,
    name = "",
    surname = "",
    email = "",
    gender = "",
    url = "",
    image = ""
  ) {
    if (username === "" || username === null || undefined === username) {
      throw new Error("The username cannot be empty.");
    }
    this.username = username;
    this.password = password;
    this.roles = roles;
    this.lang = lang;
    this.enabled = enabled;
    this.accountNonExpired = userNonExpired;
    this.credentialsNonExpired = credentialsNonExpired;
    this.accountNonLocked = accountNonLocked;
    this.name = name;
    this.surname = surname;
    this.email = email;
    this.gender = gender;
    this.url = url;
    this.image = image;
  }

  getRoles () {
    return this.roles;
  }

  hasRole (name) {
    for (const role in this.roles) {
      if (this.roles[role] === name) {
        return true;
      }
    }
    return false;
  }

  isGranted (role) {
    return this.hasRole(role);
  }

  getPassword () {
    return this.password;
  }

  getUsername () {
    return this.username;
  }

  displayName () {
    return `${this.name} ${this.surname}`;
  }

  isAccountNonExpired () {
    return this.accountNonExpired;
  }

  isAccountNonLocked () {
    return this.accountNonLocked;
  }

  isCredentialsNonExpired () {
    return this.credentialsNonExpired;
  }

  isEnabled () {
    return this.enabled;
  }

  serialize () {
    return {
      username: this.username,
      name: this.name,
      surname: this.surname,
      roles: this.roles,
      lang: this.lang,
      enabled: this.enabled,
      accountNonExpired: this.accountNonExpired,
      credentialsNonExpired: this.credentialsNonExpired,
      accountNonLocked: this.accountNonLocked
    };
  }

  unserialize (user) {
    if (user) {
      for (const ele in user) {
        this[ele] = user[ele];
      }
    }
  }
}

nodefony.User = User;
module.exports = User;
