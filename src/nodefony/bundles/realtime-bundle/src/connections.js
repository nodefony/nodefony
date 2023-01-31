/*
 *
 *  CLASS CONNECTION
 *
 */
class Connections {
  constructor () {
    this.connections = {};
  }

  generateId () {
    return nodefony.generateId();
  }

  // CONNECTIONS
  getConnections () {
    return this.connections;
  }

  getConnectionId (connection) {
    return connection.realtimeId;
  }

  setConnection (connection) {
    const host = connection.request.host || connection.request.headers.host;
    const remote = {
      remoteAddress: connection.remoteAddress || connection.request.remoteAddress,
      host: url.parse(host)
    };
    const id = this.generateId();
    connection.realtimeId = id;
    return this.connections[id] = {
      id,
      remote,
      context: connection,
      mustClose: false,
      clients: {}
    };
  }

  getConnection (connection) {
    const id = this.getConnectionId(connection);
    return this.connections[id];
  }

  async removeConnection (id) {
    if (this.connections[id]) {
      delete this.connections[id].context.realtimeId;
      await this.removeAllSocket(id);
      delete this.connections[id];
      return true;
    }
    return false;
  }

  // SOCKET
  getSocketId (client) {
    return client.idClient;
  }

  setSocket (idConnection, client) {
    if (this.connections[idConnection]) {
      client.setConnection(idConnection);
      this.connections[idConnection].clients[client.id] = client;
      return client.id;
    }
    throw new Error("Non connection found");
  }

  getSocket (clientId) {
    for (const connection in this.connections) {
      for (const client in this.connections[connection].clients) {
        if (client === clientId) {
          return this.connections[connection].clients[client];
        }
      }
    }
    return null;
  }

  removeSocket (client) {
    const {idConnection} = client;
    const idClient = client.id;
    if (idConnection && idClient) {
      if (this.connections[idConnection] && this.connections[idConnection].clients[idClient]) {
        return this.connections[idConnection].clients[idClient].close()
          .then(() => {
            delete this.connections[idConnection].clients[idClient];
          });
      }
    }
    throw new Error(`Socket ${idClient}, connection : ${idConnection}  not found or already closed`);
  }

  async removeAllSocket (idConnection) {
    if (this.connections[idConnection]) {
      for (const client in this.connections[idConnection].clients) {
        this.connections[idConnection].clients[client].close()
          .then((socket) => {
            delete this.connections[idConnection].clients[idClient];
            socket.destroy();
          });
      }
    }
  }
}

module.exports = Connections;
