class Farm extends Phaser.Scene {
    constructor() {
        super("farmScene");
        this.start_moisture = 0;
        this.SCENARIO = null;
        this.weatherEvents = [];
    }

    preload() {
        //any loading not done in Load.js goes here
    }

    init() {
        console.log("initialized");
        //any initialization of global variables go here
        this.eventEmitter = new Phaser.Events.EventEmitter();

        let wheat = new plantType(7, 25, 15, my.crops.plantB);
        let brambleberry = new plantType(10, 20, 10, my.crops.plantC);
        let gilderberry = new plantType(4, 40, 25, my.crops.plantD); 

        this.PlantTypes = [];
        this.seedsInPlay = [];
        for(let i = 0; i< my.plantLibrary.length; i++){
            console.log(my.plantLibrary[i]);
            this.PlantTypes.push(plantCompiler(my.plantLibrary[i]));
            if(this.PlantTypes[i].isStarter()){
                this.seedsInPlay.push(i);
            }
        }
        
        
        // seedPacket = Array.from(plantTypes.keys());

        this.board = new Board(tileDim.width, tileDim.height);
        this.board.setCurFrame(0);
        this.board.setPlayerLoc(0, 0);

        this.tileWidth = game.config.width / tileDim.width;
        this.tileHeight = (game.config.height - HEIGHT_UNUSED_FOR_TILES) / tileDim.height;

        this.SAVESIZE = this.board.getSaveSize();
        //console.log(this.SAVESIZE);

        this.history = [];
        this.redoStack = [];

        
        this.gameFrozen = false;

        plantTypes = [wheat, brambleberry, gilderberry];
        
        this.slot = 0;
        this.currentSeed = this.seedsInPlay[this.slot];

        for(let i = 0; i < plantTypes.length; i++) {
          this.board.setPlant(i, 0); //intializes plants in inventory
        }
    }

    create() {
        buttonShelf = document.querySelector("#shelf");
        console.log("BUTTON SHELF: " + buttonShelf);
        console.log("logging plant types");
        console.log(this.PlantTypes);
        console.log(this.seedsInPlay);
        //Create all the objects needed for this scene
        this.drawBoard();

        this.createPlayer();

        //TODO: Internationalize
        this.heldseed = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES, 'Held Seed: Plant ' + (this.currentSeed + 1), {fontSize: '20px', color:"#FEE"}).setOrigin(0);
        this.harvested = this.add.text(0, config.height - HEIGHT_UNUSED_FOR_TILES/2, 'Harvested Total: 0, 0, 0 ', {fontSize: '20px', color:"#EFE"}).setOrigin(0);
        
        this.initCropSprites();

        let scenarios = this.cache.json.get("ExternalConditions");
        console.log(scenarios);
    
