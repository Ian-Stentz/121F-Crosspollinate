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
        this.load.image("Carrot-0", "Carrot-0.png");
        this.load.image("Carrot-1", "Carrot-1.png");
        this.load.image("Carrot-2", "Carrot-2.png");
        this.load.image("Carrot-3", "Carrot-3.png");
        this.load.image("Barley-0", "Barley-0.png");
        this.load.image("Barley-1", "Barley-1.png");
        this.load.image("Barley-2", "Barley-2.png");
        this.load.image("Barley-3", "Barley-3.png");
        this.load.image("Sugarcane-0", "Sugarcane-0.png");
        this.load.image("Sugarcane-1", "Sugarcane-1.png");
        this.load.image("Sugarcane-2", "Sugarcane-2.png");
        this.load.setPath("./src/")
        this.load.json("ExternalConditions", "DSL/ExternalConditions.json");
    }

    create() {
        //creation of world objects goes here

        my.crops.plantA = ["pond-0", "pond-1"];
        my.crops.plantB = ["plantA-0", "plantA-1", "plantA-2", "plantA-3"];
        my.crops.plantC = ["plantB-0", "plantB-1", "plantB-2", "plantB-3"];
        my.crops.gilderberry = ["plantB-0", "plantB-1", "plantB-2", "plantB-3"];
        my.crops.plantD = ["plantC-0", "plantC-1", "plantC-2"];
        my.crops.carrot = ["Carrot-0", "Carrot-1", "Carrot-2", "Carrot-3"];
        my.crops.barley = ["Barley-0", "Barley-1", "Barley-2", "Barley-3"];
        my.crops.sugarcane = ["Sugarcane-0", "Sugarcane-1", "Sugarcane-2"];

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
                
                DSL.Stages(3); 
                if(sprites){
                    DSL.Sprites(sprites);
                }else{
                    DSL.Sprites([{stage: 0, sprite: my.crops.plantA[0]}, {stage: 2, sprite: my.crops.plantA[1]}]);
                }    
            
                DSL.SunNeeded(0);
                DSL.WaterNeeded(45);
                DSL.WaterConsumed(30);
            
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
            
                DSL.SunNeeded(16);
                DSL.WaterNeeded(20);
                DSL.WaterConsumed(10);
            
                DSL.Adjacencies([{crop: "Wheat", bonus: .95}, {crop: "Carrot", bonus: 1.2}, {crop: "Barley", bonus: 1.1}, {crop: "Corn", bonus: 1.3},]); 
            },
            function Brambleberry(DSL, sprites){
                DSL.ID(2);
                DSL.Name("Brambleberry"); 
                
                DSL.Stages(4); 
                if(sprites){
                    DSL.Sprites(sprites);
                }else{
                    DSL.Sprites([{stage: 0, sprite: my.crops.plantD[0]}, {stage: 1, sprite: my.crops.plantD[1]}, {stage: 3, sprite: my.crops.plantD[2]}]);
                }    
            
                DSL.SunNeeded(12);
                DSL.WaterNeeded(30);
                DSL.WaterConsumed(20);
            
                DSL.Adjacencies([{crop: "Wheat", bonus: .9}, {crop: "Gilderberry", bonus: 1.2}, {crop: "Carrot", bonus: 1.1}, {crop: "Brambleberry", bonus: .9}]); 
            },
            function Carrot(DSL, sprites){
                DSL.ID(3);
                DSL.Name("Carrot"); 
                
                DSL.Stages(4); 
                if(sprites){
                    DSL.Sprites(sprites);
                }else{
                    DSL.Sprites([{stage: 0, sprite: my.crops.carrot[0]}, {stage: 1, sprite: my.crops.carrot[1]}, {stage: 2, sprite: my.crops.carrot[2]}, {stage: 3, sprite: my.crops.carrot[3]}]);
                }    
            
                DSL.SunNeeded(9);
                DSL.WaterNeeded(40);
                DSL.WaterConsumed(25);
            
                DSL.Adjacencies([{crop: "Wheat", bonus: 1.1}, {crop: "Gilderberry", bonus: 1.1}, {crop: "Brambleberry", bonus: 1.1}, {crop: "Barley", bonus: 1.2}, {crop: "Pond", bonus: 1.2}]); 
            },
            function Gilderberry(DSL, sprites){
                DSL.ID(4);
                DSL.Name("Gilderberry"); 
                
                DSL.Stages(5); 
                if(sprites){
                    DSL.Sprites(sprites);
                }else{
                    DSL.Sprites([{stage: 0, sprite: my.crops.gilderberry[0]}, {stage: 1, sprite: my.crops.gilderberry[1]}, {stage: 2, sprite: my.crops.gilderberry[2]}, {stage: 4, sprite: my.crops.gilderberry[3]}]);
                }    
            
                DSL.SunNeeded(10);
                DSL.WaterNeeded(40);
                DSL.WaterConsumed(25);
            
                DSL.Adjacencies([{crop: "Wheat", bonus: .9}, {crop: "Gilderberry", bonus: .9}, {crop: "Brambleberry", bonus: 1.1}, {crop: "Barley", bonus: 1.2}, {crop: "Pond", bonus: 1.1}, {crop: "Carrot", bonus: 1.1}]); 
                DSL.Parents(["Brambleberry", "Pond"]);
            },
            function Barley(DSL, sprites){
                DSL.ID(5);
                DSL.Name("Barley"); 
                
                DSL.Stages(6); 
                if(sprites){
                    DSL.Sprites(sprites);
                }else{
                    DSL.Sprites([{stage: 0, sprite: my.crops.barley[0]}, {stage: 1, sprite: my.crops.barley[1]}, {stage: 3, sprite: my.crops.barley[2]}, {stage: 5, sprite: my.crops.barley[3]}]);
                }    
            
                DSL.SunNeeded(14);
                DSL.WaterNeeded(30);
                DSL.WaterConsumed(15);
            
                DSL.Adjacencies([{crop: "Barley", bonus: .9}, {crop: "Gilderberry", bonus: 1.1}, {crop: "Brambleberry", bonus: .8}, {crop: "Wheat", bonus: 1.2}, {crop: "Pond", bonus: 1.1}, {crop: "Carrot", bonus: 1.2}]); 
                DSL.Parents(["Wheat", "Carrot"]);
            },
            function Sugarcane(DSL, sprites){
                DSL.ID(6);
                DSL.Name("Sugarcane"); 
                
                DSL.Stages(3); 
                if(sprites){
                    DSL.Sprites(sprites);
                }else{
                    DSL.Sprites([{stage: 0, sprite: my.crops.sugarcane[0]}, {stage: 1, sprite: my.crops.sugarcane[1]}, {stage: 2, sprite: my.crops.sugarcane[2]}]);
                }    
            
                DSL.SunNeeded(28);
                DSL.WaterNeeded(55);
                DSL.WaterConsumed(45);
            
                DSL.Adjacencies([{crop: "Barley", bonus: .9}, {crop: "Gilderberry", bonus: 1.1}, {crop: "Brambleberry", bonus: 1.1}, {crop: "Wheat", bonus: 1.2}, {crop: "Pond", bonus: 1.4}, {crop: "Carrot", bonus: .8}, {crop: "Sugarcane", bonus: 1.05}]); 
                DSL.Parents(["Wheat", "Pond", "Gilderberry"]);
            },
            

        ]
       this.scene.start("languageSelectionScene");
       //this.scene.start("ColorSelectionScene");
    }

    //Load should never get to update

    //helper functions go here
}