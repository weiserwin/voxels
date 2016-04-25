/**
 * Communication with the server.
 */

'use strict';

App.Engine.Connection = function(app) {
    this.app = app;
    this.socket = {};
};

App.Engine.Connection.prototype.setup = function(autoconfig) {
    // Create socket.
    var promise = this.registerSocketDefault(autoconfig);

    // Define custom listeners on this socket.
    this.registerSocketCustom(this.socket);

    // This promise waits for the server to confirm connection.
    return promise;
};

App.Engine.Connection.prototype.registerSocketDefault = function(autoconfig) {
    var socketAddress = '';

    if (!autoconfig && location.hostname !== 'localhost') {
        socketAddress = 'ws://' + location.hostname + ':8000';
    }

    this.socket = io(socketAddress, {
        // Send auth token on connection, you will need to DI the Auth service above
        // 'query': 'token=' + Auth.getToken()
        path: '/socket.io-client'
    });

    return new Promise(function(resolve) {
        // Validate when 'connected' message is received.
        var f = function() {
            // Un-register listener to avoid performance leak.
            this.socket.removeListener('connected', f);
            resolve();
        }.bind(this);

        // Listen for connection.
        this.socket.on('connected', f);
    }.bind(this));
};

App.Engine.Connection.prototype.registerSocketCustom = function(socket) {
    socket.on('moved', function(data) {
       console.log('server: moved ' + data);
    });

    socket.on('stamp', function(data) {
        this.app.updateWorld(data);
    }.bind(this));
};

App.Engine.Connection.prototype.send = function(message, content) {
    this.socket.emit(message, content);
};

App.Engine.Connection.prototype.move = function(direction) {
    this.socket.emit('move', direction);
};