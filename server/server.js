const io = require("socket.io")();
const { createGameState, gameLoop } = require("./game");
const { FRAME_RATE } = require("./constants");

io.on("connection", (client) => {
  //   client.emit("init", { data: "hello" });
  const state = createGameState();

  startGameInterval(client, state);
});

function startGameInterval(client, state) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state);

    if (!winner) {
      client.emit("gameState", JSON.stringify(state));
    } else {
      client.emit("gameOver");
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

io.listen(3000);