        // Check if there is an auto-save
        const savedState = localStorage.getItem(AUTO_SAVE_SLOT_NAME + UNDO_APPEND);
        if (savedState) {
            // Prompt the player to continue or start a new game
            //TODO: Internationalize
            const continueGame = confirm("Do you want to continue from where you left off?");
            if (continueGame) {
                console.log("reloading past game...");
                this.loadGame(AUTO_SAVE_SLOT_NAME);
            } else {
                this.removeSlot(AUTO_SAVE_SLOT_NAME);
                console.log("initializing new game...");
                this.promptScenario();
                this.board.init(this.start_moisture);
                this.updateAllCellTexts();
                this.record();
                //this.scene.restart();  // Restart the scene to initialize a new game
            }
        } else {
            this.promptScenario();
            this.board.init(this.start_moisture);
            this.updateAllCellTexts();
            this.record();
        }
        // Inputs for movement and other actions
        this.input.keyboard.on('keydown-SPACE', () => { if (!this.gameFrozen) { this.tick() } }, this);
        this.input.keyboard.on('keydown-W', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [0, -1]) } }, this);
        this.input.keyboard.on('keydown-A', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [-1, 0]) } }, this);
        this.input.keyboard.on('keydown-S', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [0, 1]) } }, this);
        this.input.keyboard.on('keydown-D', () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [1, 0]) } }, this);
        this.input.keyboard.on('keydown-U', () => { if (!this.gameFrozen) { this.undo() } }, this);
        this.input.keyboard.on('keydown-I', () => { if (!this.gameFrozen) { this.redo() } }, this);
        this.input.on('pointerdown', (e) => {
            if (e.button == 0) {
                if (!this.gameFrozen) { this.clickCell(e.x, e.y) };
            }
        });
        this.input.keyboard.on(`keydown-O`, this.savePrompt, this);
        this.input.keyboard.on(`keydown-P`, this.loadPrompt, this);
        this.input.keyboard.on(`keydown-L`, this.deletePrompt, this);
        this.input.keyboard.on(`keydown-ONE`, () => { this.switchCurSeed(0);}, this);
        this.input.keyboard.on(`keydown-TWO`, () => { this.switchCurSeed(1);}, this);
        this.input.keyboard.on(`keydown-THREE`, () => { this.switchCurSeed(2);}, this);
        this.input.keyboard.on(`keydown-E`, () => { this.changeSeed(1);}, this);
        this.input.keyboard.on(`keydown-Q`, () => { this.changeSeed(-1);}, this);

        //create buttons in the button shelf
        
        createButton("⌛", () => { if (!this.gameFrozen) { this.tick() } });
        createButton("⬆️", () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [0, -1]) } });
        createButton("⬅️", () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [-1, 0]) } });
        createButton("⬇️", () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [0, 1]) } });
        createButton("➡️", () => { if (!this.gameFrozen) { this.movePlayerDir(my.player, [1, 0]) } });
        createButton("⏪", () => { this.changeSeed(-1);});
        createButton("⏩", () => { this.changeSeed(1);})
        createButton("↩️", () => { if (!this.gameFrozen) { this.undo() } });
        createButton("↪️", () => { if (!this.gameFrozen) { this.redo() } });
        createButton("💾", () => { this.savePrompt() });
        createButton("🔄", () => { this.loadPrompt() });
        createButton("🚮", () => { this.deletePrompt() });
        
        this.eventEmitter.on("checkWin", () => { this.checkWinCon() }, this);
    }

    createPlayer() {
        console.log("Initializing new player...");
        my.player = new Player(this, 0, 0, "player", null);
        let playerScale = (this.tileWidth - 3) / (my.player.height * 2);
        my.player.setScale(playerScale, playerScale);
        this.movePlayerPos(my.player, 0, 0); // Set initial position
        console.log('Player placed at default position');
    }

    switchCurSeed(seed) {
        console.log("seed: " + seed)
        if(this.SCENARIO != null) {
            if(this.seedsInPlay.includes(seed)) {
                this.currentSeed = seed;
            }
        } else {
            this.currentSeed = seed;
        }
        this.hudUpdate();
    }

    initCropSprites() {
        this.cropSprites = {};
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
        console.log("player position: " + u + " " + v);
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
        // console.log(highestSunshine);
        // console.log(randTile);
        console.log(this.weatherEvents);
        let frameSunMod = 1;
        let frameMoistureMod = 1;
        let frameFlatMoisture = 0;
        for(let i = 0; i < this.weatherEvents.length; i++) {
            const weather = this.weatherEvents[i];
            if(weather.frameInWeather(this.board.getCurFrame())) {
                console.log("WEATHER REPORT: " + weather.weatherType);
                switch(weather.weatherType) {
                    case "sunny":
                        frameSunMod *= 1.2;
                        break;
                    case "damp":
                        frameMoistureMod *= 1.2;
                        frameFlatMoisture += 1;
                        break;
                    case "hot":
                        frameSunMod *= 1.2;
                        frameFlatMoisture -= 5;
                        break;
                    case "dry":
                        frameMoistureMod *= 0.6;
                        frameFlatMoisture -= 1;
                        break;
                    case "stormy":
                        frameMoistureMod *= 2;
                        frameSunMod *= 0.2;
                        break;
                    case "risk_of_rain":
                        if(randRange(0, 1) > 0.65) {
                            frameMoistureMod *= 2;
                            frameSunMod *= 0.2;
                        }
                        break;
                }
            }
        }
        const highestSunshine = randIntRange((MAX_SUN + MIN_SUN) / 2 * frameSunMod, MAX_SUN * frameSunMod);
        const randTile = [randIntRange(0, this.board.width), randIntRange(0, this.board.height)];
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                //Load Entry
                let curEntry = this.board.getEntry(i, j);
                //Moisture Simulation
                curEntry.setMoisture(Math.min(curEntry.getMoisture() + Math.floor(Math.random() * WATER_COEFFICIENT * frameMoistureMod) + frameFlatMoisture, MAX_WATER));

                //Sunshine Simulation
                curEntry.setSunlight(Math.max(MIN_SUN, Math.round(highestSunshine * Math.max(0.4, (1 - (cellDistManhattan(randTile, [i,j]) * 0.1))))));

                this.textUpdate(i, j);

                //Growth Simulation
                if(curEntry.getCrop() != undefined){
                    const cost = this.PlantTypes[curEntry.getCrop()].canGrow(curEntry.getSunlight(), curEntry.getMoisture(), curEntry.getGrowth(), ["fallow"])
                    if(cost > -1){
                        curEntry.setMoisture(curEntry.getMoisture() - cost);
                        curEntry.setGrowth(curEntry.getGrowth() + 1);
                        //this.cropSprites[[i,j].toString()].setStage(curEntry.getGrowth());
                        this.plantCropSprite(i, j, curEntry.getCrop(), curEntry.getGrowth());
                    }
                }
            }
        }
      }

    textUpdate(x, y) {
        this.eventEmitter.emit("updateCell" + x + y);
    }

    //TODO : internationalize
    hudUpdate(){
        this.heldseed.text = 'Held Seed: ' + this.PlantTypes[this.currentSeed].plantName; (this.currentSeed + 1);
        let harvestText = "Harvested Total: " + this.board.getPlant("0") + ", " + this.board.getPlant("1") + ", " + this.board.getPlant("2");  // can also call e.g. this.board.getPlant("wheat")
        this.harvested.text = harvestText;
    }

    changeSeed(dir){
        this.slot += dir;

        if(this.slot < 0){
            this.slot = this.seedsInPlay.length - 1;
        }
        if(this.slot >= this.seedsInPlay.length){
            this.slot = 0;
        }

        console.log(this.slot);

        this.currentSeed = this.seedsInPlay[this.slot];
        console.log(this.currentSeed)
        this.hudUpdate();
    }

    clickCell(mx, my){
        let [u, v] = [Math.floor(mx / this.tileWidth), Math.floor(my / this.tileHeight)];
        let curLoc = this.board.getPlayerLoc()
        if(cellDistOctal([curLoc.x, curLoc.y], [u, v]) <= 1){
            let entry = this.board.getEntry(u, v);
            if(entry.getCrop() == undefined){
                this.plantNewCrop(u, v, this.currentSeed);
            } else {
                this.harvestCrop(u, v);
            }
        }
    }

    plantNewCrop(u, v, seed) {
        let entry = this.board.getEntry(u, v);
        entry.setCrop(seed);
        entry.setGrowth(0);
        this.plantCropSprite(u, v, seed, 0);
        this.tick();
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
        //cropSprite.overrideType(plantTypes[type].growthFrames, growth);
        console.log(this.PlantTypes[type].getSprite(growth));
        cropSprite.setTexture(this.PlantTypes[type].getSprite(growth));
        let plantScale = (this.tileWidth) / (cropSprite.width * 2);
        cropSprite.setScale(plantScale, plantScale);
        cropSprite.setVisible(true);
    }
    
    harvestCrop(u, v) {
        let entry = this.board.getEntry(u, v);
        //let curEntry = this.board.getEntry(i, j);
        if(entry.getGrowth() == this.PlantTypes[(entry.getCrop())].getLastStage()) {
            this.cropSprites[[u,v].toString()].setVisible(false);
            this.board.addPlant(entry.getCrop(), 1);
            entry.setCrop(undefined);
            entry.setGrowth(0);
            this.eventEmitter.emit("checkWin");
            this.hudUpdate();
            this.tick();
        }
    }

    checkWinCon() {
        if(this.board.checkWinConditions(this.winCon)) {
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

    saveGame(saveSlot) {
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
        localStorage.setItem(saveSlot+"SCENARIO", JSON.stringify(this.SCENARIO));
        console.log("Game Saved!");
    }
    

    loadGame(saveSlot) {
        const savedState = localStorage.getItem(saveSlot+UNDO_APPEND);
        const redoState = localStorage.getItem(saveSlot+REDO_APPEND);
        const scenario = JSON.parse(localStorage.getItem(saveSlot+"SCENARIO"));
        
        if (savedState) {
            console.log("Found save, string length:" + savedState.length);
            this.loadScenarioObj(scenario);

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
        let playerPos = this.board.getPlayerLoc();

        // Ensure the player exists (if not created yet) before trying to move
        if (my.player == null) {
            //console.log("creating player");
            my.player = new Player(this, 0, 0, "player", null);
            let playerScale = (this.tileWidth - 3) / (my.player.height * 2);
            my.player.setScale(playerScale, playerScale);
        }
        
        // Move player sprite to restored position
        this.movePlayerPos(my.player, playerPos.x, playerPos.y);
        
        // Restore plants after initializing the board
        this.restorePlants();

        
        this.updateAllCellTexts();
        this.hudUpdate();

        //may need to save on harvestCrop() and check win conditon here when loading, so if the game has been won recreate win screen
    }

    updateAllCellTexts() {
        for(let i = 0; i < this.board.width; i++) {
            for(let j = 0; j < this.board.height; j++) {
                this.textUpdate(i, j);
            }
        }
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
        let curEntry = this.board.getEntry(u, v);
        let curSprite = this.cropSprites[[u,v].toString()];
        let entryCrop = curEntry.getCrop();
        if(entryCrop == undefined) {
            curSprite.visible = false;
        }
        else {
            this.plantCropSprite(u,v,curEntry.getCrop(),curEntry.getGrowth());
        }
    }

    record(){ //adds current game state to history array

        // Gets a copy of the ArrayBuffer containing the entire game state
        const boardState = Board.arrayBufferToBase64(this.board.getBoard());
        this.history.push(boardState);
        //console.log("Length of history: " + this.history.length);
        this.truehistory();
    }

    undo(){
        if(this.history.length > 1){
            const state = this.history.pop();

            if(state != null){
                this.redoStack.push(state);
            }
            
            //console.log("Length of history: " + this.history.length);
            this.truehistory();
            
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
            this.truehistory();
            
            this.loadState(Board.base64ToArrayBuffer(this.history[this.history.length - 1]));
            this.saveGame(AUTO_SAVE_SLOT_NAME);
            console.log("Redid last undo.");
        }
        else{
            console.log("Redo stack empty.");
        }
    }

    //TODO : prompts internationalized
    savePrompt() {
        console.log("SAVEPROMPT");
        let slot = prompt("Which file would you like to save to? (1-6):", 1)
        //I call upon thee, dark magic of the regex
        const promptRe = /^[1-6]{1}$/;
        slot = promptRe.exec(slot);
        if(slot != null) {
            this.saveGame(slot);
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
        let slot = prompt("Which file would you like to load from? (1-6):", 1)
        //I call upon thee, dark magic of the regex
        const promptRe = /^[1-6]{1}$/;
        slot = promptRe.exec(slot);
        if(slot != null) {
            if(!this.loadGame(slot)) {
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
        let slot = prompt("Which file would you like to delete? (1-6):", 1)
        //I call upon thee, dark magic of the regex
        const promptRe = /^[1-6]{1}$/;
        slot = promptRe.exec(slot);
        if(slot != null) {
            let choice = confirm("Are you sure you want to remove slot " + slot + "?")
            if(choice) {
                this.removeSlot(slot);
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

    truehistory(){
        const hist = [];
        for(let i = 0; i < this.history.length; i++){
            const hArr = Board.base64ToArrayBuffer(this.history[i])
            const viewer = new DataView(hArr, 0, FRAME_BYTES);
            hist[i] = viewer.getUint16(0);
        }
        console.log("Printing true history");
        console.log(hist);
    }

    promptScenario() {
        //TODO : Internationalize
        let promptstring = "Select a scenario: "
        const scenarios = this.cache.json.get("ExternalConditions")
        for(const scenarioName in scenarios) {
            promptstring += scenarioName + ", "
        }
        promptstring = promptstring.slice(0,-2);
        const scenario = prompt(promptstring)
        this.loadScenario(scenario);
    }

    loadScenario(scenario) {
        const scenarioObj = this.cache.json.get("ExternalConditions")[scenario];
        console.log(scenarioObj);
        if(scenarioObj == undefined || scenarioObj == null) {
            return;
        }
        this.SCENARIO = scenarioObj;
        this.loadScenarioObj(scenarioObj);
    }

    loadScenarioObj(scenarioObj) {
        if(scenarioObj == null || scenarioObj == undefined) {
            this.SCENARIO = null;
            return;
        }
        this.SCENARIO = scenarioObj;
        console.log("OBJ: " + JSON.stringify(scenarioObj));
        //set start moisture
        if(scenarioObj.start_moisture != undefined) {
            this.start_moisture = scenarioObj.start_moisture
        } else {
            this.start_moisture = 0;
        }
        //set available plants
        if(scenarioObj.seeds_in_play != undefined) {
            this.seedsInPlay = [];
            for (let seed of scenarioObj.seeds_in_play) {
                this.seedsInPlay.push(cropToNumber(seed));
                console.log(cropToNumber(seed));
            }
            console.log(this.seedsInPlay);
            this.switchCurSeed(Math.min(...this.seedsInPlay));
        }
        //set win conditions
        this.winCon = scenarioObj.win_conditions;
        //schedule weather
        const weatherConds = scenarioObj.weather_conditions
        for(let weatherCond of weatherConds) {
            if(weatherCond != undefined) {
                switch (weatherCond.length) {
                    case 1:
                        this.weatherEvents.push(new Weather(weatherCond[0]))
                        break;
                    case 2:
                        this.weatherEvents.push(new Weather(weatherCond[0], weatherCond[1]))
                        break;
                    case 3:
                        this.weatherEvents.push(new Weather(weatherCond[0], weatherCond[1], weatherCond[2]))
                        break;
                }
            }
        }
    }
}