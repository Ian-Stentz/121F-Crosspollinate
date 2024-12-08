//honestly should be data stored in a JSON not a bunch of objects
//Update from F2: well would you look at that
//don't care about updating to TS, it's going away anyways
class plantType {
    public sunReq : number;
    public moistureReq : number;
    public moistureConsumption : number;
    public growthFrames : string[];

    constructor(sunReq : number, moistureReq : number, moistureConsumption : number, growthFrames : string[]) {
        this.sunReq = sunReq;
        this.moistureReq = moistureReq;
        this.moistureConsumption = moistureConsumption;
        this.growthFrames = growthFrames;
    }

    getGrowthStage(stage) {
        return this.growthFrames[stage];
    }

    getLastStage() {
        return this.growthFrames.length - 1;
    }

    canGrow(sun, moisture, stage){
        //console.log(`sun required ${this.sunReq}, has ${sun}`);
        //console.log(`moisture required ${this.moistureReq}, has ${moisture}`);
        //console.log(`Max growth ${this.getLastStage()}, currently ${stage}`);
        return(sun >= this.sunReq && moisture >= this.moistureReq && stage < this.getLastStage());
    }
}