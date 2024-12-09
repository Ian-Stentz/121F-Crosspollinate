class LanguageSelectionScene extends Phaser.Scene {
    constructor() {
        super("languageSelectionScene");
    }

    preload() {
        // Load localization file
        this.load.json('localization', 'assets/localization.json');
    }

    create() {
        // Create UI elements for selecting a language
        const title = this.add.text(config.width / 2, config.height / 4, 'Select Language', { fontSize: '30px' }).setOrigin(0.5);
        
        // Create buttons for each language
        const englishButton = this.add.text(config.width / 2, config.height / 2, 'English', { fontSize: '25px' })
            .setOrigin(0.5)
            .setInteractive();
        
        const spanishButton = this.add.text(config.width / 2, config.height / 1.6, 'Español', { fontSize: '25px' })
            .setOrigin(0.5)
            .setInteractive();
        
        const frenchButton = this.add.text(config.width / 2, config.height / 1.35, 'Français', { fontSize: '25px' })
            .setOrigin(0.5)
            .setInteractive();

        // Add event listeners to each button
        englishButton.on('pointerdown', () => this.selectLanguage('en'));
        spanishButton.on('pointerdown', () => this.selectLanguage('es'));
        frenchButton.on('pointerdown', () => this.selectLanguage('fr'));

        // Style the buttons (optional)
        this.styleButton(englishButton);
        this.styleButton(spanishButton);
        this.styleButton(frenchButton);
    }

    // Change the language and move to the menu scene
    selectLanguage(languageCode) {
        this.registry.set('language', languageCode);  // Set the selected language in the registry
        this.scene.start('menuScene');  // Move to the menu scene
    }

    // Optional: Add styles to buttons
    styleButton(button) {
        button.setInteractive()
            .on('pointerover', () => button.setStyle({ fill: '#ff0' }))  // Highlight button on hover
            .on('pointerout', () => button.setStyle({ fill: '#fff' }));  // Revert button style when not hovered
    }
}
