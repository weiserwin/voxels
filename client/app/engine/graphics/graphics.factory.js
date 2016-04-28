/**
 *
 */

'use strict';

App.Engine.Graphics.prototype.getScene = function() {
    return new THREE.Scene();
};

App.Engine.Graphics.prototype.getRenderer = function() {
    // Configure renderer
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setClearColor(0xff00ff, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
};

App.Engine.Graphics.prototype.getCamera = function() {
    var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.set(0, -30, 50);
    return camera;
};
