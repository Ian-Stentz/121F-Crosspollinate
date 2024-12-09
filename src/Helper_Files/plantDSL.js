
class PlantType{
    id;
    plantName;

    stages;
    sprites;

    sunReq;
    waterReq;
    waterCons;

    adjacencies;
    parents;

    unlocked;
    constructor(){
        this.id = -1;
        this.plantName = "Plant";
        
        this.stages = 4;
        this.sprites = [{stage: 0, sprite: "sprite1"}, {stage: 3, sprite: "sprite2"}];

        this.sunReq = 9;
        this.waterReq = 20;
        this.waterCons = 10;

        this.adjacencies = []; // contains object of format {crop: string, bonus: number}
        this.parents = [];
        this.unlocked = false;
    };

    isStarter(){
        return(this.parents.length < 1);
    }

    canCrossbreed(adjacent){
        if(this.isStarter()){ //starter crops can't be crossbred
            return(false);
        }

        for(let i in this.parents){
            let hasParent = false;
            for(let j in adjacent){
                if(i == j){
                    hasParent = true;
                    break;
                }
            }
            if(!hasParent){
                return(false);
            }
        }

        return(true);
    }

    canGrow(sun, water, stage, adjacent){ //if crop can't grow, returns -1, otherwise returns water cost
        const c = this.getCoeff(adjacent); //grabs the adjacency coefficient that multiplies all requirements

        if(this.sunReq * c < sun && this.waterReq * c < water && stage < this.stages - 1){
            return(this.waterCons * c);
        }
        return(-1);
    }

    getCoeff(adjacent){ 
        let c = 1;

        for(let i = 0; i < this.adjacencies.length; i++){
            for(let j = 0; j < adjacent.length; j++){
                if(this.adjacencies[i].crop == adjacent[j]){
                    c /= this.adjacencies[i].bonus;
                }
            }
        }
        return(c);
    }

    getSprite(stage){
        let outSprite = "";

        for(let s in this.sprites){
            if(stage >= this.sprites[s].stage){

                outSprite = this.sprites[s].sprite;
            }
        }

        return(outSprite);
    }
    
    getLastStage(){
        return(this.stages-1);
    }

}

function plantCompiler(plantProgram, sprites){
    let newPlant = new PlantType();

    const plantLang = {
        ID: function(id){
            newPlant.id = id;
        },
        Name: function(n){
            newPlant.plantName = n;
        },
        Stages: function(stages){
            newPlant.stages = stages;
        },
        Sprites: function(sprites){
            newPlant.sprites = sprites;
        },
        SunNeeded: function(sun){
            newPlant.sunReq = sun;
        },
        WaterNeeded: function(water){
            newPlant.waterReq = water;
        },
        WaterConsumed: function(water){
            newPlant.waterCons = water;
        },
        Adjacencies: function(adj){
            newPlant.adjacencies = adj;
        },
        Parents: function(parents){
            newPlant.parents = parents;
        }
    }

    plantProgram(plantLang);
    return(newPlant);
}

