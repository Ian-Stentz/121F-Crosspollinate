class ColorSelectionScene extends Phaser.Scene {
    constructor() {
        super("ColorSelectionScene");
    }

    create() {
        // Create UI elements for selecting a language
        let gamebackground = this.add.rectangle(0, 0, 4*config.width, 4*config.height, gameTheme, 1);
        const title = this.add.text(config.width / 2, config.height / 4, 'Select Theme', { fontSize: '30px' }).setOrigin(0.5);
        
        // Create buttons for each language
        const redButton = this.add.text(config.width / 2, config.height / 2 - 50, 'Red', { fontSize: '25px' })
            .setOrigin(0.5)
            .setInteractive();
        
        const greenButton = this.add.text(config.width / 2, config.height / 1.6 - 50, 'Green', { fontSize: '25px' })
            .setOrigin(0.5)
            .setInteractive();

        // Right to left script
        const blueButton = this.add.text(config.width / 2, config.height / 1.35 - 50, 'Blue', { fontSize: '25px' })
            .setOrigin(0.5)
            .setInteractive();

        // Locographic script
        const yellowButton = this.add.text(config.width / 2, config.height / 1.16 - 50, 'Yellow', { fontSize: '25px' })
            .setOrigin(0.5)
            .setInteractive();
        const pinkButton = this.add.text(config.width / 2, config.height / 1 - 50, 'Pink', { fontSize: '25px' })
            .setOrigin(0.5)
            .setInteractive();

        // Add event listeners to each button
        redButton.on('pointerdown', () => this.selectColor(0x400000));
        greenButton.on('pointerdown', () => this.selectColor(0x104000));
        blueButton.on('pointerdown', () => this.selectColor(0x002b40));
        yellowButton.on('pointerdown', () => this.selectColor(0x104000));
        pinkButton.on('pointerdown', () => this.selectColor(0x400040));

    }

    // Change the color and move to the menu scene
    selectColor(gameColor) {
        //config.gameColor = gameColor;
        gameTheme = gameColor;
        console.log("background color is now: " + gameColor)
        this.scene.start('menuScene');
    }

    // Optional: Add styles to buttons
    styleButton(button) {
        button.setInteractive()
            .on('pointerover', () => button.setStyle({ fill: '#ff0' }))  // Highlight button on hover
            .on('pointerout', () => button.setStyle({ fill: '#fff' }));  // Revert button style when not hovered
    }
}
