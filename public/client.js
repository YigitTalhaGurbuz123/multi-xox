const socket = io();
let mySymbol = null;
let currentRoom = null;

document.getElementById("joinBtn").addEventListener("click", () => {
  const roomID = document.getElementById("roomID").value;
  if (roomID.trim() !== "") {
    currentRoom = roomID;
    socket.emit("join-room", roomID);
  }
});

socket.on("symbol-assigned", (symbol) => {
  mySymbol = symbol;
  console.log("Sembol atandı:", symbol);
});

socket.on("start-game", () => {
  console.log("Oyun başladı!");
  createBoard();
});

socket.on("move", ({ blockIndex, cellIndex, symbol }) => {
  const cell = document.getElementById(`cell-${cellIndex}`);
  if (cell) {
    cell.innerText = symbol;
  }
});

socket.on("room-full", () => {
  alert("Oda dolu!");
});

socket.on("player-left", () => {
  alert("Diğer oyuncu çıktı!");
});

function createBoard() {
  const gameDiv = document.getElementById("game");
  gameDiv.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = `cell-${i}`;
    cell.addEventListener("click", () => {
      if (cell.innerText === "") {
        cell.innerText = mySymbol;
        socket.emit("move", {
          blockIndex: 0,
          cellIndex: i,
          symbol: mySymbol,
          roomID: currentRoom
        });
      }
    });
    gameDiv.appendChild(cell);
  }
}
