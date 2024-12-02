class Farm extends Phaser.Scene {
    constructor() {
        super("farmScene");
    }

    preload() {
        //any loading not done in Load.js goes here
    }

    init() {
        //any initialization of global variables go here

        this.eventEmitter = new Phaser.Events.EventEmitter();

        let brambleberry = new plantType(.7, 2.5, 1.5, my.crops.plantA);
        let wheat = new plantType(1, 2, 1, my.crops.plantB);
        let gilderberry = new plantType(.4, 4, 2.5, my.crops.plantC); 

        // plantTypes = new Map([["Brambleberry", brambleberry], ["Wheat", wheat], ["Gilderberry", gilderberry]]);
        // seedPacket = Array.from(plantTypes.keys());

        this.currentSeed = 0;
        this.gameFrozen = false;
        this.crops = {};
        plantTypes = [brambleberry, wheat, gilderberry];
        for(let i = 0; i < plantTypes.length; i++) {
          inventory.setPlantCount(i, 0);
        }

        //TODO: all of below should be moved to byte array
        this.board = new Board(tileDim.width, tileDim.height);
        this.playerLoc = {
            x: 0,
            y: 0
        }
        this.frame = 0;
    }

    create() {
        //creation of world objects goes here
        this.tileWidth = game.config.width/this.board.width;
        this.tileHeight = game.config.height/this.board.height;

        this.drawBoard();

        //my.player = this.add.image(0, 0, "player");
        my.player = new Player(this, 0, 0, "player", null);
        //636x1462
        let playerScale = (this.tileWidth - 3) / (my.player.height * 2);
        my.player.setScale(playerScale, playerScale); 
        this.movePlayerPos(my.player, 0, 0);

        //inputs
        this.input.keyboard.on('keydown-SPACE', () => {this.tick()}, this);
        this.input.keyboard.on('keydown-W', () => {this.movePlayerDir(my.player, [0, -1])}, this);
        this.input.keyboard.on('keydown-A', () => {this.movePlayerDir(my.player, [-1, 0])}, this);
        this.input.keyboard.on('keydown-S', () => {this.movePlayerDir(my.player, [0, 1])}, this);
        this.input.keyboard.on('keydown-D', () => {this.movePlayerDir(my.player, [1, 0])}, this);
        this.input.on('pointerdown', (e) => {
            if(e.button == 0) {
                this.plantCrop(e.x, e.y);
            }
        });
        this.input.keyboard.on(`keydown-ONE`, () => {this.currentSeed = 0}, this);
        this.input.keyboard.on(`keydown-TWO`, () => {this.currentSeed = 1}, this);
        this.input.keyboard.on(`keydown-THREE`, () => {this.currentSeed = 2}, this);

        //debug input
        this.input.keyboard.on('keydown-P', () => {this.textUpdate(this.playerLoc.x, this.playerLoc.y, 5, 2)}, this);
    }

    tick() {
        //no update, only our turn-based tick
        this.frame++;
        this.simSun();
        this.simMoisture();
        this.simGrowth();
    }

    //helper functions go here
    drawBoard() {
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                let newRect = this.add.rectangle(i*this.tileWidth, j*this.tileHeight, this.tileWidth, this.tileHeight, 0x118c13, 1);
                newRect.setOrigin(0)
                newRect.setStrokeStyle(3, 0x000000);
                let fontSize = 14;
                let padding = 6;
                let fontSettings = {
                    fontFamily: 'utf-8',
                    fontSize: `${fontSize}px`,
                    padding: {
                        left: padding,
                        top: padding,
                    }}
                let sunText = this.add.text(i*this.tileWidth, j*this.tileHeight, "☀️: " + this.board.getEntry(i, j).sunlight, fontSettings).setOrigin(0);
                //TODO: change to simply lookup the sun on the board
                this.eventEmitter.on("sunUpdate" + i + j, (newSun) => {
                    sunText.text = "☀️: " + newSun;
                }, this)
                let waterText = this.add.text(i*this.tileWidth + 2, j*this.tileHeight + fontSize + padding, "💧: " + this.board.getEntry(i, j).moisture, fontSettings).setOrigin(0);
                this.eventEmitter.on("moistureUpdate" + i + j, (newMoisture) => {
                    waterText.text = "💧: " + newMoisture;
                }, this)
                //if(this.board.getEntry(i, j)["crop"] != null) {
                //drawPlant(board, i, j);
                //}
            }
        }
    }

    //moves player directly to Tile
    movePlayerPos(player, u, v) {
        this.playerLoc.x = u;
        this.playerLoc.y = v;
        let [x, y] = [u * this.tileWidth + this.tileWidth * 3 / 4, v * this.tileHeight + this.tileHeight / 4];
        player.move(x, y);
    }

    //moves player with suggestion of dir, handles collision and time progression
    movePlayerDir(player, dir) {
        let newX = this.playerLoc.x + dir[0];
        let newY = this.playerLoc.y + dir[1];
        if(newX >= 0 && newX < this.board.width && newY >= 0 && newY < this.board.height) {
            this.movePlayerPos(player, newX, newY);
            this.tick();
        }
    }

    simMoisture(){
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                this.board.getEntry(i, j).moisture += Math.random() * WATER_COEFFICIENT;
                this.board.getEntry(i, j).moisture = roundToDec(this.board.getEntry(i, j).moisture, 1);
                if(this.board.getEntry(i, j).moisture > MAX_WATER){
                    this.board.getEntry(i, j).moisture = MAX_WATER;
                }
                this.moistureUpdate(i, j, this.board.getEntry(i, j).moisture);
            }
        }
      }
      
    simSun(){
        const sunshine = randRange(MIN_SUN, MAX_SUN);
        const randTile = [Math.round(randRange(0,this.board.width-1)), Math.round(randRange(0, this.board.height-1))];
        //console.log(randTile);
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                if(cellDistManhattan(randTile, [i,j]) == 0){
                    this.board.getEntry(i, j).sunlight = roundToDec(sunshine * 1, 1);
                }
                else if(cellDistManhattan(randTile, [i,j]) == 1){
                    this.board.getEntry(i, j).sunlight = roundToDec(sunshine * .8, 1);
                }
                else if(cellDistManhattan(randTile, [i,j]) == 2){
                    this.board.getEntry(i, j).sunlight = roundToDec(sunshine * .6, 1);
                }
                else{
                    this.board.getEntry(i, j).sunlight = roundToDec(sunshine * .4, 1);
                }
                this.sunUpdate(i, j, this.board.getEntry(i, j).sunlight);
            }
        }
    }
      
    simGrowth(){
        for (let i = 0; i < this.board.width; i++) {
          for (let j = 0; j < this.board.height; j++) {
            if(this.board.getEntry(i, j)["crop"] != null){
              if(plantTypes[(this.board.getEntry(i, j)["crop"])].canGrow(this.board.getEntry(i, j).sunlight, this.board.getEntry(i, j).moisture, this.board.getEntry(i, j).growth) ){
                //console.log("growing")
                this.board.getEntry(i, j).moisture -= plantTypes[(this.board.getEntry(i, j)["crop"])].moistureConsumption;
                this.board.getEntry(i, j).growth++;
              }
      
              //console.log(getBoard(board, i, j).growth + ", max: " + plantTypes.get(getBoard(board, i, j)["crop"]).getLastStage());
              
              if(this.board.getEntry(i, j).growth > plantTypes[(this.board.getEntry(i, j)["crop"])].getLastStage()){
                this.board.getEntry(i, j).growth = plantTypes[(this.board.getEntry(i, j)["crop"])].getLastStage();
              }
              //drawPlant()
            } 
          }
        }
        }

    sunUpdate(x, y, newSun) {
        this.eventEmitter.emit("sunUpdate" + x + y, newSun);
    }

    moistureUpdate(x, y, newMoisture) {
        this.eventEmitter.emit("moistureUpdate" + x + y, newMoisture);
    }

    plantCrop(mx, my){
        let [u, v] = [Math.floor(mx / this.tileWidth), Math.floor(my / this.tileHeight)];
      
        if(cellDistOctal([this.playerLoc.x, this.playerLoc.y], [u, v]) <= 1){
            if(this.board.getEntry(u, v)["crop"] == null){
                this.board.getEntry(u, v)["crop"] = this.currentSeed;
                let newCrop = new Crop(this, u * this.tileWidth + this.tileWidth / 2, v * this.tileHeight + this.tileHeight * 3 / 4, plantTypes[this.currentSeed].growthFrames, 0);
                let plantScale = (this.tileWidth) / (newCrop.width * 2);
                newCrop.setScale(plantScale, plantScale);
                this.crops[[u,v].toString()] = newCrop;
                this.tick();
            } else {
                this.harvestCrop(u, v);
            }
        }
    }
    
    harvestCrop(u, v) {
        console.log("crop harvested");
    }
}