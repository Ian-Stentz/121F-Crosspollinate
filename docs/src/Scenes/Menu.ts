import { game } from "../main.ts";
export class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    preload() {
        //any loading not done in Load.js goes here
    }

    init() {
        //any initialization of global variables go here
    }

    sceneStart() {
        this.scene.start('farmScene');
    }

    create() {
        //creation of world objects goes here
        if(typeof game.config.width === 'number' && typeof game.config.height === 'number') {
            const title = this.add.text(game.config.width/2, game.config.height/4, 'Farm Simulator', {fontSize: '35px'}).setOrigin(0.5);
            this.add.rectangle(game.config.width/2, (1.15*game.config.height)/4, title.width, 10, 0xFFFFFF, .5);

            const startgame = this.add.text(game.config.width/2, 3*game.config.height/5, 'Start Farming', {fontSize: '18px'}).setOrigin(0.5);
            startgame.setInteractive();
            this.input.on('gameobjectdown', this.sceneStart);
        }
        
    }
}