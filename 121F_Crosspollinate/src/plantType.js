//honestly should be data stored in a JSON not a bunch of objects
class plantType {
    constructor(sunReq, moistureReq, moistureConsumption, growthFrames) {
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