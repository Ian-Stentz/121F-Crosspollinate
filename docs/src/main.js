// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    render: {
        pixelArt: true  // prevents pixel art from getting blurred when scaled
    },
    width: 600,
    height: 600,
    backgroundColor: `#ffffff`,
    scene: [Load, Menu, Farm]
}

const game = new Phaser.Game(config);
const my = {crops : {}};
const tileDim = { width: 6, height :6};
let plantTypes;

const MIN_SUN = 1;
const MAX_SUN = 2;
const WATER_COEFFICIENT = 1.2;
const MAX_WATER = 5;