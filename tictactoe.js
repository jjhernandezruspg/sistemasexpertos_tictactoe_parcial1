const cells = document.querySelectorAll(".cell");
let currentPlayer = "X";

// Función para manejar clic en celda
function handleClick(e) {
  const cell = e.target;

  // Evitar sobrescribir jugada
  if (cell.textContent !== "") return;

  // Colocar jugada
  cell.textContent = currentPlayer;

  // Cambiar jugador
  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

// Asignar evento a cada celda
cells.forEach(cell => {
  cell.addEventListener("click", handleClick);
});
