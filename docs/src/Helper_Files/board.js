class Board {
    constructor(gridWidth, gridHeight) {
        this.width = gridWidth;
        this.height = gridHeight;
        
        //TODO: override if saved bytearray / overload the constructor
        this.board = new ArrayBuffer(FRAME_BYTES + COORD_BYTES + this.width * this.height * ENTRY_BYTES + INVENTORY_ENTRY_BYTES * PLANT_TYPES);

        this.frameView = new DataView(this.board, 0, FRAME_BYTES);
        this.playerLocView = new DataView(this.board, FRAME_BYTES, COORD_BYTES);
        this.inventoryView = new DataView(this.board, FRAME_BYTES + COORD_BYTES + this.width * this.height * ENTRY_BYTES, INVENTORY_ENTRY_BYTES * PLANT_TYPES);
    }

    init(startMoisture = 0) {
        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                let curEntry = this.getEntry(i, j);
                curEntry.setSunlight(10);
                curEntry.setMoisture(startMoisture);
                curEntry.setCrop(null);
                curEntry.setGrowth(0);
            }
        }
    }

    getBoard() {
        return this.board
    }

    setBoard(board) {
        this.board = board
        this.frameView = new DataView(this.board, 0, FRAME_BYTES);
        this.playerLocView = new DataView(this.board, FRAME_BYTES, COORD_BYTES);
        this.inventoryView = new DataView(this.board, FRAME_BYTES + COORD_BYTES + this.width * this.height * ENTRY_BYTES, INVENTORY_ENTRY_BYTES * PLANT_TYPES);
    }

    getCurFrame() {
        return this.frameView.getUint16(0);
    }

    setCurFrame(frame) {
        this.frameView.setUint16(0, frame);
    }

    incrCurFrame() {
        this.setCurFrame(this.getCurFrame() + 1);
    }

    getPlayerLoc() {
        return {x: this.playerLocView.getUint8(0), y: this.playerLocView.getUint8(1)};
    }

    setPlayerLoc(x, y) {
        this.playerLocView.setUint8(0, x);
        this.playerLocView.setUint8(1, y);
    }

    toIndex(i, j) {
        return j * this.width + i
    }

    getEntry(i, j) {
        return new BoardEntry(new DataView(this.board, FRAME_BYTES + COORD_BYTES + this.toIndex(i, j) * ENTRY_BYTES, ENTRY_BYTES));
    }

    getPlant(i) {
        return this.inventoryView.getUint16(i * INVENTORY_ENTRY_BYTES);
    }

    setPlant(i, plantCount) {
        this.inventoryView.setUint16(i * INVENTORY_ENTRY_BYTES, plantCount);
    }

    addPlant(i, deltaCount) {
        this.setPlant(i, this.getPlant(i) + deltaCount);
    }

    checkWinConditions(plantKeys, targetCount) {
        let winCondition = true;
        for (let key of plantKeys) {
            if (this.getPlant(key) < targetCount) {
                winCondition = false;
                break;
            }
        }
        return winCondition
    }

    getSaveSize() {
        let b64 = Board.arrayBufferToBase64(this.board);
        return b64.length;
    }

    // Static helper function to convert ArrayBuffer to Base64
    static arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const length = bytes.byteLength;
        for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary); // Base64 encode the binary string
    }

    // Static helper function to convert Base64 back to ArrayBuffer
    static base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64); // Base64 decode
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
    constructor(DataView) {
        this.DataView = DataView;
        this.sunOffset = 0;
        this.moistureOffset = SUN_BYTES;
        this.cropOffset = SUN_BYTES + MOIST_BYTES;
        this.growthOffset = SUN_BYTES + MOIST_BYTES + CROP_BYTES;
    }

    getSunlight() {
        return this.DataView.getUint8(this.sunOffset);
    }

    setSunlight(sun) {
        this.DataView.setUint8(this.sunOffset, sun);
    }

    getMoisture() {
        return this.DataView.getUint8(this.moistureOffset);
    }

    setMoisture(moisture) {
        this.DataView.setUint8(this.moistureOffset, moisture);
    }

    getCrop() {
        let crop = this.DataView.getUint8(this.cropOffset);
        if(crop > 0) {
            return crop - 1;
        } else {
            return undefined;
        }
    }

    setCrop(crop) {
        if(crop != null && crop != undefined) {
            this.DataView.setUint8(this.cropOffset, crop + 1);
        } else {
            this.DataView.setUint8(this.cropOffset, 0);
        }
    }

    getGrowth() {
        return this.DataView.getUint8(this.growthOffset);
    }

    setGrowth(growth) {
        this.DataView.setUint8(this.growthOffset, growth);
    }
}