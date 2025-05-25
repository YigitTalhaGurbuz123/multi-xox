const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  console.log("Yeni bağlantı:", socket.id);

  socket.on("join-room", (roomID) => {
    if (!rooms[roomID]) {
      rooms[roomID] = { players: [], symbols: {} };
    }
    const room = rooms[roomID];

    if (room.players.length >= 2) {
      socket.emit("room-full");
      return;
    }

    socket.join(roomID);
    room.players.push(socket.id);
    const symbol = room.players.length === 1 ? "X" : "O";
    room.symbols[socket.id] = symbol;
    socket.emit("symbol-assigned", symbol);

    if (room.players.length === 2) {
      io.to(roomID).emit("start-game");
    }
  });

  socket.on("move", ({ blockIndex, cellIndex, symbol, roomID }) => {
    socket.to(roomID).emit("move", { blockIndex, cellIndex, symbol });
  });

  socket.on("disconnect", () => {
    for (const roomID in rooms) {
      const room = rooms[roomID];
      const idx = room.players.indexOf(socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        delete room.symbols[socket.id];
        socket.to(roomID).emit("player-left");
        if (room.players.length === 0) {
          delete rooms[roomID];
        }
        break;
      }
    }
  });
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
