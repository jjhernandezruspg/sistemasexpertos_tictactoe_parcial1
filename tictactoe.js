const cells = document.querySelectorAll(".cell");
let currentPlayer = "X";
let gameActive = true;

const winningCombinations = [
  [0, 1, 2], // filas
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // columnas
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonales
  [2, 4, 6]
];

// Manejar clic en celda
function handleClick(e) {
  const cell = e.target;
  const index = Array.from(cells).indexOf(cell);

  if (cell.textContent !== "" || !gameActive) return;

  cell.textContent = currentPlayer;

  if (checkWinner()) {
    alert(`¡Jugador ${currentPlayer} gana!`);
    gameActive = false;
    return;
  }

  if (isDraw()) {
    alert("¡Empate!");
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

// Verificar ganador
function checkWinner() {
  return winningCombinations.some(combination => {
    return combination.every(index => {
      return cells[index].textContent === currentPlayer;
    });
  });
}

// Verificar empate
function isDraw() {
  return [...cells].every(cell => cell.textContent !== "");
}

// Reiniciar juego (opcional para futura versión)
function resetGame() {
  cells.forEach(cell => (cell.textContent = ""));
  currentPlayer = "X";
  gameActive = true;
}

// Asignar eventos
cells.forEach(cell => {
  cell.addEventListener("click", handleClick);
});
