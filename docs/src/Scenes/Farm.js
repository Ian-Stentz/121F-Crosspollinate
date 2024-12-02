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

        // this.brambleberry = new plantType(.7, 2.5, 1.5, plant1Imgs);
        // this.wheat = new plantType(1, 2, 1, plant2Imgs);
        // this.gilderberry = new plantType(.4, 4, 2.5, plant3Imgs); 

        // plantTypes = new Map([["Brambleberry", brambleberry], ["Wheat", wheat], ["Gilderberry", gilderberry]]);
        // seedPacket = Array.from(plantTypes.keys());
      
        // for(let plantType of plantTypes.keys()) {
        //   inventory.setPlantCount(plantType, 0);
        // }

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

        //debug input
        this.input.keyboard.on('keydown-P', () => {this.sunUpdate(0, 1, 5)}, this);
    }

    tick() {
        //no update, only our turn-based tick
        this.frame++;
    }

    update() {
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
                this.eventEmitter.on("sunUpdate" + i + j, (newSun) => {
                    sunText.text = "☀️: " + newSun;
                }, this)
                let waterText = this.add.text(i*this.tileWidth + 2, j*this.tileHeight + fontSize + padding, "💧: " + this.board.getEntry(i, j).moisture, fontSettings).setOrigin(0);
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

    sunUpdate(x, y, newSun) {
        this.eventEmitter.emit("sunUpdate" + x + y, newSun);
    }
}