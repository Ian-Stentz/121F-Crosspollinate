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

        // Get current language from registry
        const language = this.registry.get('language') || 'en';
        
        // Retrieve translated strings
        const titleText = this.getTranslation('title');
        const startGameText = this.getTranslation('startgame');

        // Create world objects with translated text
        console.log("making rectangle3 of color: " + gameTheme);
        let gamebackground = this.add.rectangle(0, 0, 16*config.width, 16*config.height, gameTheme, 1);
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

        let controltxt; 
        switch(gameLang){
            case 'en':
                controltxt = 'Use ← ↑ → ↓ to move. \n Click to plant or harvest. \n Use number keys to change equipped seed.'
                break;
            case 'es':
                controltxt = 'Usa ← ↑ → ↓ para moverte. \n Haga clic para plantar o cosechar. \n Usa las teclas numéricas para cambiar la semilla equipada.'
                break;
            case 'ar':
                controltxt = 'استخدم ← ↑ → ↓ للتحرك. \n انقر للزراعة أو الحصاد. \n استخدم مفاتيح الأرقام لتغيير البذور المجهزة.'
                break;
            case 'zh':
                controltxt = '使用 ← ↑ → ↓ 移动。 \n 点击种植或收获。 \n 使用数字键来更改装备的种子。'
                break;
        }
        const title = this.add.text(config.width / 2, 3 *config.height / 4, controltxt, { fontSize: '15px' }).setOrigin(0.5);
    }


    update() {
        // Update logic if necessary
    }
}
