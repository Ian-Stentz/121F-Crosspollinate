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
      if(getBoard(board, i, j).crop != null){
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
  if(getBoard(board, i, j).crop == "crop1"){
    if(getBoard(board, i, j).stage == 0){
      image(plant1Imgs[0], (i + 0.3)*cw/gw, (j + 0.3)*ch/gh, 60, 60);
    }
    else if(getBoard(board, i, j).stage == 1){
        image(plant1Imgs[1], (i + 0.3)*cw/gw, (j + 0.3)*ch/gh, 60, 60);
    }
    else{
      image(plant1Imgs[2], (i + 0.3)*cw/gw, (j + 0.3)*ch/gh, 60, 60);
    }
    //else if(getBoard(board, i, j).stage == 0)
  }
}

function setup() {
  createCanvas(cw, ch);
  background(220);
}

// Key press event - added player movement
function keyPressed() {
  switch (key) {
    case " ":
      advanceTime();
      break;
    case "ArrowUp":
      if (player.y > 0) player.y--; // Move up
      break;
    case "ArrowDown":
      if (player.y < gh - 1) player.y++; // Move down
      break;
    case "ArrowLeft":
      if (player.x > 0) player.x--; // Move left
      break;
    case "ArrowRight":
      if (player.x < gw - 1) player.x++; // Move right
      break;
  }
}

function mouseClicked() {
  plantCrop();
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
  console.log(randTile);
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
      if(getBoard(board, i, j).crop != null){
        getBoard(board, i, j).growth += 
        getBoard(board, i, j).moisture + getBoard(board, i, j).sunlight;
        
        if(getBoard(board, i, j).growth >= 10){
          getBoard(board, i, j).growth= 0;
          getBoard(board, i, j).stage += 1;
        }
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

  if(getBoard(board, xclicked, yclicked).crop == null){
    if(xclicked < gw && yclicked < gh){
      if(Math.abs(player.x - xclicked) <= 1 && Math.abs(player.y - yclicked) <= 1)
      getBoard(board, xclicked, yclicked).crop = "crop1";
    }
  }
  else if(getBoard(board, xclicked, yclicked).stage >= 2){
    if(xclicked < gw && yclicked < gh){
      if(Math.abs(player.x - xclicked) <= 1 && Math.abs(player.y - yclicked) <= 1)
      getBoard(board, xclicked, yclicked).crop = null;
      getBoard(board, xclicked, yclicked).stage = 0;
      getBoard(board, xclicked, yclicked).growth = 0;
    }
  }
  
}

function harvestCrop(){

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
  playerImg = loadImage('assets/player.png');
  plant1Imgs = [loadImage('assets/plant1stage0.png'), 
    loadImage('assets/plant1stage1.png'),
    loadImage('assets/plant1stage2.png')
  ]
}

// Draw function that gets called every frame
function draw() {
  drawBoard();
}

