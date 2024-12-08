//Individual crops can be handled by a sprite object instead
/// <reference path="../../lib/phaser.d.ts" />

export class Crop extends Phaser.GameObjects.Sprite {
    private stages : string[];


    constructor(scene : Phaser.Scene, x : number, y : number, textureList : string[], frame : number) {
        super(scene, x, y, textureList[frame], undefined);
        this.stages = textureList;
        this.scene = scene;

        scene.add.existing(this);
        return this;
    }

    overrideType(textureList : string[], stage : number) {
        this.stages = textureList;
        this.setStage(stage);
    }

    setStage(stage : number) {
        this.setTexture(this.stages[stage]);
    }

    remove() {
        this.destroy();
    }
}