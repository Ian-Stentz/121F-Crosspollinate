import { FRAME_BYTES, COORD_BYTES, ENTRY_BYTES, INVENTORY_ENTRY_BYTES, PLANT_TYPES, gridLoc, SUN_BYTES, MOIST_BYTES, CROP_BYTES } from "./commonLib.ts";

export class Board {
    public readonly width : number;
    public readonly height : number;
    public board : ArrayBuffer;
    private frameView : DataView;
    private playerLocView : DataView;
    private inventoryView : DataView;

    constructor(gridWidth : number, gridHeight : number) {
        this.width = gridWidth;
        this.height = gridHeight;
        
        this.board = new ArrayBuffer(FRAME_BYTES + COORD_BYTES + this.width * this.height * ENTRY_BYTES + INVENTORY_ENTRY_BYTES * PLANT_TYPES);

        this.frameView = new DataView(this.board, 0, FRAME_BYTES);
        this.playerLocView = new DataView(this.board, FRAME_BYTES, COORD_BYTES);
        this.inventoryView = new DataView(this.board, FRAME_BYTES + COORD_BYTES + this.width * this.height * ENTRY_BYTES, INVENTORY_ENTRY_BYTES * PLANT_TYPES);
    }

    //TODO : use initial conditions from DSL
    init() : void {
        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                const curEntry : BoardEntry = this.getEntry({x : i, y : j});
                curEntry.sunlight = 10;
                curEntry.moisture = 0;
                curEntry.crop = undefined;
                curEntry.growth = 0;
            }
        }
    }

    getBoard() : ArrayBuffer {
        return this.board
    }

    setBoard(board : ArrayBuffer) {
        this.board = board
        this.frameView = new DataView(this.board, 0, FRAME_BYTES);
        this.playerLocView = new DataView(this.board, FRAME_BYTES, COORD_BYTES);
        this.inventoryView = new DataView(this.board, FRAME_BYTES + COORD_BYTES + this.width * this.height * ENTRY_BYTES, INVENTORY_ENTRY_BYTES * PLANT_TYPES);
    }

    getCurFrame() : number {
        return this.frameView.getUint16(0);
    }

    setCurFrame(frame : number) {
        this.frameView.setUint16(0, frame);
    }

    incrCurFrame() {
        this.setCurFrame(this.getCurFrame() + 1);
    }

    get playerLoc() : gridLoc {
        return {x: this.playerLocView.getUint8(0), y: this.playerLocView.getUint8(1)};
    }

    set playerLoc(loc : gridLoc) {
        this.playerLocView.setUint8(0, loc.x);
        this.playerLocView.setUint8(1, loc.y);
    }

    toIndex(loc : gridLoc) : number {
        return loc.y * this.width + loc.x
    }

    getEntry(loc : gridLoc) : BoardEntry{
        return new BoardEntry(new DataView(this.board, FRAME_BYTES + COORD_BYTES + this.toIndex(loc) * ENTRY_BYTES, ENTRY_BYTES));
    }

    getPlant(i : number) : number {
        return this.inventoryView.getUint16(i * INVENTORY_ENTRY_BYTES);
    }

    setPlant(i : number, plantCount : number) {
        this.inventoryView.setUint16(i * INVENTORY_ENTRY_BYTES, plantCount);
    }

    addPlant(i : number, deltaCount : number) {
        this.setPlant(i, this.getPlant(i) + deltaCount);
    }

    //TODO : needs to be updated to interpret the DSL conditions, moved away from board
    checkWinConditions(plantKeys : number[], targetCount : number) : boolean{
        let winCondition : boolean = true;
        for (const key of plantKeys) {
            if (this.getPlant(key) < targetCount) {
                winCondition = false;
                break;
            }
        }
        return winCondition
    }

    getSaveSize() : number {
        const b64 = Board.arrayBufferToBase64(this.board);
        return b64.length;
    }

    // Static helper function to convert ArrayBuffer to Base64
    static arrayBufferToBase64(buffer : ArrayBuffer) : string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const length = bytes.byteLength;
        for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary); // Base64 encode the binary string
    }

    // Static helper function to convert Base64 back to ArrayBuffer
    static base64ToArrayBuffer(base64 : string) {
        const binaryString = atob(base64); // Base64 decode
        const length = binaryString.length;
        const buffer = new ArrayBuffer(length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < length; i++) {
            view[i] = binaryString.charCodeAt(i);
        }
        return buffer;
    }
}

class BoardEntry {
    private dView : DataView;
    private sunOffset : number;
    private moistureOffset : number;
    private cropOffset : number;
    private growthOffset : number;

    constructor(dView : DataView) {
        this.dView = dView;
        this.sunOffset = 0;
        this.moistureOffset = SUN_BYTES;
        this.cropOffset = SUN_BYTES + MOIST_BYTES;
        this.growthOffset = SUN_BYTES + MOIST_BYTES + CROP_BYTES;
    }

    get sunlight() {
        return this.dView.getUint8(this.sunOffset);
    }

    set sunlight(sun) {
        this.dView.setUint8(this.sunOffset, sun);
    }

    get moisture() {
        return this.dView.getUint8(this.moistureOffset);
    }

    set moisture(moisture) {
        this.dView.setUint8(this.moistureOffset, moisture);
    }

    get crop() : number | undefined{
        const crop = this.dView.getUint8(this.cropOffset);
        if(crop > 0) {
            return crop - 1;
        } else {
            return undefined;
        }
    }

    set crop(crop : number | undefined) {
        if(crop != undefined) {
            this.dView.setUint8(this.cropOffset, crop + 1);
        } else {
            this.dView.setUint8(this.cropOffset, 0);
        }
    }

    get growth() {
        return this.dView.getUint8(this.growthOffset);
    }

    set growth(growth) {
        this.dView.setUint8(this.growthOffset, growth);
    }
}