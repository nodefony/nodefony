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
  get(url, options) {
    return this.http(url, "get", options);
  }
  post(url, options) {
    return this.http(url, "post", options);
  }
  put(url, options) {
    return this.http(url, "put", options);
  }
  delete(url, options) {
    return this.http(url, "delete", options);
  }

  login(url = "/api/jwt/login", username = null, passwd = null) {
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
  logout(url = "/api/jwt/logout", refreshToken = this.refreshToken, options = {}) {
    return this.post(url, {
      data: {
        refreshToken:  this.refreshToken
      }
    })
      .then(response => {
        this.clearToken(true);
        return response;
      })
      .catch((error) => {
        this.clearToken(true);
        throw error;
      });
  }
  getToken(url = "/api/jwt/token") {
    return axios({
        method: "post",
        url: url,
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
