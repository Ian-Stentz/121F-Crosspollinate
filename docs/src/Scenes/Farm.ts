class Farm extends Phaser.Scene {
    private eventEmitter : Phaser.Events.EventEmitter;
    private board : Board;
    private tileWidth : number;
    private tileHeight : number;
    private SAVESIZE : number;
    private history : string[];
    private redoStack : string[];
    private currentSeed : number;
    private gameFrozen : boolean;
    private heldseed : Phaser.GameObjects.Text;
    private harvested : Phaser.GameObjects.Text;
    private playerSprite : Player;
    private cropSprites : Map<string, Crop>;

    constructor() {
        super("farmScene");
        this.eventEmitter = new Phaser.Events.EventEmitter();
    }

    preload() {
        //any loading not done in Load.js goes here
    }

    init() {
        console.log("initialized");
        //any initialization of global variables go here

        let brambleberry = new plantType(7, 25, 15, my.crops["plantA"]);
        let wheat = new plantType(10, 20, 10, my.crops["plantB"]);
        let gilderberry = new plantType(4, 40, 25, my.crops["plantC"]); 

        // plantTypes = new Map([["Brambleberry", brambleberry], ["Wheat", wheat], ["Gilderberry", gilderberry]]);
        // seedPacket = Array.from(plantTypes.keys());

        this.board = new Board(tileDim.width, tileDim.height);
        this.board.init();
        this.board.setCurFrame(0);
        this.board.playerLoc = {x: 0, y: 0};
        if(typeof game.config.width === 'number' && typeof game.config.height === 'number') {
            this.tileWidth = game.config.width / tileDim.width;
            this.tileHeight = (game.config.height - HEIGHT_UNUSED_FOR_TILES) / tileDim.height;
        }

        this.SAVESIZE = this.board.getSaveSize();
        //console.log(this.SAVESIZE);

        this.history = [];
        this.redoStack = [];

        this.currentSeed = 0;
        this.gameFrozen = false;

        plantTypes = [brambleberry, wheat, gilderberry];
        for(let i = 0; i < plantTypes.length; i++) {
          this.board.setPlant(i, 0); //intializes plants in inventory
        }
    }

    create() {
        //Create all the objects needed for this scene
        this.drawBoard();

        this.createPlayer();

        this.heldseed = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES, 'Held Seed: Plant ' + (this.currentSeed + 1), {fontSize: '20px', color:"#FEE"}).setOrigin(0);
        this.harvested = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES/2, 'Harvested Total: 0, 0, 0 ', {fontSize: '20px', color:"#EFE"}).setOrigin(0);
        
        this.initCropSprites();
    
        // Check if there is an auto-save
        const savedState = localStorage.getItem(AUTO_SAVE_SLOT_NAME + UNDO_APPEND);
        if (savedState) {
            // Prompt the player to continue or start a new game
            const continueGame = confirm("Do you want to continue from where you left off?");
            if (continueGame) {
                console.log("reloading past game...");
                this.loadGame(AUTO_SAVE_SLOT_NAME);
            } else {
                this.removeSlot(AUTO_SAVE_SLOT_NAME);
                console.log("initializing new game...");
                this.record();
                //this.scene.restart();  // Restart the scene to initialize a new game
            }
        } else {
            this.record();
        }
        
        // Inputs for movement and other actions
        this.input.keyboard?.on('keydown-SPACE', () => { if (!this.gameFrozen) { this.tick() } }, this);
        this.input.keyboard?.on('keydown-W', () => { if (!this.gameFrozen) { this.movePlayerDir(this.playerSprite, [0, -1]) } }, this);
        this.input.keyboard?.on('keydown-A', () => { if (!this.gameFrozen) { this.movePlayerDir(this.playerSprite, [-1, 0]) } }, this);
        this.input.keyboard?.on('keydown-S', () => { if (!this.gameFrozen) { this.movePlayerDir(this.playerSprite, [0, 1]) } }, this);
        this.input.keyboard?.on('keydown-D', () => { if (!this.gameFrozen) { this.movePlayerDir(this.playerSprite, [1, 0]) } }, this);
        this.input.keyboard?.on('keydown-U', () => { if (!this.gameFrozen) { this.undo() } }, this);
        this.input.keyboard?.on('keydown-I', () => { if (!this.gameFrozen) { this.redo() } }, this);
        this.input.on('pointerdown', (e) => {
            if (e.button == 0) {
                if (!this.gameFrozen) { this.plantCrop(e.x, e.y) };
            }
        });
        this.input.keyboard?.on(`keydown-O`, this.savePrompt, this);
        this.input.keyboard?.on(`keydown-P`, this.loadPrompt, this);
        this.input.keyboard?.on(`keydown-L`, this.deletePrompt, this);
        this.input.keyboard?.on(`keydown-ONE`, () => {this.currentSeed = 0; this.hudUpdate();}, this);
        this.input.keyboard?.on(`keydown-TWO`, () => { this.currentSeed = 1; this.hudUpdate();}, this);
        this.input.keyboard?.on(`keydown-THREE`, () => { this.currentSeed = 2; this.hudUpdate();}, this);
    
        this.eventEmitter.on("checkWin", () => { this.checkWinCon() }, this);
    }

    createPlayer() {
        console.log("Initializing new player...");
        this.playerSprite = new Player(this, 0, 0, "player", undefined);
        let playerScale = (this.tileWidth - 3) / (this.playerSprite.height * 2);
        this.playerSprite.setScale(playerScale, playerScale);
        this.movePlayerPos(this.playerSprite, 0, 0); // Set initial position
        console.log('Player placed at default position');
    }

    initCropSprites() {
        this.cropSprites = new Map<string, Crop>();
        for(let i = 0; i < this.board.width; i++) {
            for(let j = 0; j < this.board.height; j++) {
                this.addCropSprite(i, j);
            }
        }
    }

    tick() {
        //no update, only our turn-based tick
        this.board.incrCurFrame();
        this.simCells();

        //Clears redo stack
        this.redoStack = [];

        //Adds current state to the history stack
        this.record();

        // Auto-save at the end of each tick
        this.saveGame(AUTO_SAVE_SLOT_NAME);
    }

    //helper functions go here
    drawBoard() {
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                let curEntry = this.board.getEntry({x: i, y: j});
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
                let sunText = this.add.text(i*this.tileWidth, j*this.tileHeight, "☀️: " + curEntry.sunlight, fontSettings).setOrigin(0);
                let waterText = this.add.text(i*this.tileWidth + 2, j*this.tileHeight + fontSize + padding, "💧: " + curEntry.moisture, fontSettings).setOrigin(0);
                this.eventEmitter.on("updateCell" + i + j, () => {
                    let entry = this.board.getEntry({x: i, y: j});
                    sunText.text = "☀️: " + entry.sunlight;
                    waterText.text = "💧: " + entry.moisture;
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
        this.board.playerLoc = {x: u, y: v};
        let [x, y] = [u * this.tileWidth + this.tileWidth * 3 / 4, v * this.tileHeight + this.tileHeight / 4];
        player.move(x, y);
        console.log("player position: " + u + " " + v);
    }

    //moves player with suggestion of dir, handles collision and time progression
    movePlayerDir(player, dir) {
        let curLoc = this.board.playerLoc;
        let newX = curLoc.x + dir[0];
        let newY = curLoc.y + dir[1];
        if(newX >= 0 && newX < this.board.width && newY >= 0 && newY < this.board.height) {
            this.movePlayerPos(player, newX, newY);
            this.tick();
        }
    }

    simCells(){
        const highestSunshine = randIntRange((MAX_SUN + MIN_SUN) / 2, MAX_SUN);
        const randTile = {x: randIntRange(0, this.board.width), y: randIntRange(0, this.board.height)};
        console.log(highestSunshine);
        console.log(randTile);
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                //Load Entry
                let curEntry = this.board.getEntry({x: i, y: j});
                //Moisture Simulation
                curEntry.moisture = Math.min(curEntry.moisture + Math.floor(Math.random() * WATER_COEFFICIENT), MAX_WATER);

                //Sunshine Simulation
                curEntry.sunlight = Math.max(MIN_SUN, Math.round(highestSunshine * Math.max(0.4, (1 - (cellDistManhattan(randTile, {x: i, y: j}) * 0.1)))));

                this.textUpdate(i, j);

                //Growth Simulation
                if(curEntry.crop != undefined){
                    if(plantTypes[curEntry.crop].canGrow(curEntry.sunlight, curEntry.moisture, curEntry.growth) ){
                        curEntry.moisture = curEntry.moisture - plantTypes[curEntry.crop].moistureConsumption;
                        curEntry.growth += 1;
                        this.cropSprites[[i,j].toString()].setStage(curEntry.growth);
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
        let harvestText = "Harvested Total: " + this.board.getPlant(0) + ", " + this.board.getPlant(1) + ", " + this.board.getPlant(2);  // can also call e.g. this.board.getPlant("wheat")
        this.harvested.text = harvestText;
    }

    plantCrop(mx, my){
        let [u, v] = [Math.floor(mx / this.tileWidth), Math.floor(my / this.tileHeight)];
        let curLoc = this.board.playerLoc
        let entry = this.board.getEntry({x: u, y: v});
        if(cellDistOctal(curLoc, {x: u, y: v}) <= 1){
            if(entry.crop == undefined){
                entry.crop = this.currentSeed;
                entry.growth = 0;
                this.plantCropSprite(u, v, this.currentSeed, 0);
                this.tick();
            } else {
                this.harvestCrop(u, v);
            }
        }
    }

    addCropSprite(u, v) {
        let newCrop = new Crop(this, u * this.tileWidth + this.tileWidth / 2, v * this.tileHeight + this.tileHeight * 3 / 4, plantTypes[1].growthFrames, 0);
        let plantScale = (this.tileWidth) / (newCrop.width * 2);
        newCrop.setScale(plantScale, plantScale);
        newCrop.setVisible(false);
        this.cropSprites[[u,v].toString()] = newCrop;
    }

    plantCropSprite(u, v, type, growth) {
        console.log("planted");
        let cropSprite = this.cropSprites[[u,v].toString()]
        cropSprite.overrideType(plantTypes[type].growthFrames, growth);
        let plantScale = (this.tileWidth) / (cropSprite.width * 2);
        cropSprite.setScale(plantScale, plantScale);
        cropSprite.setVisible(true);
    }
    
    harvestCrop(u, v) {
        let entry = this.board.getEntry({x: u, y: v});
        //let curEntry = this.board.getEntry(i, j);
        if(entry.growth == plantTypes[entry.crop!].getLastStage()) {
            this.cropSprites[[u,v].toString()].setVisible(false);
            this.board.addPlant(entry.crop!, 1);
            entry.crop = undefined;
            entry.growth = 0;
            this.eventEmitter.emit("checkWin");
            this.hudUpdate();
            this.tick();
        }
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
            if(typeof game.config.width === 'number' && typeof game.config.height === 'number') {
                this.add.text(game.config.width / 2, game.config.height / 2, "You Win!", fontSettings).setOrigin(0.5);
            }
        }
    }

    saveGame(saveSlot : string) {
        // Convert the current state of the board to a byte array (ArrayBuffer)
        const boardState = this.board.getBoard(); // Gets the ArrayBuffer containing the entire game state
    
        // Save the ArrayBuffer to localStorage (Note: localStorage only supports strings, so we need to convert to Base64
        const boardStateBase64 = Board.arrayBufferToBase64(boardState);

        let saveString = "";
        for(let f = 0; f < this.history.length; f++){
            saveString += this.history[f];
        }

        let redoString = "";
        for(let f = 0; f < this.redoStack.length; f++){
            redoString += this.redoStack[f];
        }

        // Save the Base64-encoded history and redo strings

        localStorage.setItem(saveSlot+UNDO_APPEND, saveString);
        localStorage.setItem(saveSlot+REDO_APPEND, redoString);
        console.log("Game Saved!");
    }
    

    loadGame(saveSlot) {
        const savedState = localStorage.getItem(saveSlot+UNDO_APPEND);
        const redoState = localStorage.getItem(saveSlot+REDO_APPEND);
        
        if (savedState) {
            console.log("Found save, string length:" + savedState.length);

            //Gets the amount of save states in the string
            let frames = savedState.length/this.SAVESIZE;
            console.log("Save contains " + frames + " frames of size " + this.SAVESIZE);
            this.history = [];
            this.redoStack = [];

            //slices the main string into state-sized pieces and loads them into the history stack
            for(let f = 0; f < frames; f++){
                const start = f * this.SAVESIZE;
                this.history.push(savedState.slice(start, start + this.SAVESIZE));
            }
    

            // // restore inventory display
            // this.heldseed = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES, 'Held Seed: Plant ' + (this.currentSeed + 1), {fontSize: '20px', color:"0xFFFFFF"}).setOrigin(0);
            // this.harvested = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES/2, 'Harvested Total: 0, 0, 0 ', {fontSize: '20px', color:"0xFFFFFF"}).setOrigin(0);

            // Convert the most recent Base64-encoded board state back to an ArrayBuffer
            //console.log(`Loading frame ${this.history.length -1}...`);
            const boardState = Board.base64ToArrayBuffer(this.history[this.history.length -1]);
            
            this.loadState(boardState);
            
            //Load redo states into the stack
            if(redoState){
                frames = redoState.length/this.SAVESIZE;
                console.log("Redo stack contains " + frames + " frames of size " + this.SAVESIZE);

                //slices the main string into state-sized pieces and loads them into the history stack
                for(let f = 0; f < frames; f++){
                    const start = f * this.SAVESIZE;
                    this.redoStack.push(redoState.slice(start, start + this.SAVESIZE));
                }
            }
            
            console.log("Game Loaded!");
            return true;
        } else {
            console.log("No saved game found.");
            return false;
        }
    }

    loadState(boardState){
        // Set the restored board state
        this.board.setBoard(boardState);
        //console.log("loading frame " + this.board.getCurFrame());

        // Restore player position
        let playerPos = this.board.playerLoc;

        // Ensure the player exists (if not created yet) before trying to move
        if (this.playerSprite == null) {
            //console.log("creating player");
            this.playerSprite = new Player(this, 0, 0, "player", undefined);
            let playerScale = (this.tileWidth - 3) / (this.playerSprite.height * 2);
            this.playerSprite.setScale(playerScale, playerScale);
        }
        
        // Move player sprite to restored position
        this.movePlayerPos(this.playerSprite, playerPos.x, playerPos.y);
        
        // Restore plants after initializing the board
        this.restorePlants();

        
        for(let i = 0; i < this.board.width; i++) {
            for(let j = 0; j < this.board.height; j++) {
                this.textUpdate(i, j);
            }
        }
        this.hudUpdate();

        //may need to save on harvestCrop() and check win conditon here when loading, so if the game has been won recreate win screen
    }

    // Method to restore plants based on their type in each cell
    restorePlants() {
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                this.refreshCropSprite(i, j);
            }
        }
    }

    // Method to update the crop sprite
    refreshCropSprite(u, v) {
        let curEntry = this.board.getEntry({x: u, y: v});
        let curSprite = this.cropSprites[[u,v].toString()];
        let entryCrop = curEntry.crop;
        if(entryCrop == undefined) {
            curSprite.visible = false;
        }
        else {
            this.plantCropSprite(u,v,curEntry.crop,curEntry.growth);
        }
    }

    record(){ //adds current game state to history array

        // Gets a copy of the ArrayBuffer containing the entire game state
        const boardState = Board.arrayBufferToBase64(this.board.getBoard());
        this.history.push(boardState);
        //console.log("Length of history: " + this.history.length);
        //this.truehistory();
    }

    undo(){
        if(this.history.length > 1){
            const state = this.history.pop();

            if(state != null){
                this.redoStack.push(state);
            }
            
            //console.log("Length of history: " + this.history.length);
            //this.truehistory();
            
            this.loadState(Board.base64ToArrayBuffer(this.history[this.history.length - 1]));
            this.saveGame(AUTO_SAVE_SLOT_NAME);
            console.log("Undid last action.");
        }
        else{
            console.log("Could not undo any further.");
        }
    }

    redo(){
        if(this.redoStack.length > 0){
            const state = this.redoStack.pop();

            if(state != null){
                this.history.push(state);
            }
            
            //console.log("Length of history: " + this.history.length);
            //this.truehistory();
            
            this.loadState(Board.base64ToArrayBuffer(this.history[this.history.length - 1]));
            this.saveGame(AUTO_SAVE_SLOT_NAME);
            console.log("Redid last undo.");
        }
        else{
            console.log("Redo stack empty.");
        }
    }

    savePrompt() {
        console.log("SAVEPROMPT");
        let slot : string | null = prompt("Which file would you like to save to? (1-6):", "1");
        //I call upon thee, dark magic of the regex
        if(slot == null) {
            return;
        }
        const promptRe = /^[1-6]{1}$/;
        const match = promptRe.exec(slot);   
        if(match != null) {
            this.saveGame(match[1]);
            confirm("Save Successful");
        } else {
            let choice = confirm("Invalid Slot, would you like to try again?");
            if(choice) {
                this.savePrompt();
            }
        }
    }

    loadPrompt() {
        console.log("LOADPROMPT");
        let slot : string | null = prompt("Which file would you like to load from? (1-6):", "1");
        //I call upon thee, dark magic of the regex
        if(slot == null) {
            return;
        }
        const promptRe = /^[1-6]{1}$/;
        const match = promptRe.exec(slot);
        if(match != null) {
            if(!this.loadGame(match[1])) {
                confirm("No data found in slot " + slot);
            }
        } else {
            let choice = confirm("Invalid Slot, would you like to try again?");
            if(choice) {
                this.loadPrompt();
            }
        }
    }

    deletePrompt() {
        console.log("DELETEPROMPT");
        let slot = prompt("Which file would you like to delete? (1-6):", "1");
        //I call upon thee, dark magic of the regex
        if(slot == null) {
            return;
        }
        const promptRe = /^[1-6]{1}$/;
        const match = promptRe.exec(slot);
        if(match != null) {
            let choice = confirm("Are you sure you want to remove slot " + match[1] + "?")
            if(choice) {
                this.removeSlot(match[1]);
            }
        } else {
            let choice = confirm("Invalid Slot, would you like to try again?");
            if(choice) {
                this.deletePrompt();
            }
        }
    }

    removeSlot(slot) {
        localStorage.removeItem(slot + UNDO_APPEND); // Clear the saved game if they start a new game
        localStorage.removeItem(slot + REDO_APPEND);
    }

    // truehistory(){
    //     const hist = [];
    //     for(let i = 0; i < this.history.length; i++){
    //         const hArr = Board.base64ToArrayBuffer(this.history[i])
    //         const viewer = new DataView(hArr, 0, FRAME_BYTES);
    //         hist[i] = viewer.getUint16(0);
    //     }
    //     console.log("Printing true history");
    //     console.log(hist);
    // }
}