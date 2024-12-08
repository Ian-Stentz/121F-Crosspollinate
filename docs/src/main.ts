/// <reference path="../lib/phaser.d.ts" />
import { Load } from "./Scenes/Load.ts";
import { Farm } from "./Scenes/Farm.ts";
import { Menu } from "./Scenes/Menu.ts";

// game config
const config = {
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

export const game = new Phaser.Game(config);