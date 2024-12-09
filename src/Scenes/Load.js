class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("player", "player.png");
        this.load.image("pond-0", "pond1.png");
        this.load.image("pond-1", "pond2.png");
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
        this.load.setPath("./src/")
        this.load.json("ExternalConditions", "DSL/ExternalConditions.json");
    }

    create() {
        //creation of world objects goes here

        my.crops.plantA = ["pond-0", "pond-1"];
        my.crops.plantB = ["plantA-0", "plantA-1", "plantA-2", "plantA-3"];
        my.crops.plantC = ["plantB-0", "plantB-1", "plantB-2", "plantB-3"];
        my.crops.plantD = ["plantC-0", "plantC-1", "plantC-2"];

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
       //this.scene.start("farmScene");
        my.plantLibrary = [
            function Pond(DSL, sprites){
                DSL.ID(0);
                DSL.Name("Pond"); 
                
                DSL.Stages(2); 
                if(sprites){
                    DSL.Sprites(sprites);
                }else{
                    DSL.Sprites([{stage: 0, sprite: my.crops.plantA[0]}, {stage: 1, sprite: my.crops.plantA[1]}]);
                }    
            
                DSL.SunNeeded(0);
                DSL.WaterNeeded(30);
                DSL.WaterConsumed(20);
            
                DSL.Adjacencies([{crop: "Pond", bonus: 1.1}]); 
            },
            function Wheat(DSL, sprites){
                DSL.ID(1);
                DSL.Name("Wheat"); 
                
                DSL.Stages(5); 
                if(sprites){
                    DSL.Sprites(sprites);
                }else{
                    DSL.Sprites([{stage: 0, sprite: my.crops.plantB[0]}, {stage: 1, sprite: my.crops.plantB[1]}, {stage: 3, sprite: my.crops.plantB[2]}, {stage: 4, sprite: my.crops.plantB[3]}]);
                }    
            
                DSL.SunNeeded(9);
                DSL.WaterNeeded(20);
                DSL.WaterConsumed(10);
            
                DSL.Adjacencies([{crop: "Wheat", bonus: .95}, {crop: "Carrot", bonus: 1.2}, {crop: "Barley", bonus: 1.1}, {crop: "Corn", bonus: 1.3},]); 
            },
            function Brambleberry(DSL, sprites){
                DSL.ID(1);
                DSL.Name("Brambleberry"); 
                
                DSL.Stages(4); 
                if(sprites){
                    DSL.Sprites(sprites);
                }else{
                    DSL.Sprites([{stage: 0, sprite: my.crops.plantD[0]}, {stage: 1, sprite: my.crops.plantD[1]}, {stage: 3, sprite: my.crops.plantD[2]}]);
                }    
            
                DSL.SunNeeded(6);
                DSL.WaterNeeded(30);
                DSL.WaterConsumed(15);
            
                DSL.Adjacencies([{crop: "Wheat", bonus: .9}, {crop: "Gilderberry", bonus: 1.2}, {crop: "Carrot", bonus: 1.1}, {crop: "Brambleberry", bonus: .9}]); 
            },
            
        ]
       this.scene.start("languageSelectionScene");
    }

    //Load should never get to update

    //helper functions go here
}