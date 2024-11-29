//canvas dimensions
let [cw, ch] = [600, 600];
let [gw, gh] = [6, 6];

let frame = 0;

//Parameters
const MIN_SUN = 1;
const MAX_SUN = 2;
const WATER_COEFFICIENT = 1.2;
const MAX_WATER = 5;

// Create player object with initial position
let player = {
  x: 0,
  y: 0
};

// Create player marker
let playerImg;
let plant1Imgs;
let plantTypes;
let currentSeed = "Wheat";
let seedPacket = [];

//board is represented as a 1d array to take advantage of data locality & it's easier to convert to other languages that don't have easy support for 2d arrays
//(COUGH COUGH UNREAL)
let board = Array(gw*gh).fill().map(u => {
  return({
    "moisture": 1,
    "sunlight": 0,
    "crop": null,
    "growth": 0,
    "stage": 0,
  })
});

preload();


//I anticipate there will be either different boards to represent different things or 1 board that contains a lot of data on it.
//The latter will probably be easier to convert to typescript, but might be less efficient and less clean
function getBoard(board, i, j) {
  return board[j * gw + i]
};

function setBoard(board, i, j, newVal) {
  board[j * gw + i] = newVal;
}

//useful for getting the canvas location of tiles, for player purposes, etc. Recall that Y is top to bottom in phaser's canvas
function getTileBounds(i, j) {
  let width = cw/gw;
  let height = ch/gh;
  return [i*width, j*height, (i+1)*width, (j+1)*height];
}

function drawBoard() {
  let width = cw/gw;
  let height = ch/gh;
  for (let i = 0; i < gw; i++) {
    for (let j = 0; j < gh; j++) {
      stroke("black");
      strokeWeight(3);
      //in future, fill could change given certain factors or be replaced with a sprite/tile
      fill("#118c13");
      rect(i*width, j*height, width, height);
      stroke("white");
      text("☀️: " + getBoard(board, i, j).sunlight, i*width + width/12, j*height + height/8);
      text("💧: " + getBoard(board, i, j).moisture, i*width + width/12, j*height + height/3);
      if(getBoard(board, i, j)["crop"] != null){
        //fill("#1e833b");
        //rect(i*width+3*width/5, j*height+height/2,width/5, height/3);
        drawPlant(board, i, j);
      }
    }
  }

  // Position the player image
   let playerBounds = getTileBounds(player.x, player.y);
   let imageWidth = playerBounds[2] - playerBounds[0];
   let imageHeight = playerBounds[3] - playerBounds[1];
 
  // Calculate the coordinates to position player in the top-right corner (adjusted for the image width)
   let playerX = playerBounds[0] + imageWidth - imageWidth * 0.45;  // top-right corner of the grid cell
   let playerY = playerBounds[1] + 10;  // top edge of the grid cell
 
  // Scale the image to 50% of its original size and place in the top-right corner
   let scaleFactor = 0.3;
   image(playerImg, playerX, playerY, imageWidth * scaleFactor, imageHeight * scaleFactor);
}

function drawPlant(board, i, j){
  if(getBoard(board, i, j)["crop"] != null){
    //console.log(getBoard(board, i, j).growth);
    image(plantTypes.get(getBoard(board, i, j)["crop"]).getGrowthStage(getBoard(board, i, j).growth), (i + 0.3)*cw/gw, (j + 0.3)*ch/gh, 60, 60);
    
  }
}

// Advance time and simulate enviromental changes
function advanceTime() {
  frame++;
  simMoisture(board);
  simSun(board);
  simGrowth(board);
}

function simMoisture(board){
  for (let i = 0; i < gw; i++) {
    for (let j = 0; j < gh; j++) {
      getBoard(board, i, j).moisture += Math.random() * WATER_COEFFICIENT;
      getBoard(board, i, j).moisture = roundToDec( getBoard(board, i, j).moisture, 1);
      if(getBoard(board, i, j).moisture > MAX_WATER){
        getBoard(board, i, j).moisture = MAX_WATER;
      }
    }
  }
}

