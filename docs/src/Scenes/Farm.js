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

        let brambleberry = new plantType(7, 25, 15, my.crops.plantA);
        let wheat = new plantType(10, 20, 10, my.crops.plantB);
        let gilderberry = new plantType(4, 40, 25, my.crops.plantC); 

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
        this.board.init();
        this.board.setCurFrame(0);
        this.board.setPlayerLoc(0, 0);
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
        this.input.keyboard.on('keydown-SPACE', () => {if(!this.gameFrozen) {this.tick()}}, this);
        this.input.keyboard.on('keydown-W', () => {if(!this.gameFrozen) {this.movePlayerDir(my.player, [0, -1])}}, this);
        this.input.keyboard.on('keydown-A', () => {if(!this.gameFrozen) {this.movePlayerDir(my.player, [-1, 0])}}, this);
        this.input.keyboard.on('keydown-S', () => {if(!this.gameFrozen) {this.movePlayerDir(my.player, [0, 1])}}, this);
        this.input.keyboard.on('keydown-D', () => {if(!this.gameFrozen) {this.movePlayerDir(my.player, [1, 0])}}, this);
        this.input.on('pointerdown', (e) => {
            if(e.button == 0) {
                if(!this.gameFrozen) {this.plantCrop(e.x, e.y)};
            }
        });
        this.input.keyboard.on(`keydown-ONE`, () => {this.currentSeed = 0}, this);
        this.input.keyboard.on(`keydown-TWO`, () => {this.currentSeed = 1}, this);
        this.input.keyboard.on(`keydown-THREE`, () => {this.currentSeed = 2}, this);

        //debug input
        this.input.keyboard.on('keydown-P', () => {let loc = this.board.getPlayerLoc(); this.textUpdate(loc.x, loc.y, 5, 2)}, this);

        this.eventEmitter.on("checkWin", () => {this.checkWinCon()}, this);
    }

    tick() {
        //no update, only our turn-based tick
        this.frame++;
        this.simCells();
    }

    //helper functions go here
    drawBoard() {
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                let curEntry = this.board.getEntry(i, j);
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
                let sunText = this.add.text(i*this.tileWidth, j*this.tileHeight, "☀️: " + curEntry.getSunlight(), fontSettings).setOrigin(0);
                let waterText = this.add.text(i*this.tileWidth + 2, j*this.tileHeight + fontSize + padding, "💧: " + curEntry.getMoisture(), fontSettings).setOrigin(0);
                this.eventEmitter.on("updateCell" + i + j, () => {
                    let entry = this.board.getEntry(i, j);
                    sunText.text = "☀️: " + entry.getSunlight();
                    waterText.text = "💧: " + entry.getMoisture();
                }, this)
            }
        }
    }

    //moves player directly to Tile
    movePlayerPos(player, u, v) {
        this.board.setPlayerLoc(u, v);
        let [x, y] = [u * this.tileWidth + this.tileWidth * 3 / 4, v * this.tileHeight + this.tileHeight / 4];
        player.move(x, y);
    }

    //moves player with suggestion of dir, handles collision and time progression
    movePlayerDir(player, dir) {
        let curLoc = this.board.getPlayerLoc();
        let newX = curLoc.x + dir[0];
        let newY = curLoc.y + dir[1];
        if(newX >= 0 && newX < this.board.width && newY >= 0 && newY < this.board.height) {
            this.movePlayerPos(player, newX, newY);
            this.tick();
        }
    }

    simCells(){
        const highestSunshine = randIntRange((MAX_SUN + MIN_SUN) / 2, MAX_SUN);
        const randTile = [randIntRange(0, this.board.width), randIntRange(0, this.board.height)];
        console.log(highestSunshine);
        console.log(randTile);
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                //Load Entry
                let curEntry = this.board.getEntry(i, j);
                //Moisture Simulation
                curEntry.setMoisture(Math.min(curEntry.getMoisture() + Math.floor(Math.random() * WATER_COEFFICIENT), MAX_WATER));

                //Sunshine Simulation
                curEntry.setSunlight(Math.max(MIN_SUN, Math.round(highestSunshine * Math.max(0.4, (1 - (cellDistManhattan(randTile, [i,j]) * 0.1))))));

                this.textUpdate(i, j);

                //Growth Simulation
                if(curEntry.getCrop() != undefined){
                    if(plantTypes[curEntry.getCrop()].canGrow(curEntry.getSunlight(), curEntry.getMoisture(), curEntry.getGrowth()) ){
                        curEntry.setMoisture(curEntry.getMoisture() - plantTypes[curEntry.getCrop()].moistureConsumption);
                        curEntry.setGrowth(curEntry.getGrowth() + 1);
                        this.crops[[i,j].toString()].setStage(curEntry.getGrowth());
                    }
                }
            }
        }
      }

    textUpdate(x, y) {
        this.eventEmitter.emit("updateCell" + x + y);
    }

    plantCrop(mx, my){
        let [u, v] = [Math.floor(mx / this.tileWidth), Math.floor(my / this.tileHeight)];
        let curLoc = this.board.getPlayerLoc()
        let entry = this.board.getEntry(u, v);
        if(cellDistOctal([curLoc.x, curLoc.y], [u, v]) <= 1){
            if(entry.getCrop() == undefined){
                this.tick();
                entry.setCrop(this.currentSeed);
                let newCrop = new Crop(this, u * this.tileWidth + this.tileWidth / 2, v * this.tileHeight + this.tileHeight * 3 / 4, plantTypes[this.currentSeed].growthFrames, 0);
                let plantScale = (this.tileWidth) / (newCrop.width * 2);
                newCrop.setScale(plantScale, plantScale);
                this.crops[[u,v].toString()] = newCrop;1
            } else {
                this.harvestCrop(u, v);
            }
        }
    }
    
    harvestCrop(u, v) {
        let entry = this.board.getEntry(u, v);
        if(entry.getGrowth() == plantTypes[(entry.getCrop())].getLastStage()) {
            this.crops[[u,v].toString()].remove();
            inventory.addPlant(entry.getCrop(), 1);
            entry.setCrop(undefined);
            entry.setGrowth(0);
            this.eventEmitter.emit("checkWin");
        }
    }

    checkWinCon() {
        if(inventory.checkWinConditions([0, 1, 2])) {
            this.gameFrozen = true;
            let fontSettings = {
                fontFamily: 'utf-8',
                fontSize: `64px`,
                align: 'center',
                color: '#f00',
                stroke: '#8ff',
                strokeThickness: 4
            }
            this.add.text(game.config.width / 2, game.config.height / 2, "You Win!", fontSettings).setOrigin(0.5);
        }
    }
}