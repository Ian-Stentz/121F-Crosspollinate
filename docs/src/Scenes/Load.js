class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("player", "player.png");
        this.load.image("plantA-0", "plantA-0.png");
        this.load.image("plantA-1", "plantA-1.png");
        this.load.image("plantA-2", "plantA-2.png");
        this.load.image("plantA-3", "plantA-3.png");
        this.load.image("plantB-0", "plantB-0.png");
        this.load.image("plantB-1", "plantB-1.png");
        this.load.image("plantB-2", "plantB-2.png");
        this.load.image("plantB-3", "plantB-3.png");
        this.load.image("plantC-0", "plantC-0.png");
        this.load.image("plantC-1", "plantC-1.png");
        this.load.image("plantC-2", "plantC-2.png");
    }

    create() {
        //creation of world objects goes here

        my.crops.plantA = ["plantA-0", "plantA-1", "plantA-2", "plantA-3"];
        my.crops.plantB = ["plantB-0", "plantB-1", "plantB-2", "plantB-3"];
        my.crops.plantC = ["plantC-0", "plantC-1", "plantC-2"];

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