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

  // CONNECTIONS
  getConnections() {
    return this.connections;
  }

  getConnectionId(connection) {
    return connection.realtimeId;
  }

  setConnection(connection) {
    let host = connection.request.host || connection.request.headers.host;
    const remote = {
      remoteAddress: connection.remoteAddress || connection.request.remoteAddress,
      host: url.parse(host)
    };
    const id = this.generateId();
    connection.realtimeId = id;
    return this.connections[id] = {
      id: id,
      remote: remote,
      context: connection,
      mustClose: false,
      clients: {}
    };
  }

  getConnection(connection) {
    let id = this.getConnectionId(connection);
    return this.connections[id];
  }

  async removeConnection(id) {
    if (this.connections[id]) {
      delete this.connections[id].context.realtimeId;
      await this.removeAllSocket(id)
      delete this.connections[id];
      return true;
    }
    return false;
  }

  // SOCKET
  getSocketId(client) {
    return client.idClient;
  }

  setSocket(idConnection, client) {
    if (this.connections[idConnection]) {
      client.setConnection(idConnection)
      this.connections[idConnection].clients[client.id] = client;
      return client.id;
    } else {
      throw new Error(`Non connection found`);
    }
  }

  getSocket(clientId) {
    for (let connection in this.connections) {
      for (let client in this.connections[connection].clients) {
        if (client === clientId) {
          return this.connections[connection].clients[client];
        }
      }
    }
    return null;
  }

  removeSocket(client) {
    const idConnection = client.idConnection;
    const idClient = client.id;
    if (idConnection && idClient) {
      if (this.connections[idConnection]) {
        return this.connections[idConnection].clients[client].close()
        .then(()=>{
          delete this.connections[idConnection].clients[idClient];
        });
      }
    }
    throw new Error(`Socket ${idClient}, connection : ${idConnection}  not found or already closed`);
  }

  async removeAllSocket(idConnection) {
    if (this.connections[idConnection]) {
      for( let client in this.connections[idConnection].clients ){
        this.connections[idConnection].clients[client].close()
        .then((socket)=>{
          delete this.connections[idConnection].clients[idClient];
          socket.destroy();
        });
      }
    }
  }
};

module.exports = Connections ;
