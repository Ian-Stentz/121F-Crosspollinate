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

    getStages() {
        return this.growthFrames.length;
    }
}