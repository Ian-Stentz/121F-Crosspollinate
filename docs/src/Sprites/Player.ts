//Individual crops can be handled by a sprite object instead
class Player extends Phaser.GameObjects.Sprite {
    constructor(scene : Phaser.Scene, x : number, y : number, texture : string, frame : number | undefined) {
        super(scene, x, y, texture, frame);
        this.scene = scene;

        scene.add.existing(this);

        return this;
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    tileToOrigin(i, j, tileWidth, tileHeight) {
        return [i * tileWidth + tileWidth * 3 / 4, j * tileHeight + tileHeight / 4];
    }
}