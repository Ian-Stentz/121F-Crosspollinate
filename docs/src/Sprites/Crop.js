//Individual crops can be handled by a sprite object instead
class Crop extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.scene = scene;

        scene.add.existing(this);

        return this;
    }
}