function simSun(board){
  const sunshine = randRange(MIN_SUN, MAX_SUN);
  const randTile = [Math.round(randRange(0, gw-1)), Math.round(randRange(0, gh-1))];
  //console.log(randTile);
  for (let i = 0; i < gw; i++) {
    for (let j = 0; j < gh; j++) {
      if(cellDist(randTile, [i,j]) == 0){
        getBoard(board, i, j).sunlight = roundToDec(sunshine * 1, 1);
      }
      else if(cellDist(randTile, [i,j]) == 1){
        getBoard(board, i, j).sunlight = roundToDec(sunshine * .8, 1);
      }
      else if(cellDist(randTile, [i,j]) == 2){
        getBoard(board, i, j).sunlight = roundToDec(sunshine * .6, 1);
      }
      else{
        getBoard(board, i, j).sunlight = roundToDec(sunshine * .4, 1);
      }
    }
  }
}

function simGrowth(board){
  for (let i = 0; i < gw; i++) {
    for (let j = 0; j < gh; j++) {
      if(getBoard(board, i, j)["crop"] != null){
        
        if(plantTypes.get(getBoard(board, i, j)["crop"]).canGrow(getBoard(board, i, j).sunlight, getBoard(board, i, j).moisture, getBoard(board, i, j).growth) ){
          //console.log("growing")
          getBoard(board, i, j).moisture -= plantTypes.get(getBoard(board, i, j)["crop"]).moistureConsumption;
          getBoard(board, i, j).growth++;
        }

        //console.log(getBoard(board, i, j).growth + ", max: " + plantTypes.get(getBoard(board, i, j)["crop"]).getLastStage());
        
        if(getBoard(board, i, j).growth > plantTypes.get(getBoard(board, i, j)["crop"]).getLastStage()){
          getBoard(board, i, j).growth = plantTypes.get(getBoard(board, i, j)["crop"]).getLastStage();
        }
        //drawPlant()
      } 
    }
  }
  
}

function plantCrop(){
  let mousePos = {x: mouseX, y: mouseY};

  let xclicked = 0; let yclicked = 0;
  squareWidth = cw/gw; squareHeight = ch/gh;

  for(let i = 0; i < gw;i++){
    if(mousePos.x > squareWidth){
      mousePos.x -= squareWidth;
      xclicked += 1;
    }
  }
  for(let i = 0; i < gh;i++){
    if(mousePos.y > squareHeight){
      mousePos.y -= squareHeight;
      yclicked += 1;
    }
  }

  if(getBoard(board, xclicked, yclicked)["crop"] == null){
    if(xclicked < gw && yclicked < gh){
      if(Math.abs(player.x - xclicked) <= 1 && Math.abs(player.y - yclicked) <= 1){
        getBoard(board, xclicked, yclicked)["crop"] = currentSeed;
        advanceTime();
      }
    }
  }
  else if(getBoard(board, xclicked, yclicked)["crop"] != null){
    if(xclicked < gw && yclicked < gh){
      if(Math.abs(player.x - xclicked) <= 1 && Math.abs(player.y - yclicked) <= 1)
      harvestCrop(xclicked, yclicked);
    }
  }
  
}

function harvestCrop(x, y) {
  // Check if the crop exists and is ready to harvest
  //console.log(`Max growth ${plantTypes.get(getBoard(board, x, y)["crop"]).getLastStage()}, currently ${getBoard(board, x, y).growth}`);
  if (getBoard(board, x, y)["crop"] != null && getBoard(board, x, y).growth >= plantTypes.get(getBoard(board, x, y)["crop"]).getLastStage()) {
    
    // Add the harvested crop to the inventory (e.g., adding "plant1")
    inventory.addPlant(getBoard(board, x, y)["crop"], 1);  // Increase plant count in the inventory
    
    // console testing  
    console.log("Crop harvested and added to inventory!");
    console.log(`you have ${inventory.getPlantCount(getBoard(board, x, y)["crop"])} ` + getBoard(board, x, y)["crop"]);

    // Harvest the crop, remove it from the board
    getBoard(board, x, y)["crop"] = null;
    getBoard(board, x, y).stage = 0;
    getBoard(board, x, y).growth = 0;
    
    advanceTime();
  }
}

