//Individual crops can be handled by a sprite object instead
class Crop extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureList, frame) {
        super(scene, x, y, textureList[frame], null);
        this.stages = textureList;
        this.scene = scene;

        scene.add.existing(this);

        return this;
    }

    setStage(stage) {
        this.texture = textureList[stage];
    }

    remove() {
        this.destroy();
    }
}