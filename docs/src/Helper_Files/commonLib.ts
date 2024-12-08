interface gridLoc {
    x : number,
    y : number
}

interface plantFrames {
    frames: string[];
}

function randRange(min : number, max : number) : number {
    const dif = max - min;
    return(min + (Math.random() * dif));
}

//inclusive min and max
function randIntRange(min : number, max : number) : number {
    return Math.floor(randRange(min, max + 1));
}

function cellDistManhattan(c1 : gridLoc, c2 : gridLoc) : number {
    return(Math.abs(c1.x - c2.x) + Math.abs(c1.y - c2.y));
}

function cellDistOctal(c1 : gridLoc, c2 : gridLoc) : number {
    return(Math.max(Math.abs(c1.x - c2.x), Math.abs(c1.y - c2.y)));
}