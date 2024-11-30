// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    render: {
        pixelArt: true
    },
    width: 600,
    height: 600,
    scene: [Load, Menu, Farm]
}

const game = new Phaser.Game(config);