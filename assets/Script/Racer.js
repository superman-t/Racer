const Utils = require('Utils');
const ren = require('Render');
const Render = ren.Render
const COLORS = ren.COLORS;
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
        var maxy = this.height;

        var n, segment;

        // cc.log(baseSegment.looped, baseSegment.index);
        for (n = 0; n < this.drawDistance; n++) {

            segment = this.segments[(baseSegment.index + n) % this.segments.length ];
            segment.looped = segment.index < baseSegment.index;
            segment.fog = Utils.exponentialFog(n / this.drawDistance, this.fogDensity);
            
            Utils.project(segment.p1, (this.playerX * this.roadWidth), this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height*0.6, this.roadWidth);
            Utils.project(segment.p2, (this.playerX * this.roadWidth), this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height*0.6, this.roadWidth);

            if ((segment.p1.camera.z < this.cameraDepth) || // behind us
                (segment.p2.screen.y > maxy)) // clip by (already rendered) segment
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



    resetRoad: function () {
        this.segments = [];
        for (var n = 0; n < this.totalSegments; n++) {
            this.segments.push({
                index: n,
                p1: {
                    world: {
                        z: n * this.segmentLength
                    },
                    camera: {},
                    screen: {}
                },
                p2: {
                    world: {
                        z: (n + 1) * this.segmentLength
                    },
                    camera: {},
                    screen: {}
                },
                color: Math.floor(n / this.rumbleLength) % 2 ? COLORS.DARK : COLORS.LIGHT
            });
        }

        this.segments[this.findSegment(this.playerZ).index + 2].color = COLORS.START;
        this.segments[this.findSegment(this.playerZ).index + 3].color = COLORS.START;
        for (var n = 0; n < this.rumbleLength; n++)
            // this.segments[this.segments.length - 1 - n].color = COLORS.FINISH;

        this.trackLength = this.segments.length * this.segmentLength;
    },

    findSegment: function (z) {
        return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
    },
});