class Farm extends Phaser.Scene {
    constructor() {
        super("farmScene");
    }

    preload() {
        //any loading not done in Load.js goes here
    }

    init() {
        console.log("initialized");
        //any initialization of global variables go here
        this.eventEmitter = new Phaser.Events.EventEmitter();

        let brambleberry = new plantType(7, 25, 15, my.crops.plantA);
        let wheat = new plantType(10, 20, 10, my.crops.plantB);
        let gilderberry = new plantType(4, 40, 25, my.crops.plantC); 

        // plantTypes = new Map([["Brambleberry", brambleberry], ["Wheat", wheat], ["Gilderberry", gilderberry]]);
        // seedPacket = Array.from(plantTypes.keys());

        //TODO: all of below should be moved to byte array
        this.board = new Board(tileDim.width, tileDim.height);
        this.board.init();
        this.board.setCurFrame(0);
        this.board.setPlayerLoc(0, 0);

        this.history = [];
        this.redo = [];

        this.currentSeed = 0;
        this.gameFrozen = false;
        this.cropSprites = {};
        plantTypes = [brambleberry, wheat, gilderberry];
        for(let i = 0; i < plantTypes.length; i++) {
          this.board.setPlant(i, 0); //intializes plants in inventory
        }
    }

    create() {
        // Check if there is an auto-save
        const savedState = localStorage.getItem('farmGameState');
    
        if (savedState) {
            // Prompt the player to continue or start a new game
            const continueGame = confirm("Do you want to continue from where you left off?");
            if (continueGame) {
                console.log("reloading past game...");
                this.loadGame('farmGameState');
            } else {
                localStorage.removeItem('farmGameState'); // Clear the saved game if they start a new game
                console.log("initializing new game...");
                this.scene.restart();  // Restart the scene to initialize a new game
            }
        } else {
            this.tileWidth = game.config.width / this.board.width;
            this.tileHeight = (game.config.height - HEIGHT_UNUSED_FOR_TILES) / this.board.height;
    
            // Draw the board for the new game
            this.drawBoard();
            
            // Ensure player is created only once for a new game
            if (!my.player) {
                console.log("Initializing new player...");
                my.player = new Player(this, 0, 0, "player", null);
                let playerScale = (this.tileWidth - 3) / (my.player.height * 2);
                my.player.setScale(playerScale, playerScale);
                this.movePlayerPos(my.player, 0, 0); // Set initial position
                console.log('Player placed at default position');
            }
            this.heldseed = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES, 'Held Seed: Plant ' + (this.currentSeed + 1), {fontSize: '20px', color:"0xFFFFFF"}).setOrigin(0);
            this.harvested = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES/2, 'Harvested Total: 0, 0, 0 ', {fontSize: '20px', color:"0xFFFFFF"}).setOrigin(0);
        }
        this.record();
    
        // Inputs for movement and other actions
        this.input.keyboard.on('keydown-SPACE', () => { if (!this.gameFrozen) { this.tick() } }, this);
        this.input.keyboard.on('keydown-W', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [0, -1]) } }, this);
        this.input.keyboard.on('keydown-A', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [-1, 0]) } }, this);
        this.input.keyboard.on('keydown-S', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [0, 1]) } }, this);
        this.input.keyboard.on('keydown-D', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [1, 0]) } }, this);
        this.input.keyboard.on('keydown-U', () => { if (!this.gameFrozen) { this.undo() } }, this);
        this.input.on('pointerdown', (e) => {
            if (e.button == 0) {
                if (!this.gameFrozen) { this.plantCrop(e.x, e.y) };
            }
        });
        this.input.keyboard.on(`keydown-ONE`, () => {this.currentSeed = 0; this.hudUpdate();}, this);
        this.input.keyboard.on(`keydown-TWO`, () => { this.currentSeed = 1; this.hudUpdate();}, this);
        this.input.keyboard.on(`keydown-THREE`, () => { this.currentSeed = 2; this.hudUpdate();}, this);
    
        // Debug input
        this.input.keyboard.on('keydown-P', () => { let loc = this.board.getPlayerLoc(); this.textUpdate(loc.x, loc.y, 5, 2) }, this);
    
        this.eventEmitter.on("checkWin", () => { this.checkWinCon() }, this);
    }

    tick() {
        //no update, only our turn-based tick
        this.board.incrCurFrame();
        this.simCells();

        //Adds current state to the history stack
        this.record();

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
        if (!player) {
            console.error("Player is not initialized!");
            return; // Prevent the error if player is undefined
        }
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
                        this.cropSprites[[i,j].toString()].setStage(curEntry.getGrowth());
                    }
                }
            }
        }
      }

    textUpdate(x, y) {
        this.eventEmitter.emit("updateCell" + x + y);
    }

    hudUpdate(){
        this.heldseed.text = 'Held Seed: Plant ' + (this.currentSeed + 1);
        let harvestText = "Harvested Total: " + this.board.getPlant("0") + ", " + this.board.getPlant("1") + ", " + this.board.getPlant("2");  // can also call e.g. this.board.getPlant("wheat")
        this.harvested.text = harvestText;
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
                this.cropSprites[[u,v].toString()] = newCrop;1
                // Save game
                this.saveGame();
            } else {
                this.harvestCrop(u, v);
            }
        }
    }
    
    harvestCrop(u, v) {
        let entry = this.board.getEntry(u, v);
        //let curEntry = this.board.getEntry(i, j);
        if(entry.getGrowth() == plantTypes[(entry.getCrop())].getLastStage()) {
            this.cropSprites[[u,v].toString()].remove();
            this.board.addPlant(entry.getCrop(), 1);
            entry.setCrop(undefined);
            entry.setGrowth(0);
            this.eventEmitter.emit("checkWin");
            this.hudUpdate();
        }
        this.tick();
    }

    checkWinCon() {
        if(this.board.checkWinConditions([0, 1, 2], 1)) {
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
        // Convert the current state of the board to a byte array (ArrayBuffer)
        const boardState = this.board.getBoard(); // Gets the ArrayBuffer containing the entire game state
    
        // Save the ArrayBuffer to localStorage (Note: localStorage only supports strings, so we need to convert to Base64)
        const boardStateBase64 = Board.arrayBufferToBase64(boardState);

        // Save the Base64-encoded board state
        localStorage.setItem('farmGameState', boardStateBase64);
        console.log("Game Saved!");
    }
    

    loadGame(saveFile) {
        const savedState = localStorage.getItem(saveFile);
        if (savedState) {
            this.tileWidth = game.config.width / this.board.width;
            this.tileHeight = (game.config.height - HEIGHT_UNUSED_FOR_TILES) / this.board.height;

            // Draw the board for the saved game
            this.drawBoard();
    
            // Convert the Base64-encoded board state back to an ArrayBuffer
            const boardState = Board.base64ToArrayBuffer(savedState);

            // restore inventory display
            this.heldseed = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES, 'Held Seed: Plant ' + (this.currentSeed + 1), {fontSize: '20px', color:"0xFFFFFF"}).setOrigin(0);
            this.harvested = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES/2, 'Harvested Total: 0, 0, 0 ', {fontSize: '20px', color:"0xFFFFFF"}).setOrigin(0);

            
            
            this.loadState(boardState);
            
            
            console.log("Game Loaded!");
        } else {
            console.log("No saved game found.");
        }
    }

    loadState(boardState){
        // Set the restored board state
        this.board.setBoard(boardState);

        // Restore player position
        let playerPos = this.board.getPlayerLoc();

        // Ensure the player exists (if not created yet) before trying to move
        if (my.player == null) {
            console.log("creating player");
            my.player = new Player(this, 0, 0, "player", null);
            let playerScale = (this.tileWidth - 3) / (my.player.height * 2);
            my.player.setScale(playerScale, playerScale);
        }

        console.log(my.player);

        console.log(playerPos);
        // Move player sprite to restored position
        this.movePlayerPos(my.player, playerPos.x, playerPos.y);
        
        // Restore plants after initializing the board
        this.restorePlants();

        

        this.hudUpdate();

        //may need to save on harvestCrop() and check win conditon here when loading, so if the game has been won recreate win screen
    }

    // Method to restore plants based on their type in each cell
    restorePlants() {
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                let curEntry = this.board.getEntry(i, j);

                // Check if there is a plant in the current cell
                let plantType = curEntry.getCrop(); // Get the crop type in the cell
                if (plantType != undefined) { // If a plant exists
                    this.restorePlantState(i, j, plantType);
                }
            }
        }
    }

    // Method to restore plant state (example logic based on plant type)
    restorePlantState(i, j, plantType) {
        // Example of plant restoration logic depending on plant type
        let curEntry = this.board.getEntry(i, j);

        // Create new crop
        let restoredCrop = new Crop(this, i * this.tileWidth + this.tileWidth / 2, j * this.tileHeight + this.tileHeight * 3 / 4, plantTypes[curEntry.getCrop()].growthFrames, plantTypes[curEntry.getCrop()].getGrowthStage);
        restoredCrop.setScale(2.8,2.8);
        
        // Check plant type and restore specific values
        // Could be refactored to not use switch and reduce duplicate code <-----------------
        switch(plantType) {
            case 0: // Plant type 0
                curEntry.setSunlight(curEntry.getSunlight());    // Restore sunlight value
                curEntry.setMoisture(curEntry.getMoisture());     // Restore moisture value
                curEntry.setGrowth(curEntry.getGrowth());
                //create sprite at saved growth stage
                this.cropSprites[[i,j].toString()] = restoredCrop;1
                this.cropSprites[[i,j].toString()].setStage(curEntry.getGrowth());
                break;
            case 1: // Plant type 1
                //restore sun,water,and growth
                curEntry.setSunlight(curEntry.getSunlight());
                curEntry.setMoisture(curEntry.getSunlight());
                curEntry.setGrowth(curEntry.getGrowth());
                //create sprite at saved growth stage
                this.cropSprites[[i,j].toString()] = restoredCrop;1
                this.cropSprites[[i,j].toString()].setStage(curEntry.getGrowth());
                break;
            case 2: // Plant type 2
                curEntry.setSunlight(curEntry.getSunlight());
                curEntry.setMoisture(curEntry.getSunlight());
                curEntry.setGrowth(curEntry.getGrowth());
                //create sprite at saved growth stage
                restoredCrop.setScale(0.25,0.25);
                this.cropSprites[[i,j].toString()] = restoredCrop;1
                this.cropSprites[[i,j].toString()].setStage(curEntry.getGrowth());
                break;
            // Add more plant types as necessary
            default:
                console.log(`Unknown plant type at (${i}, ${j})`);
                break;
        }
    }

    record(){ //adds current game state to history array
        const boardState = this.board.getBoard().slice(0); // Gets a copy of the ArrayBuffer containing the entire game state
        this.history.push(boardState);
        console.log(this.history.length);
    }

    undo(){
        if(this.history.length > 1){
            const state = this.history.pop();

            if(state != null){
                this.redo.push(state);
            }

            console.log(this.history.length);
            this.loadState(this.history[this.history.length - 1]);
            console.log("Undid last action.");
        }
        else{
            console.log("Could not undo any further.");
        }
    }
}