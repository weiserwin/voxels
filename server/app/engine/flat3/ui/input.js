/**
 *
 */

'use strict';

class UserInput {

    constructor(game) {
        this._game = game;
        this._incoming = new Map();
        this._listeners = {};
    }

    update() {
        // Process incoming actions
        this._incoming.forEach((array, avatar) => {
            if (!avatar || avatar === 'undefined') return;

            // avatar: key; array: value
            array.forEach(e => {
                if (e.action === 'move' && typeof e.meta === "string")
                    // TODO compute means or filter some events.
                    this.move(e.meta, avatar);

                else if (e.action === 'rotate')
                    this.rotate(e.meta, avatar);

                else if (e.action === 'block')
                    this.block(e.meta, avatar);
            });
        });

        // Flush incoming actions.
        this._incoming = new Map();
    }

    move(meta, avatar) {
        var hasMoved = true;
        switch (meta) {
            case 'f' : avatar.goForward();      break;
            case 'r' : avatar.goRight();        break;
            case 'l' : avatar.goLeft();         break;
            case 'b' : avatar.goBackwards();    break;

            case 'fx' : avatar.stopForward();   break;
            case 'rx' : avatar.stopRight();     break;
            case 'lx' : avatar.stopLeft();      break;
            case 'bx' : avatar.stopBackwards(); break;
            case 'xx' : avatar.stop();          break;

            default: hasMoved = false;
        }
    };

    rotate(meta, avatar) {
        if (!(meta instanceof Array)) return;
        var p = meta[0], y = meta[1];
        if (p !== avatar.rotation[0] || y !== avatar.rotation[1]) {
            avatar.rotate(p, y);
            this._game.entityman.entityUpdated(avatar.id);
        }
    }

    block(meta, avatar) {
        if (!(meta instanceof Array)) return;
        var action = meta[0];
        // Manage block addition.
        if (action === "add") {
            this._game.worldman.addBlock(avatar, meta[1], meta[2], meta[3], meta[4]);
        } else if (action === "del") {
            this._game.worldman.delBlock(avatar, meta[1], meta[2], meta[3]);
        }
    }

    push(kind, avatar) {
        return (data => {
            var array = this._incoming.get(avatar);
            if (!array || array === 'undefined') {
                this._incoming.set(avatar, [{action:kind, meta:data}]);
            } else {
                this._incoming.get(avatar).push({action:kind, meta:data});
            }
        });
    }

    listenPlayer(player) {
        let listener = this._listeners[player] = [
            this.push('move', player.avatar),
            this.push('rotate', player.avatar),
            this.push('block', player.avatar),
            this._game.chat.playerInput(player)
        ];

        player.on('m', listener[0]);
        player.on('r', listener[1]);
        player.on('b', listener[2]);
        player.on('chat', listener[3]);
    }

    removePlayer(player) {
        // Do not modify queue.
        // Drop inconsistent players when an update is performed.
        let listener = this._listeners[player];
        if (!listener || listener === null) {
            console.log('WARN: a player which was not listened to left.');
            return;
        }

        player.off('m', listener[0]);
        player.off('r', listener[1]);
        player.off('b', listener[2]);
        player.off('chat', listener[3]);

        delete this._listeners[player];
    }

}

export default UserInput;
