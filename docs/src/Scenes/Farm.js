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
          this.board.setPlant(i, 0);
        }

        //TODO: all of below should be moved to byte array
        this.board = new Board(tileDim.width, tileDim.height);
        this.board.init();
        this.board.setCurFrame(0);
        this.board.setPlayerLoc(0, 0);
    }

    create() {
        // Check if there is an auto-save
        const savedState = localStorage.getItem('farmGameState');
    
        if (savedState) {
            // Prompt the player to continue or start a new game
            const continueGame = confirm("Do you want to continue from where you left off?");
            if (continueGame) {
                console.log("reloading past game...");
                this.loadGame();
            } else {
                localStorage.removeItem('farmGameState'); // Clear the saved game if they start a new game
                console.log("initializing new game...");
                this.scene.restart();  // Restart the scene to initialize a new game
            }
        } else {
            this.init(); // Initialize a new game if no saved state
        }
    
        // Creation of world objects goes here
        this.tileWidth = game.config.width / this.board.width;
        this.tileHeight = game.config.height / this.board.height;
    
        this.drawBoard();
    
        // Create the player object after initialization, and ensure the position is reset to (0, 0)
        if (savedState) {
            // Load saved state and restore the player position
            const gameState = JSON.parse(savedState);
            my.player = new Player(this, gameState.playerPos.x, gameState.playerPos.y, "player", null);
        } else {
            // If no saved game, create a new player at position (0, 0)
            my.player = new Player(this, 0, 0, "player", null);
        }
    
        // Scale and position the player sprite
        let playerScale = (this.tileWidth - 3) / (my.player.height * 2);
        my.player.setScale(playerScale, playerScale);
    
        // After player creation, move to the saved or default position
        const playerPos = savedState ? JSON.parse(savedState).playerPos : { x: 0, y: 0 };
        this.movePlayerPos(my.player, playerPos.x, playerPos.y);
    
        // Inputs for movement and other actions
        this.input.keyboard.on('keydown-SPACE', () => { if (!this.gameFrozen) { this.tick() } }, this);
        this.input.keyboard.on('keydown-W', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [0, -1]) } }, this);
        this.input.keyboard.on('keydown-A', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [-1, 0]) } }, this);
        this.input.keyboard.on('keydown-S', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [0, 1]) } }, this);
        this.input.keyboard.on('keydown-D', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [1, 0]) } }, this);
        this.input.on('pointerdown', (e) => {
            if (e.button == 0) {
                if (!this.gameFrozen) { this.plantCrop(e.x, e.y) };
            }
        });
        this.input.keyboard.on(`keydown-ONE`, () => { this.currentSeed = 0 }, this);
        this.input.keyboard.on(`keydown-TWO`, () => { this.currentSeed = 1 }, this);
        this.input.keyboard.on(`keydown-THREE`, () => { this.currentSeed = 2 }, this);
    
        // Debug input
        this.input.keyboard.on('keydown-P', () => { let loc = this.board.getPlayerLoc(); this.textUpdate(loc.x, loc.y, 5, 2) }, this);
    
        this.eventEmitter.on("checkWin", () => { this.checkWinCon() }, this);
    }

    tick() {
        //no update, only our turn-based tick
        this.frame++;
        this.simCells();

        // Auto-save at the end of each tick
        this.saveGame();
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
            this.board.addPlant(entry.getCrop(), 1);
            entry.setCrop(undefined);
            entry.setGrowth(0);
            this.eventEmitter.emit("checkWin");
        }
    }

    checkWinCon() {
        if(this.board.checkWinConditions([0, 1, 2])) {
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

    saveGame() {
        const gameState = {
            playerPos: this.board.getPlayerLoc(),
            inventory: inventory.getAll(),  // Save the entire inventory state
            //crops: this.crops, // This would need to be serialized correctly
            //boardState: this.board.getState(), // Assuming you have a method that serializes the board's state
            //currentSeed: this.currentSeed,
            //frame: this.frame,
        };

        // Print out the restored inventory to check it
        console.log("Saved Inventory:", inventory.getAll());
    
        localStorage.setItem('farmGameState', JSON.stringify(gameState)); // Save to localStorage
        console.log("Game Saved!");
    }

    loadGame() {
        const savedState = localStorage.getItem('farmGameState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
    
            // Restore board and game state
            this.board.setPlayerLoc(gameState.playerPos.x, gameState.playerPos.y);  // Restore player position
            // Restore inventory state
            inventory.setAll(gameState.inventory);  // Set the inventory to the saved state
            //this.crops = gameState.crops;  // Deserialize crops correctly
            //this.board.setState(gameState.boardState);  // Set board state
            //this.currentSeed = gameState.currentSeed;
            //this.frame = gameState.frame;

            // Print out the restored inventory to check it
            console.log("Restored Inventory:", inventory.getAll());
    
            // Restore the player object at the saved position
            if (my.player) {
                my.player.setPosition(gameState.playerPos.x, gameState.playerPos.y);
            } else {
                my.player = new Player(this, gameState.playerPos.x, gameState.playerPos.y, "player", null);
            }
    
            // Move the player to the restored position
            this.movePlayerPos(my.player, gameState.playerPos.x, gameState.playerPos.y);
    
            console.log("Game Loaded!");
        }
    }
}