class LocalStorage {
  constructor() {
    this.storage = window.localStorage;
  }

  get token() {
    return this.storage.getItem('user-token') || null;
  }
  set token(value) {
    this.storage.setItem('user-token', value);
  }

  get refreshToken() {
    return this.storage.getItem('user-refresh-token') || null;
  }
  set refreshToken(value) {
    this.storage.setItem('user-refresh-token', value);
  }

  clearToken(refresh = false) {
    if (refresh) {
      this.storage.removeItem('user-refresh-token');
      delete this.refreshToken;
    }
    this.storage.removeItem('user-token');
    delete this.token;
  }
}

export default LocalStorage;