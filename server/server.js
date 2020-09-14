const io = require("socket.io")();
const { initGame, gameLoop, getUpdatedVelocity } = require("./game");
const { FRAME_RATE } = require("./constants");

const state = {};
const clientRoom = {};

io.on("connection", (client) => {
  //   client.emit("init", { data: "hello" });
  // const state = createGameState();

  client.on("keydown", handleKeydown);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);

  function handleJoinGame(gameCode) {
    const room = io.sockets.adapter.rooms[gameCode];

    let allUser;
    if (room) {
      allUser = room.sockets;
    }

    let numClient = 0;
    if (allUser) {
      numClient = Object.keys(allUser).length;
    }

    if (numClient === 0) {
      client.emit("unknownGame");
    } else if (numClient > 1) {
      client.emit("tooManyPlayers");
    }

    clientRoom[client.id] = gameCode;
    client.join(gameCode);
    client.number = 2;

    client.emit("init", 2);

    startGameInterval(gameCode);
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRoom[client.id] = roomName;

    client.emit("gameCode", roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);
  }

  function handleKeydown(keyCode) {
    // const rommName = clientRoom[client.id];
    try {
      keyCode = parseInt(keyCode);
    } catch (err) {
      console.log(err);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state.player.vel = vel;
    }
  }

  // startGameInterval(client, state);
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName]);
      // client.emit("gameState", JSON.stringify(state));
    } else {
      emitGameOver(roomName, winner);
      // client.emit("gameOver");
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, state) {
  io.sockets.in(roomName).emit("gameState", JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
  io.sockets.in(roomName).emit("gameOver", JSON.stringify({ winner }));
}

io.listen(3000);
