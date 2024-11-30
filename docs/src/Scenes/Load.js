class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        //any loading not done in Load.js goes here
    }

    create() {
        //creation of world objects goes here
        this.scene.start("farmScene");
    }

    //Load should never get to update

    //helper functions go here
}