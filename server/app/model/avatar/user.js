/**
 * User model.
 */

'use strict';

import Factory from './../factory';

class User {

    constructor(hub, socket, nick, id) {
        // Model
        this._hub = hub;
        this._usercon = Factory.createUserCon(this, socket);
        this._nick = nick;
        this._id = id;

        // States
        this._ingame = false;
        this._player = null;
    }

    // Model
    get hub() { return this._hub; }
    get id() { return this._id; }
    get connection() { return this._usercon; }

    get nick() { return this._nick; }
    set nick(nick) { this._nick = nick; }
    get ingame() { return this._ingame; }
    set ingame(value) { if (value) this._ingame = value; }

    /**
     * Send a message to this user through its UserCon.
     * @param kind
     * @param data
     */
    send(kind, data) {
        this._usercon.send(kind, data);
    }

    /**
     * Requests the hub to create a new gaming pool.
     * @param data
     * @returns {*}
     */
    requestNewGame(data) {
        return this._hub.requestNewGame(this, data);
    }

    /**
     * Join a specific game.
     */
    join(kind, gameId) {
        this._ingame = true;
        var game = this._hub.getGame(kind, gameId);
        if (!game) return false;

        // Stop listening for general game management events...
        // Prevents the user from joining multiple games.
        this._usercon.idle();

        // Create a player associated to this game and spawn it
        var player = Factory.createPlayer(this, game);
        this._player = player;
        game.addPlayer(player);
        return true;
    }

    fetchHubState() {
        let games = this._hub.listGames();
        if (Object.keys(games).length < 1) {
            this._usercon.send('hub', games);
            return;
        }

        for (let kind in games) {
            if (games[kind] instanceof Array && games[kind].length > 0) {
                this._usercon.send('hub', games);
                return;
            }
        }

        setTimeout(_ => {
            if (this.hasOwnProperty('_hub')) {
                this.fetchHubState();
            }
        }, 2000);
    }

    /**
     * Leave all games (current game). Stay idle.
     */
    leave() {
        this._ingame = false;
        if (this._player) {
            this._player.leave();
            this._player.destroy(); // OK given player.leave() was called
            // So player does not belong to its game model.
            this._player = null;
        }
        this._usercon.listen();
    }

    /**
     * Disconnect from ingame socket. Stay inside game model.
     * Maybe the connection will come back.
     */
    disconnect() {
        // Do not destroy player (account for unexpected disconnections)
        if (this._player) this._player.disconnect();
    }

    // Clean references.
    destroy() {
        this._usercon.destroy();
        // Do not destroy player before its game ends.
        // Useful for user reconnection...
        // if (this._player) this._player.destroy();

        delete this._usercon;
        delete this._player;
        delete this._hub;
        delete this._nick;
        delete this._id;
        delete this._ingame;
    }

}

export default User;
