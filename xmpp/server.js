const { createServer } = require('net');
const { EventEmitter } = require('events');
const xml = require('xml');

class XMPPServer extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map();
    this.server = null;
  }

  start(port = 5222) {
    this.server = createServer((socket) => {
      const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
      console.log(`[XMPP] Client connected: ${clientId}`);

      const client = {
        socket,
        id: clientId,
        accountId: null,
        displayName: null,
        authenticated: false,
        buffer: ''
      };

      this.clients.set(clientId, client);

      socket.on('data', (data) => {
        client.buffer += data.toString();
        this.handleData(client);
      });

      socket.on('close', () => {
        console.log(`[XMPP] Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      socket.on('error', (error) => {
        console.error(`[XMPP] Socket error for ${clientId}:`, error.message);
      });

      this.sendStreamHeader(client);
    });

    this.server.listen(port, () => {
      console.log(`[XMPP Server] Started on port ${port}`);
    });

    this.server.on('error', (error) => {
      console.error('[XMPP Server] Error:', error);
    });
  }

  handleData(client) {
    const streamStartMatch = client.buffer.match(/<stream:stream[^>]*>/);
    if (streamStartMatch) {
      client.buffer = client.buffer.substring(streamStartMatch.index + streamStartMatch[0].length);
      this.sendStreamFeatures(client);
      return;
    }

    const authMatch = client.buffer.match(/<auth[^>]*>(.*?)<\/auth>/s);
    if (authMatch) {
      client.buffer = client.buffer.substring(authMatch.index + authMatch[0].length);
      this.handleAuth(client, authMatch[1]);
      return;
    }

    const iqMatch = client.buffer.match(/<iq[^>]*>(.*?)<\/iq>/s);
    if (iqMatch) {
      client.buffer = client.buffer.substring(iqMatch.index + iqMatch[0].length);
      this.handleIQ(client, iqMatch[0]);
      return;
    }

    const presenceMatch = client.buffer.match(/<presence[^>]*>(.*?)<\/presence>/s);
    if (presenceMatch) {
      client.buffer = client.buffer.substring(presenceMatch.index + presenceMatch[0].length);
      this.handlePresence(client, presenceMatch[0]);
      return;
    }

    const messageMatch = client.buffer.match(/<message[^>]*>(.*?)<\/message>/s);
    if (messageMatch) {
      client.buffer = client.buffer.substring(messageMatch.index + messageMatch[0].length);
      this.handleMessage(client, messageMatch[0]);
      return;
    }
  }

  sendStreamHeader(client) {
    const header = `<?xml version='1.0'?><stream:stream xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' from='prod.ol.epicgames.com' id='${client.id}' version='1.0'>`;
    client.socket.write(header);
  }

  sendStreamFeatures(client) {
    const features = `<stream:features><mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><mechanism>PLAIN</mechanism></mechanisms><ver xmlns='urn:xmpp:features:rosterver'/><starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'/><compression xmlns='http://jabber.org/features/compress'><method>zlib</method></compression><auth xmlns='http://jabber.org/features/iq-auth'/></stream:features>`;
    client.socket.write(features);
  }

  handleAuth(client, authData) {
    try {
      const decoded = Buffer.from(authData.trim(), 'base64').toString('utf-8');
      const parts = decoded.split('\0');
      
      if (parts.length >= 3) {
        client.accountId = parts[1];
        client.displayName = parts[1];
        client.authenticated = true;

        const success = `<success xmlns='urn:ietf:params:xml:ns:xmpp-sasl'/>`;
        client.socket.write(success);

        console.log(`[XMPP] Client authenticated: ${client.accountId}`);
      } else {
        const failure = `<failure xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><not-authorized/></failure>`;
        client.socket.write(failure);
      }
    } catch (error) {
      console.error('[XMPP] Auth error:', error);
      const failure = `<failure xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><not-authorized/></failure>`;
      client.socket.write(failure);
    }
  }

  handleIQ(client, iqStanza) {
    const idMatch = iqStanza.match(/id=['"]([^'"]+)['"]/);
    const typeMatch = iqStanza.match(/type=['"]([^'"]+)['"]/);
    
    if (!idMatch || !typeMatch) return;

    const id = idMatch[1];
    const type = typeMatch[1];

    if (iqStanza.includes('<bind')) {
      const bindResponse = `<iq type='result' id='${id}'><bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'><jid>${client.accountId}@prod.ol.epicgames.com/V2:Fortnite:WIN::${client.id}</jid></bind></iq>`;
      client.socket.write(bindResponse);
      return;
    }

    if (iqStanza.includes('<session')) {
      const sessionResponse = `<iq type='result' id='${id}'><session xmlns='urn:ietf:params:xml:ns:xmpp-session'/></iq>`;
      client.socket.write(sessionResponse);
      return;
    }

    if (iqStanza.includes('<query') && iqStanza.includes('jabber:iq:roster')) {
      const rosterResponse = `<iq type='result' id='${id}'><query xmlns='jabber:iq:roster'></query></iq>`;
      client.socket.write(rosterResponse);
      return;
    }

    if (iqStanza.includes('<ping')) {
      const pongResponse = `<iq type='result' id='${id}' to='${client.accountId}@prod.ol.epicgames.com'/>`;
      client.socket.write(pongResponse);
      return;
    }

    const defaultResponse = `<iq type='result' id='${id}'/>`;
    client.socket.write(defaultResponse);
  }

  handlePresence(client, presenceStanza) {
    if (!client.authenticated) return;

    this.clients.forEach((otherClient, otherId) => {
      if (otherId !== client.id && otherClient.authenticated) {
        const presence = `<presence from='${client.accountId}@prod.ol.epicgames.com' to='${otherClient.accountId}@prod.ol.epicgames.com'><status>Online</status></presence>`;
        otherClient.socket.write(presence);
      }
    });
  }

  handleMessage(client, messageStanza) {
    const toMatch = messageStanza.match(/to=['"]([^'"]+)['"]/);
    if (!toMatch) return;

    const toJid = toMatch[1];
    const toAccountId = toJid.split('@')[0];

    this.clients.forEach((otherClient) => {
      if (otherClient.accountId === toAccountId && otherClient.authenticated) {
        const forwardedMessage = messageStanza.replace(/from=['"][^'"]*['"]/, `from='${client.accountId}@prod.ol.epicgames.com'`);
        otherClient.socket.write(forwardedMessage);
      }
    });
  }

  sendToClient(accountId, stanza) {
    this.clients.forEach((client) => {
      if (client.accountId === accountId && client.authenticated) {
        client.socket.write(stanza);
      }
    });
  }

  broadcastPresence(accountId, status) {
    this.clients.forEach((client) => {
      if (client.authenticated) {
        const presence = `<presence from='${accountId}@prod.ol.epicgames.com' to='${client.accountId}@prod.ol.epicgames.com'><status>${status}</status></presence>`;
        client.socket.write(presence);
      }
    });
  }

  stop() {
    if (this.server) {
      this.clients.forEach((client) => {
        client.socket.end();
      });
      this.server.close();
      console.log('[XMPP Server] Stopped');
    }
  }
}

const xmppServer = new XMPPServer();

module.exports = {
  start: () => xmppServer.start(5222),
  stop: () => xmppServer.stop(),
  server: xmppServer
};
