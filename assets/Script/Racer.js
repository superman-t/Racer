const Utils = require('Utils');
const ren = require('Render');
const Render = ren.Render
const COLORS = ren.COLORS;
const ROAD = ren.ROAD;
const BACKGROUND = ren.BACKGROUND;

cc.game.setFrameRate(60);

cc.Class({
    extends: cc.Component,

    properties: {
        ctx: {
            default: null,
            type: cc.Graphics,
            visible: false,
        },
        segments: [],
        totalSegments: 200,
        segmentLength: 200,
        roadWidth: 200,
        rumbleLength: 3,
        lanes: 3,
        fieldOfView: 100,
        cameraHeight: 1000,
        cameraDepth: {
            default:0,
            visible: false,
        },
        drawDistance: 300,
        fogDensity: 5,
        position: {
            default: 0,
            visible: false,
        },
        trackLength: {
            default: 0,
            visible: false,
        },
        speed: 30,
        playerZ: {
            default: 0,
            visible: false,
        },
        playerX: 0,
        interval:{
            default: 2,
            visible: false,
        }
    },

    onEnable: function () {
        this.cameraDepth = 1 / Math.tan((this.fieldOfView / 2) * Math.PI / 180);
        this.playerZ = (this.cameraHeight * this.cameraDepth);
        this.width = cc.winSize.width;
        this.height = cc.winSize.height;
        this.position = 0.01;
    },

    // use this for initialization
    onLoad: function () {
        cc.director.setDisplayStats(true);
        this.ctx = this.getComponent(cc.Graphics);
        this.resetRoad();
    },

    // called every frame
    update: function (dt) {
        this.interval -= dt;
        // if ( this.interval < 0)
        {
            this.ctx.clear();
            this.interval = 2;
        }
        this.position = Utils.increase(this.position, this.speed, this.trackLength);
    },

    lateUpdate: function()
    {
        var baseSegment = this.findSegment(this.position);
        var basePercent = Utils.percentRemaining(this.position, this.segmentLength);
        var playerSegment = this.findSegment(this.position + this.playerZ);
        var playerPercent = Utils.percentRemaining(this.position + this.playerZ, this.segmentLength);
        var playerY       = Utils.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);

        var maxy = this.height;

        var x = 0;
        var dx = -(baseSegment.curve * basePercent);

        var n, segment;

        // cc.log(baseSegment.looped, baseSegment.index);
        for (n = 0; n < this.drawDistance; n++) {

            segment = this.segments[(baseSegment.index + n) % this.segments.length ];
            segment.looped = segment.index < baseSegment.index;
            segment.fog = Utils.exponentialFog(n / this.drawDistance, this.fogDensity);

            Utils.project(segment.p1, (this.playerX * this.roadWidth) - x, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height*0.6, this.roadWidth);
            Utils.project(segment.p2, (this.playerX * this.roadWidth) - x - dx, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height*0.6, this.roadWidth);

            x = x + dx;
            dx = dx + segment.curve;

            if ((segment.p1.camera.z < this.cameraDepth) || // behind us
                (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
                (segment.p2.screen.y >= maxy)) // clip by (already rendered) segment
                continue;

            Render.segment(this.ctx, this.width, this.lanes,
                segment.p1.screen.x,
                segment.p1.screen.y,
                segment.p1.screen.w,
                segment.p2.screen.x,
                segment.p2.screen.y,
                segment.p2.screen.w,
                segment.fog,
                segment.color);

            maxy = segment.p2.screen.y;
        }
    },

    resetRoad: function (curve) {
        this.segments = [];

        this.addStraight(ROAD.LENGTH.SHORT/4);
        this.addHill(ROAD.LENGTH.SHORT, ROAD.HILL.LOW);
        this.addLowRollingHills();
        this.addSCurves();
        this.addStraight(ROAD.LENGTH.LONG);
        this.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM);
        this.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM);
        this.addStraight();
        this.addLowRollingHills();
        this.addSCurves();
        this.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM);
        this.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM);
        this.addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
        this.addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
        this.addStraight();
        this.addSCurves();
        this.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.EASY);
        this.addDownhillToEnd();

        this.segments[this.findSegment(this.playerZ).index + 2].color = COLORS.START;
        this.segments[this.findSegment(this.playerZ).index + 3].color = COLORS.START;
        for (var n = 0; n < this.rumbleLength; n++)
            // this.segments[this.segments.length - 1 - n].color = COLORS.FINISH;

        this.trackLength = this.segments.length * this.segmentLength;
    },

    lastY: function()
    {
        return this.segments.length == 0 ? 0 : this.segments[this.segments.length - 1].p2.world.y;  
    },

    addSegment: function(curve, y)
    {
        var n = this.segments.length;
        this.segments.push({
            index: n,
            p1: {
                world: {
                    y: this.lastY(),
                    z: n * this.segmentLength
                },
                camera: {},
                screen: {}
            },
            p2: {
                world: {
                    y: y,
                    z: (n + 1) * this.segmentLength
                },
                camera: {},
                screen: {}
            },
            curve: curve,
            color: Math.floor(n / this.rumbleLength) % 2 ? COLORS.DARK : COLORS.LIGHT
        });
    },
    
    addRoad: function(enter, hold, leave, curve, y)
    {
        var startY = this.lastY();
        var endY = startY + y * this.segmentLength;
        var total = enter + hold + leave;
        var n;
        for(n = 0; n < enter; n++)
        {
            this.addSegment(Utils.easeIn(0, curve, n/enter), Utils.easeInOut(startY, endY, n/total));
        }
        for(n = 0; n < hold; n++)
            this.addSegment(curve, Utils.easeInOut(startY, endY, (enter + n)/total));

        for(n = 0; n < leave; n++)
        {
            this.addSegment(Utils.easeInOut(curve, 0, n/leave), Utils.easeInOut(startY, endY, (enter + hold + n)/total));
        }
    },

    addHill: function(num, height)
    {
        num = num || ROAD.LENGTH.MEDIUM;
        height = height || ROAD.HILL.MEDIUM;
        this.addRoad(num, num, num, 0, height);
    },

    addLowRollingHills: function(num, height)
    {
        num    = num    || ROAD.LENGTH.SHORT;
        height = height || ROAD.HILL.LOW;
        this.addRoad(num, num, num,  0,  height/2);
        this.addRoad(num, num, num,  0, -height);
        this.addRoad(num, num, num,  0,  height);
        this.addRoad(num, num, num,  0,  0);
        this.addRoad(num, num, num,  0,  height/2);
        this.addRoad(num, num, num,  0,  0);
    },

    addDownhillToEnd: function(num)
    {
        num = num || 200;
        this.addRoad(num, num, num, ROAD.CURVE.EASY, -this.lastY()/this.segmentLength);
    },


    addStraight: function(num)
    {
        num = num || ROAD.LENGTH.MEDIUM;
        this.addRoad(num, num, num, 0, 0);
    },

    addCurve: function( num, curve, height)
    {
        num = num || ROAD.LENGTH.MEDIUM;
        curve = curve || ROAD.CURVE.MEDIUM;
        height = height || ROAD.HILL.MEDIUM;
        this.addRoad(num, num, num, curve, height);
    },

    addSCurves: function () {
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY, ROAD.HILL.MEDIUM);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY, -ROAD.HILL.LOW);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY, -ROAD.HILL.MEDIUM);
    },

    findSegment: function (z) {
        return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
    },
});