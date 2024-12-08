class Menu extends Phaser.Scene {
    private title : Phaser.GameObjects.Text;
    private startgame : Phaser.GameObjects.Text;

    constructor() {
        super("menuScene");
    }

    preload() {
        //any loading not done in Load.js goes here
    }

    init() {
        //any initialization of global variables go here
    }

    create() {
        //creation of world objects goes here

        this.title = this.add.text(config.width/2, config.height/4, 'Farm Simulator', {fontSize: '35px'}).setOrigin(0.5);
        let underline = this.add.rectangle(config.width/2, (1.15*config.height)/4, this.title.width, 10, 0xFFFFFF, .5);

        this.startgame = this.add.text(config.width/2, 3*config.height/5, 'Start Farming', {fontSize: '18px'}).setOrigin(0.5);
        this.startgame.setInteractive(); const self = this;
        this.input.on('gameobjectdown', function () {

            self.scene.start('farmScene');
    
        });
    }

    update() {
        //update function goes here
    }

    //helper functions go here
}