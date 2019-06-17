// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var COLORS = {
    SKY: '#72D7EE',
    TREE: '#005108',
    FOG: '#005108',
    LIGHT: {
        road: '#6B6B6B',
        grass: '#10AA10',
        rumble: '#555555',
        lane: '#CCCCCC'
    },
    DARK: {
        road: '#696969',
        grass: '#009A00',
        rumble: '#BBBBBB'
    },
    START: {
        road: '#FFFFFF',
        grass: '#FFFFFF',
        rumble: '#FFFFFF'
    },
    FINISH: {
        road: '#000000',
        grass: '#000000',
        rumble: '#000000'
    }
};

var BACKGROUND = {
    HILLS: {
        x: 5,
        y: 5,
        w: 1280,
        h: 480
    },
    SKY: {
        x: 5,
        y: 495,
        w: 1280,
        h: 480
    },
    TREES: {
        x: 5,
        y: 985,
        w: 1280,
        h: 480
    }
};

var ROAD = {
    LENGTH : { NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100},
    CURVE : {  NONE:0, EASY: 2, MEDIUM: 4, HARD: 6},
    HILL: { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60}
};

var Render = {
    polygon: function (ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
        ctx.fillColor = cc.hexToColor(color);
        // cc.log(x1, y1, x2, y2, x3, y3, x4, y4);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.close();
        ctx.fill();
    },

    segment: function (ctx, width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {
        var r1 = Render.rumbleWidth(w1, lanes),
            r2 = Render.rumbleWidth(w2, lanes),
            l1 = Render.laneMarkerWidth(w1, lanes),
            l2 = Render.laneMarkerWidth(w2, lanes),
            lanew1, lanew2, lanex1, lanex2, lane;
        y1 = cc.winSize.height - y1;
        y2 = cc.winSize.height - y2;
        ctx.fillColor = cc.hexToColor(color.grass);
        ctx.rect(0, y2, width, y1 - y2);
        ctx.fill();

        Render.polygon(ctx, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, color.rumble);
        Render.polygon(ctx, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, color.rumble);
        Render.polygon(ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, color.road);

        if (color.lane) {
            lanew1 = w1 * 2 / lanes;
            lanew2 = w2 * 2 / lanes;
            lanex1 = x1 - w1 + lanew1;
            lanex2 = x2 - w2 + lanew2;
            for (lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++)
                Render.polygon(ctx, lanex1 - l1 / 2, y1, lanex1 + l1 / 2, y1, lanex2 + l2 / 2, y2, lanex2 - l2 / 2, y2, color.lane);
        }

        Render.fog(ctx, 0, y1, width, y2 - y1, fog);
    },

    fog: function (ctx, x, y, width, height, fog) {
        // cc.log(x, y, width, height);
        if (fog < 1) {
            ctx.fillColor = cc.hexToColor(COLORS.FOG);
            ctx.fillColor.a = (1.0 - fog) * 255;
            ctx.rect(x, y, width, height);
            ctx.fill();
            ctx.fillColor.a = 255;
        }
    },

    rumbleWidth: function (projectedRoadWidth, lanes) {
        return projectedRoadWidth / Math.max(6, 2 * lanes);
    },
    laneMarkerWidth: function (projectedRoadWidth, lanes) {
        return projectedRoadWidth / Math.max(32, 8 * lanes);
    }
}

module.exports.Render = Render;
module.exports.COLORS = COLORS;
module.exports.BACKGROUND = BACKGROUND;
module.exports.ROAD = ROAD;