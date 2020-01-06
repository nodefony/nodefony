import axios from 'axios';
import LocalStorage from "./storage/localStorage.js";

class Api extends LocalStorage {

  constructor() {
    try {
      super();
      axios.defaults.headers.common.Accept = 'application/json';
      axios.defaults.headers.common.jwt = this.token;
    } catch (e) {
      throw e;
    }
  }

  get token() {
    return super.token;
  }

  set token(value) {
    super.token = value;
    axios.defaults.headers.common.jwt = value;
  }

  http(url, method, options) {
    // loadah defaultsDeep
    let opt = Object.assign({
      method: method || "get",
      url: url,
      data: null,
      headers: {}
    }, options);
    return axios(opt)
      .then(response => response.data)
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          if (error.response.statusText === "jwt expired") {
            return this.getToken()
              .then(() => {
                return this.http(url, method, opt);
              })
              .catch((e) => {
                throw e;
              });
          }
        }
        throw error;
      });
  }
  get(url, data) {
    return this.http(url, "get", data);
  }
  post(url, data) {
    return this.http(url, "post", data);
  }
  put(url, data) {
    return this.http(url, "put", data);
  }
  delete(url, data) {
    return this.http(url, "delete", data);
  }

  login(url = "/jwt/login", username = null, passwd = null) {
    return axios({
        method: "post",
        url: url,
        data: {
          username: username,
          passwd: passwd
        }
      })
      .then(response => {
        // Here set the header of your ajax library to the token value.
        // example with axios
        // axios.defaults.headers.common['Authorization'] = resp.token
        this.token = response.data.result.token;
        this.refreshToken = response.data.result.refreshToken;
        return response;
      })
      .catch((error) => {
        this.clearToken(true);
        throw error;
      });
  }
  logout(url = "/jwt/logout", options = {}) {
    return this.get(url, options)
      .then(response => {
        this.clearToken(true);
        return response;
      })
      .catch((error) => {
        this.clearToken(true);
        throw error;
      });
  }
  getToken() {
    return axios({
        method: "post",
        url: "/jwt/token",
        data: {
          refreshToken: this.refreshToken
        }
      })
      .then(response => {
        this.token = response.data.result.token;
        return response;
      })
      .catch((error) => {
        this.clearToken(true);
        throw error;
      });
  }
}
export default new Api();