class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }


    preload() {
        // Load localization file
        this.load.json('localization', 'assets/localization.json');
    }


    init() {
        // Ensure a language is selected (if not, default to English)
        if (!this.registry.has('language')) {
            this.registry.set('language', 'en');
        }
    }


    getTranslation(key) {
        const language = this.registry.get('language');  // Get the language from the registry
        const translations = this.cache.json.get('localization');
        return translations[language][key] || key;
    }


    create() {
        // Retrieve translated strings
        const titleText = this.getTranslation('title');
        const startGameText = this.getTranslation('startgame');


        // Create world objects with translated text
        this.title = this.add.text(config.width / 2, config.height / 4, titleText, { fontSize: '35px' }).setOrigin(0.5);
        let underline = this.add.rectangle(config.width / 2, (1.15 * config.height) / 4, this.title.width, 10, 0xFFFFFF, 0.5);

        this.startgame = this.add.text(config.width / 2, 3 * config.height / 5, startGameText, { fontSize: '18px' }).setOrigin(0.5);
        this.startgame.setInteractive();

        // Handle RTL languages (like Arabic)
        if (language === 'ar') {
            this.startgame.setAlign('right').setOrigin(1, 0.5);  // Right-align for Arabic
            this.title.setAlign('right').setOrigin(1, 0.5);
        } else if (language === 'zh') {
            // Adjust font for Chinese logographic script if necessary
            this.title.setFontFamily('Noto Sans CJK');  // Example font for Chinese
            this.startgame.setFontFamily('Noto Sans CJK');
        }

        const self = this;
        this.input.on('gameobjectdown', function () {
            self.scene.start('farmScene');
        });
    }


    update() {
        // Update logic if necessary
    }
}
