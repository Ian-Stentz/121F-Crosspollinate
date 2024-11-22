//canvas dim
let [cw, ch] = [600, 600];
let [gw, gh] = [6, 6];

let frame = 0;

//Params

const MIN_SUN = 1;
const MAX_SUN = 2;
const WATER_COEFFICIENT = 1.2;
const MAX_WATER = 5;


//board is represented as a 1d array to take advantage of data locality & it's easier to convert to other languages that don't have easy support for 2d arrays
//(COUGH COUGH UNREAL)
let board = Array(gw*gh).fill().map(u => {
  return({
    "moisture": 1,
    "sunlight": 0,
    "crop": null
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
    }
  }
}

function setup() {
  createCanvas(cw, ch);
  background(220);
}

function keyPressed() {
  switch (key) {
    case " ":
      advanceTime();
      break;
  }
}

function advanceTime() {
  frame++;
  simMoisture(board);
  simSun(board);
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

function draw() {
  drawBoard();
}