/*
 *	Token ldap
 */

nodefony.registerToken("ldap", function () {

  const defaultWrapper = function () {
    return {
      username: '',
      name: '',
      surname: '',
      lang: '',
      enabled: true,
      userNonExpired: true,
      credentialsNonExpired: true,
      accountNonLocked: true,
      email: '',
      password: '',
      roles: ["USER"],
      displayName: '',
      url: '',
      gender: '',
      image: ''
    };
  };

  const ISDefined = function (ele) {
    if (ele !== null && ele !== undefined) {
      return true;
    }
    return false;
  };

  const parseParameterString = function (str, value) {
    let ns = null;
    switch (nodefony.typeOf(str)) {
    case "string":
      return parseParameterString.call(this, str.split("."), value);
    case "array":
      switch (str.length) {
      case 1:
        ns = Array.prototype.shift.call(str);
        if (!this[ns]) {
          this[ns] = value;
        } else {
          if (ISDefined(value)) {
            this[ns] = value;
          } else {
            return this[ns];
          }
        }
        return value;
      default:
        ns = Array.prototype.shift.call(str);
        if (!this[ns] && ISDefined(value)) {
          this[ns] = {};
        }
        return parseParameterString.call(this[ns], str, value);
      }
      break;
    default:
      return false;
    }
  };

  class ldapToken extends nodefony.Token {

    constructor(profile, wrapper) {
      super("ldap");
      this.profile = profile;
      this.profileWrapper = wrapper;
      let obj = this.wrapperLdap(this.profile);
      if (obj.username) {
        this.setUser(new nodefony.User(
          obj.username,
          null,
          obj.roles,
          obj.lang,
          obj.enabled,
          obj.userNonExpired,
          obj.credentialsNonExpired,
          obj.accountNonLocked,
          obj.name,
          obj.surname,
          obj.email,
          obj.gender,
          obj.url,
          obj.image));
      }
    }

    wrapperLdap(profile) {
      let obj = {};
      for (let name in this.profileWrapper) {
        let res = parseParameterString.call({
          profile: profile
        }, this.profileWrapper[name], null);
        if (res) {
          obj[name] = res;
        } else {
          obj[name] = "";
        }
      }
      return nodefony.extend(defaultWrapper.call(this), obj);
    }

    serialize() {
      let serial = super.serialize();
      serial.profile = this.profile;
      return serial;
    }

    unserialize(token) {
      this.profile = token.profile;
      return super.unserialize(token);
    }
  }
  return ldapToken;
});