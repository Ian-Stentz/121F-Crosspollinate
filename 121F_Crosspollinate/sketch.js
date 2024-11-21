//canvas dim
let cw = 600, ch = 600;
let totalTime = 0;

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

}