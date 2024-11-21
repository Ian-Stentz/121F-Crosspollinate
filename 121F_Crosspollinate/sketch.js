//canvas dim
let [cw, ch] = [600, 600];
let totalTime = 0;
let [gw, gh] = [6, 6];

//board is represented as a 1d array to take advantage of data locality & it's easier to convert to other languages that don't have easy support for 2d arrays
//(COUGH COUGH UNREAL)
let board = Array(gw*gh).fill({});


//I anticipate there will be either different boards to represent different things or 1 board that contains a lot of data on it.
//The latter will probably be easier to convert to typescript, but might be less efficient and less clean
function getBoard(board, i, j) {
  return board[j * gw + i]
};

function setBoard(board, i, j, newVal) {
  board[j * gw + i] = newVal;
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
    }
  }
}

function setup() {
  createCanvas(cw, ch);

}

function myUpdate(delta) {
  totalTime += delta/1000;
}

function keyPressed() {

}

function draw() {
  myUpdate(deltaTime);
  background(220);
  drawBoard();
}