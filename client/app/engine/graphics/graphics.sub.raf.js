/**
 * A kind polyfill for requestAnimationFrame compatibility.
 */

'use strict';

(function() {
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    var lastTime = 0;

    if(! ('performance' in window)) {
        window.performance = {};
    }

    if(!Date.now) {
        Date.now = function() { return new Date().getTime(); };
    }

    if (! ('now' in window.performance)) {
        var nowOffset = Date.now();
        if(performance.timing && performance.timing.navigationStart) {
            nowOffset = performance.timing.navigationStart;
        }
        window.performance.now = function() { return (Date.now() - nowOffset); };
    }

    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if(!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = Date.now();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {callback(currTime + timeToCall);},
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if(!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

}) ();