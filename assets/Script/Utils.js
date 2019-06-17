// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var Utils = {
    increase: function (start, increment, max) { // with looping
        var result = start + increment;
        while (result >= max)
            result -= max;
        while (result < 0)
            result += max;
        return result;
    },

    percentRemaining: function( n, total)
    {
        return (n % total) / total;
    },

    interpolate: function(a, b, percent)
    {
        return a + (b - a) * percent;
    },
    
    easeIn: function(a, b, percent)
    {
        return a + (b - a) * Math.pow(percent, 2);
    },

    easeOut: function(a, b, percent)
    {
        return a + (b - a) * (1 - Math.pow( 1 - percent, 2));
    },

    easeInOut: function( a, b, percent)
    {
        return a + (b - a) * (-Math.cos(percent * Math.PI)/2 + 0.5);
    },

    project: function (p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
        p.camera.x = (p.world.x || 0) - cameraX;
        p.camera.y = (p.world.y || 0) - cameraY;
        p.camera.z = (p.world.z || 0) - cameraZ;
        p.screen.scale = cameraDepth / p.camera.z;
        p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
        p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
        p.screen.w = Math.round((p.screen.scale * roadWidth * width / 2));
    },

    overlap: function (x1, w1, x2, w2, percent) {
        var half = (percent || 1) / 2;
        var min1 = x1 - (w1 * half);
        var max1 = x1 + (w1 * half);
        var min2 = x2 - (w2 * half);
        var max2 = x2 + (w2 * half);
        return !((max1 < min2) || (min1 > max2));
    },

    exponentialFog: function (distance, density) {
        return 1 / (Math.pow(Math.E, (distance * distance * density)));
    },


};

module.exports = Utils;