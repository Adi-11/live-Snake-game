const BG_COLOUR = "#231f20";
const SNAKE_COLOUR = "#c2c2c2";
const FOOD_COLOUR = "#e66916";
var CODE;
const socket = io("http://localhost:3000/");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

function newGame() {
  socket.emit("newGame");
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit("joinGame", code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit("keydown", e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, "red");
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert("You Win!");
  } else {
    alert("You Lose :(");
  }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
  CODE = gameCode;
}

function handleUnknownCode() {
  reset();
  alert("Unknown Game Code");
}

function handleTooManyPlayers() {
  reset();
  alert("This game is already in progress");
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}

//Front end JS
const card = document.querySelector("#canvas");
const container = document.querySelector(".container");
const copy = document.querySelector("#copy");

//moving animation
container.addEventListener("mousemove", (e) => {
  // console.log(e.pageX, e.pageY);
  let xAxis = (window.innerWidth / 2 - e.pageX) / 60;
  let yAxis = (window.innerWidth / 2 - e.pageY) / 60;

  card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  card.style.transition = "all 0.5s ease";
});

container.addEventListener("mouseenter", (e) => {
  card.style.transition = "none";
});
//
container.addEventListener("mouseleave", (e) => {
  card.style.transform = `rotateY(0deg) rotateX(0deg)`;
  card.style.transition = "all 0.5s ease";
});

copy.addEventListener("click", () => {
  var copyTextarea = document.createElement("textarea");
  copyTextarea.style.position = "fixed";
  copyTextarea.style.opacity = "0";
  copyTextarea.textContent = CODE;

  document.body.appendChild(copyTextarea);
  copyTextarea.select();
  document.execCommand("copy");
  alert("Code Copied: " + copyTextarea.textContent);
  document.body.removeChild(copyTextarea);
});
