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

const MIN_SUN = 0;
const MAX_SUN = 20;
const WATER_COEFFICIENT = 12;
const MAX_WATER = 50;

const FRAME_BYTES = 2;
const COORD_BYTES = 2;
const SUN_BYTES = 1;
const MOIST_BYTES = 1;
const CROP_BYTES = 1;
const GROWTH_BYTES = 1;
const ENTRY_BYTES = SUN_BYTES + MOIST_BYTES + CROP_BYTES + GROWTH_BYTES;