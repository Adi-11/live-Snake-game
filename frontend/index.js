const bACKGROUNDCOLOR = "#231f20";
const SNAKECOLOR = "#c2c2c2";
const FOODCOLOR = "#e66916";
const socket = io("http://localhost:3000");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);

const gameScreen = document.querySelector("#gameScreen");

let canvas, context;


function init() {
  canvas = document.querySelector("#canvas");

  context = canvas.getContext("2d");
  canvas.width = canvas.height = 600;

  context.fillStyle = bACKGROUNDCOLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keyDown);
}

function keyDown(e) {
  console.log(e.keyCode);
}

function paintGame(state) {
  context.fillStyle = bACKGROUNDCOLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  context.fillStyle = FOODCOLOR;
  context.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.player, size, SNAKECOLOR);
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;
  context.fillStyle = color;
  for (let cell of snake) {
    context.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

init();
// paintGame(gameState);

function handleInit(msg) {
  console.log(msg);
}

function handleGameState(gameState) {
  gameState = JSON.parse(gameState);

  requestAnimationFrame(() => paintGame(gameState));
}
