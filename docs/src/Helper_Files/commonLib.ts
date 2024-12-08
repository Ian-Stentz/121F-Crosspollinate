export const tileDim = { width: 6, height : 6};
export const my = {crops : new Map<string, string[]>()}

export const MIN_SUN = 0;
export const MAX_SUN = 20;
export const WATER_COEFFICIENT = 12;
export const MAX_WATER = 50;
export const HEIGHT_UNUSED_FOR_TILES = 50;

export const FRAME_BYTES = 2;
export const COORD_BYTES = 2;
export const SUN_BYTES = 1;
export const MOIST_BYTES = 1;
export const CROP_BYTES = 1;
export const GROWTH_BYTES = 1;
export const ENTRY_BYTES = SUN_BYTES + MOIST_BYTES + CROP_BYTES + GROWTH_BYTES;
export const INVENTORY_ENTRY_BYTES = 2;
export const PLANT_TYPES = 3;

export const AUTO_SAVE_SLOT_NAME = 'autoSave';
export const UNDO_APPEND = 'History';
export const REDO_APPEND = 'Redo';

export interface gridLoc {
    x : number,
    y : number
}

export interface plantFrames {
    frames: string[];
}

export function randRange(min : number, max : number) : number {
    return(min + (Math.random() * (max - min)));
}

//inclusive min and max
export function randIntRange(min : number, max : number) : number {
    return Math.floor(randRange(min, max + 1));
}

export function cellDistManhattan(c1 : gridLoc, c2 : gridLoc) : number {
    return(Math.abs(c1.x - c2.x) + Math.abs(c1.y - c2.y));
}

export function cellDistOctal(c1 : gridLoc, c2 : gridLoc) : number {
    return(Math.max(Math.abs(c1.x - c2.x), Math.abs(c1.y - c2.y)));
}