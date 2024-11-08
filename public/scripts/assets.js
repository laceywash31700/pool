"use strict";

var Game = {};
var sprites = {};
var sounds = {};



Game.loadAssets = function () {
    var loadSprite = function (sprite) {
        const img = new Image();
        img.src = "/assets/sprites/" + sprite;
        return img;
    };

    var loadSound = function (sound) {
        return new Audio("/assets/sounds/" + sound);
    };

    // Load only required assets
    sprites.background = loadSprite("spr_background4.png");
    sprites.ball = loadSprite("spr_ball2.png");
    sprites.redBall = loadSprite("spr_redBall2.png");
    sprites.yellowBall = loadSprite("spr_yellowBall2.png");
    sprites.blackBall = loadSprite("spr_blackBall2.png");
    sprites.stick = loadSprite("spr_stick.png");

    // Load sounds
    sounds.side = loadSound("Side.wav");
    sounds.ballsCollide = loadSound("BallsCollide.wav");
    sounds.strike = loadSound("Strike.wav");
    sounds.hole = loadSound("Hole.wav");
};
