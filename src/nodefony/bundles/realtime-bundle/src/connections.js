/*
 *
 *  CLASS CONNECTION
 *
 */
 class Connections {

  constructor() {
    this.connections = {};
  }

  generateId() {
    return nodefony.generateId()
  }

  getClientId(client) {
    return client.idClient;
  }

  getConnectionId(client) {
    return client.idConnection;
  }

  setConnection(connection, obj) {
    let id = this.generateId();
    connection.id = id;
    this.connections[id] = {
      id: id,
      remote: obj,
      context: connection,
      mustClose: false,
      clients: {}
    };
    return id;
  }

  getConnection(client) {
    let id = this.getConnectionId(client);
    return this.connections[id];
  }

  removeConnection(id) {
    if (this.connections[id]) {
      delete this.connections[id];
      return true;
    }
    return false;
  }

  setClient(idConnection, client) {
    if (this.connections[idConnection]) {
      let idClient = this.generateId();
      client.idClient = idClient;
      client.idConnection = idConnection;
      this.connections[idConnection].clients[idClient] = client;
      return idClient;
    } else {
      throw idConnection;
    }
  }

  getClient(clientId) {
    for (let connection in this.connections) {
      for (let client in this.connections[connection].clients) {
        if (client === clientId) {
          return this.connections[connection].clients[client];
        }
      }
    }
    return null;
  }

  removeClient(client) {
    let idConnection = this.getConnectionId(client);
    let idClient = this.getClientId(client);
    if (idConnection && idClient) {
      if (this.connections[idConnection]) {
        delete this.connections[idConnection].clients[idClient];
        return idClient;
      }
    }
    return false;
  }

  removeAllClientConnection() {
    /*for (let ele in this.connections) {
    }*/
  }
};


module.exports = Connections ;
