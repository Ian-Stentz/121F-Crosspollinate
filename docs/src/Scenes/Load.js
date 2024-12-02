class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("player", "player.png");

        
    }

    create() {
        //creation of world objects goes here

        // Testing if this can automate (ish) crop sprites
        // this.anims.create({
        //     key: "plantA",
        //     frames: this.anims.generateFrameNames("crop", {
        //         prefix: "plantA-",
        //         start: 0,
        //         end: 3,
        //         suffix: ".png"
        //     }),
        //     frameRate: 0,
        // });
        // this.anims.create({
        //     key: "plantB",
        //     frames: this.anims.generateFrameNames("crop", {
        //         prefix: "plantB-",
        //         start: 0,
        //         end: 3,
        //         suffix: ".png"
        //     }),
        //     frameRate: 0,
        // });
        // this.anims.create({
        //     key: "plantC",
        //     frames: this.anims.generateFrameNames("crop", {
        //         prefix: "plantC-",
        //         start: 0,
        //         end: 2,
        //         suffix: ".png"
        //     }),
        //     frameRate: 0,
        // });

        //go to the farm scene
        this.scene.start("farmScene");
    }

    //Load should never get to update

    //helper functions go here
}