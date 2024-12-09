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

        // Right to left script
        const arabicButton = this.add.text(config.width / 2, config.height / 1.35, 'العربية', { fontSize: '25px' })
            .setOrigin(1, 0.5)
            .setAlign('right')
            .setInteractive();

        // Locographic script
        const chineseButton = this.add.text(config.width / 2, config.height / 1.12, '中文', { fontSize: '25px' })
            .setOrigin(0.5)
            .setFontFamily('Noto Sans CJK');

        // Add event listeners to each button
        englishButton.on('pointerdown', () => this.selectLanguage('en'));
        spanishButton.on('pointerdown', () => this.selectLanguage('es'));
        arabicButton.on('pointerdown', () => this.selectLanguage('ar'));
        chineseButton.on('pointerdown', () => this.selectLanguage('zh'));

        // Style the buttons (optional)
        this.styleButton(englishButton);
        this.styleButton(spanishButton);
        this.styleButton(arabicButton);
        this.styleButton(chineseButton);
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
