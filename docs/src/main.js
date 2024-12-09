// debug with extreme prejudice
"use strict"
if("serviceWorker" in navigator) {
    navigator.serviceWorker,register("./sw.js");
}

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    render: {
        pixelArt: true  // prevents pixel art from getting blurred when scaled
    },
    width: 600,
    height: 650,
    backgroundColor: `#104000`,
    scene: [Load, Farm, Menu]
}

const game = new Phaser.Game(config);
const my = {crops : {}};
const tileDim = { width: 6, height :6};
let plantTypes;

const MIN_SUN = 0;
const MAX_SUN = 20;
const WATER_COEFFICIENT = 12;
const MAX_WATER = 50;
const HEIGHT_UNUSED_FOR_TILES = 50;

const FRAME_BYTES = 2;
const COORD_BYTES = 2;
const SUN_BYTES = 1;
const MOIST_BYTES = 1;
const CROP_BYTES = 1;
const GROWTH_BYTES = 1;
const ENTRY_BYTES = SUN_BYTES + MOIST_BYTES + CROP_BYTES + GROWTH_BYTES;
const INVENTORY_ENTRY_BYTES = 2;
const PLANT_TYPES = 3;
const STATE_SIZE = FRAME_BYTES + COORD_BYTES + this.width * this.height * ENTRY_BYTES + INVENTORY_ENTRY_BYTES * PLANT_TYPES;

const AUTO_SAVE_SLOT_NAME = 'autoSave';
const UNDO_APPEND = 'History';
const REDO_APPEND = 'Redo';