function roundToDec(num, dec){
  const e = 10 ** dec;
  return(Math.round(num*e)/e)
}

function randRange(min, max){
  const dif = max - min;
  return(min + (Math.random() * dif));
}

function cellDist(c1, c2){
  return(Math.abs(c1[0] - c2[0]) + Math.abs(c1[1] - c2[1]));
}

// Preload assets
function preload() {
}

function setup() {
  createCanvas(cw, ch);
  background(220);
  playerImg = loadImage('assets/player.png');
  plant1Imgs = [loadImage('assets/plant1stage0.png'), 
    loadImage('assets/plant1stage1.png'),
    loadImage('assets/plant1stage2.png')
  ]
  plant2Imgs = [loadImage('assets/plantA-0.png'), 
    loadImage('assets/plantA-1.png'),
    loadImage('assets/plantA-2.png'),
    loadImage('assets/plantA-3.png')
  ]
  plant3Imgs = [loadImage('assets/plantB-0.png'), 
    loadImage('assets/plantB-1.png'),
    loadImage('assets/plantB-2.png'),
    loadImage('assets/plantB-3.png')
  ]
  //To be replaced with type objects
  let brambleberry = new plantType(.7, 2.5, 1.5, plant1Imgs);
  let wheat = new plantType(1, 2, 1, plant2Imgs);
  let gilderberry = new plantType(.4, 4, 2.5, plant3Imgs);

  plantTypes = new Map([["Brambleberry", brambleberry], ["Wheat", wheat], ["Gilderberry", gilderberry]]);
  seedPacket = ["Brambleberry", "Wheat", "Gilderberry"];

  for(let plantType of plantTypes.keys()) {
    inventory.setPlantCount(plantType, 0);
  }
}

// Key press event - added player movement
function keyPressed() {
  switch (key) {
    case " ":
      advanceTime();
      break;
    case "w":
    case "ArrowUp":
      if (player.y > 0) { // Move up
        player.y--;
        advanceTime();
      }
      break;
    case "s":
    case "ArrowDown":
      if (player.y < gh - 1) { // Move down
        player.y++;
        advanceTime();
      }
      break;
    case "a":
    case "ArrowLeft":
      if (player.x > 0) { // Move left
        player.x--;
        advanceTime();
      } 
      break;
    case "d":
    case "ArrowRight":
      if (player.x < gw - 1) { // Move right
        player.x++;
        advanceTime();
      }
      break;
    case "1":
      currentSeed = "Brambleberry";
      console.log("Now planting Brambleberry");
      break;
    case "2":
      currentSeed = "Wheat";
      console.log("Now planting Wheat");
      break;
    case "3":
      currentSeed = "Gilderberry";
      console.log("Now planting Gilderberry");
      break;
    case "e":
      winState();
      break;
    default:
      break;
  }
}

function mouseClicked() {
  plantCrop();
}

let gameWon = false;  // Flag to track if the game is won

// Draw function that gets called every frame
function draw() {
  drawBoard();
  
  // If the game is won, display the win message
  if (!gameWon) {
    checkWinState();  // Check for win condition every frame
  }
  
  // If the game is won, display the "You win!" message
  if (gameWon) {
    displayWinMessage();
  }
}

function checkWinState() {
  // Check if the player has at least one of each plant type
  const requiredPlants = ["Brambleberry", "Wheat", "Gilderberry"];
  let hasAllPlants = true;

  for (let plant of requiredPlants) {
    if (inventory.getPlantCount(plant) < 1) {
      hasAllPlants = false;
      break;
    }
  }

  // If the player has all required plants, log the win message and set gameWon flag
  if (hasAllPlants) {
    console.log("You win!");
    gameWon = true;  // Set win flag to true
    noLoop();  // Stops the game loop (optional, to freeze the game)
  }
}

function displayWinMessage() {
  // Set up text style
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255, 0, 0);  // Red color for the win message

  // Display the "You win!" message in the center of the canvas
  text("You win!", cw / 2, ch / 2); 
}