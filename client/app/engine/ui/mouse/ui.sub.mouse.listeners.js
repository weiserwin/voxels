/**
 *
 */

'use strict';

App.Engine.UI.prototype.registerMouseDown = function() {
    $(window).on('mousedown', function(event) {
        if (this.app.stateManager.state !== 'ingame') return; // TODO menu state
        if (event.which === this.buttons.left) {
            this.onLeftMouseDown();
        } else if (event.which === this.buttons.middle) {
            this.onMiddleMouseDown();
        } else if (event.which === this.buttons.right) {
            this.onRightMouseDown();
        }
    }.bind(this));
};

App.Engine.UI.prototype.rayCast = function() {
    var rayCaster = this.app.graphicsEngine.raycaster;

    // var cross = new THREE.Vector2(0, 0); // Normalized device coordinates
    // rayCaster.setFromCamera(cross, this.app.graphicsEngine.camera);

    rayCaster.setFromCamera(new THREE.Vector2(0, 0), this.app.graphicsEngine.camera);
    var terrain = this.app.graphicsEngine.getCloseTerrain();
    return rayCaster.intersectObjects(terrain, true);
};

App.Engine.UI.prototype.onLeftMouseDown = function() {
    console.log("left");
    var ce = this.app.connectionEngine;

    var intersects = this.rayCast();
    if (intersects.length <= 0) {
        console.log('Nothing intersected.');
        return;
    }
    intersects.sort(function(a,b) { return a.distance > b.distance; });
    console.log(intersects);
    var point = intersects[0].point;
    var newBlockType = 1; // TODO user selection for block type.
    ce.send('b', ['add', point.x, point.y, point.z, newBlockType]);
};

App.Engine.UI.prototype.onRightMouseDown = function() {
    console.log("right");
    var ce = this.app.connectionEngine;
    var intersects = this.rayCast();
    if (intersects.length <= 0) {
        console.log('Nothing intersected.');
        return;
    }
    intersects.sort(function(a,b) { return a.distance > b.distance; });
    var point = intersects[0].point;
    ce.send('b', ['del', point.x, point.y, point.z]);
};

App.Engine.UI.prototype.onMiddleMouseDown = function() {
};

App.Engine.UI.prototype.unregisterMouseDown = function() {
    $(window).off('mousedown');
};
