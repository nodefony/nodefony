import {
  USER_ERROR,
  USER_LOADING,
  USER_PROFILE,
  USER_REQUEST,
  USER_SUCCESS
} from "../actions/user";

import {
  AUTH_LOGOUT
} from "../actions/auth";

import {
  Api as baseApi
} from "nodefony-client";
const Api = new baseApi("users", {
  baseUrl: "/api/users",
  storage: {
    type: "local"
  }
});

import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
countries.registerLocale(en);
import fr from "i18n-iso-countries/langs/fr.json";
countries.registerLocale(fr);
const reg = /^(..){1}_?(..)?$/;

const state = {
  status: "",
  error: null,
  user: null
};

const getters = {
  getProfile: (state) => state.user,
  getProfileUsername (state) {
    if (state.user) {
      return state.user.username;
    }
  },
  getRoles (state) {
    if (state.user) {
      return state.user.roles;
    }
    return [];
    // throw new Error('User profile not defined !')
  },
  hasRole: (state) => (role) => {
    if (state.user) {
      const res = state.user.roles.indexOf(role);
      if (res >= 0) {
        return true;
      }
      return false;
    }
    return false;
  },
  isProfileLoaded: (state) => state.status === "success",
  getTrigramme (state) {
    if (state.user) {
      const size = state.user.surname.length;
      const trg = `${state.user.name.substr(0, 1)}${state.user.surname.substr(0, 1)}${state.user.surname.substr(size - 1, 1)}`;
      return trg.toLowerCase();
    }
    return "";
  },
  getInitials () {
    if (state.user) {
      const trg = `${state.user.name.substr(0, 1)}${state.user.surname.substr(0, 1)}`;
      return trg.toLowerCase();
    }
  },
  getProfileName (state) {
    if (state.user) {
      return state.user.name;
    }
    return "";
  },
  getProfileSurname (state) {
    if (state.user) {
      return state.user.surname;
    }
    return "";
  },
  getFullName (state) {
    if (state.user) {
      return `${state.user.name} ${state.user.surname}`;
    }
    return "";
  },
  getLocale () {
    // lang/Pays
    if (state.user) {
      const res = reg.exec(state.user.lang);
      if (res) {
        const lang = res[1];
        const country = res[2].toUpperCase();
        try {
          const locale = countries.getName(country, lang, {select: "all"});
          locale.push(countries.alpha3ToAlpha2(locale[2]));
          locale.push(lang);
          return locale;
        } catch (e) {
          return [lang];
        }
      }
    }
    try {
      const locale = countries.getName("US", "en", {select: "all"});
      locale.push(countries.alpha3ToAlpha2(locale[2]));
      return locale;
    } catch (e) {
      return ["en"];
    }
  }

};

const actions = {
  [USER_REQUEST]: ({
    commit,
    dispatch
  }, url) => {
    commit(USER_LOADING);
    return Api.http(url)
      .then((resp) => {
        commit(USER_SUCCESS, resp);
        commit(USER_PROFILE, resp.result);
        return resp;
      })
      .catch((e) => {
        Api.clearToken();
        commit(USER_ERROR, e);
        throw e;
      });
  },
  getAllUsers ({
    commit,
    state
  }) {
    return Api.http("/api/users")
      .then((resp) => resp)
      .catch((e) => {
        throw e;
      });
  }
};

const mutations = {
  [USER_LOADING]: (state) => {
    state.status = "loading";
  },
  [USER_SUCCESS]: (state, resp) => {
    state.status = "success";
    // Vue.set(state, 'profile', resp.result)
  },
  [USER_ERROR]: (state, error) => {
    state.status = "error";
    state.error = error;
    state.user = null;
  },
  [AUTH_LOGOUT]: (state) => {
    state.status = "";
    state.user = null;
  },
  [USER_PROFILE]: (state, user) => {
    state.user = user;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
