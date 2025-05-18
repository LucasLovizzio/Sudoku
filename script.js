// Generar el tablero dinámicamente
window.onload = function () {
  const board = document.getElementById("sudoku-board");
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const input = document.createElement("input");
      input.setAttribute("type", "text");
      input.setAttribute("maxlength", "1");
      input.setAttribute("id", `cell-${i}-${j}`);

      // Agregamos clases para bordes más gruesos
      if (i % 3 === 0) input.classList.add("top-border");
      if (j % 3 === 0) input.classList.add("left-border");
      if (i === 8) input.classList.add("bottom-border");
      if (j === 8) input.classList.add("right-border");

      board.appendChild(input);
    }
  }
  reiniciarVidas();
  stopTimer();
  secondsElapsed = 0;
  updateTimerDisplay();
};

let vidasRestantes = 5;
let timerInterval = null;
let secondsElapsed = 0;

function reiniciarVidas() {
    vidasRestantes = 5;
    actualizarCorazones();
}

function actualizarCorazones() {
    const corazones = document.querySelectorAll('.corazon');
    corazones.forEach((corazon, idx) => {
        if (idx < vidasRestantes) {
            corazon.classList.remove('perdido');
        } else {
            corazon.classList.add('perdido');
        }
    });
}

function limpiar() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            document.getElementById(`cell-${i}-${j}`).value = "";
            document.getElementById(`cell-${i}-${j}`).classList.remove("bloqueado");
        }
    }
    reiniciarVidas();
    stopTimer();
    secondsElapsed = 0;
    updateTimerDisplay();
}

function generar() {
    limpiar(); // Limpiar el tablero antes de generar
    const board = document.getElementById("sudoku-board");
    const cells = Array.from(board.getElementsByTagName("input"));
    const numbers = Array.from({ length: 9 }, (_, i) => i + 1);

    // Validar si un número es válido en la posición (row, col)
    function esValidoParaCelda(row, col, num) {
        // Verificar fila y columna
        for (let k = 0; k < 9; k++) {
            if (cells[row * 9 + k].value == num) return false;
            if (cells[k * 9 + col].value == num) return false;
        }
        // Verificar subcuadro 3x3
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (cells[(boxRow + i) * 9 + (boxCol + j)].value == num) return false;
            }
        }
        return true;
    }

    // Generar una solución completa de Sudoku
    function fillBoard(index) {
        if (index === 81) return true;
        const row = Math.floor(index / 9);
        const col = index % 9;
        const cell = cells[row * 9 + col];
        const shuffledNumbers = numbers.slice().sort(() => Math.random() - 0.5);
        for (const num of shuffledNumbers) {
            if (esValidoParaCelda(row, col, num)) {
                cell.value = num;
                if (fillBoard(index + 1)) return true;
                cell.value = "";
            }
        }
        return false;
    }

    fillBoard(0);

    // Quitar celdas aleatoriamente para crear el puzzle
    const cellsToRemove = 45; // Se puede ajustar la dificultad cambiando este número
    let removed = 0;
    while (removed < cellsToRemove) {
        const i = Math.floor(Math.random() * 9);
        const j = Math.floor(Math.random() * 9);
        const cell = cells[i * 9 + j];
        if (cell.value !== "") {
            cell.value = "";
            removed++;
        }
    }

    // Hacer readonly las celdas que quedaron con valor
    for (const cell of cells) {
        if (cell.value !== "") {
            cell.setAttribute("readonly", "readonly");
        } else {
            cell.removeAttribute("readonly");
        }
    }

    cells.forEach(cell => {
        if (cell.hasAttribute("readonly")) {
            cell.classList.add("bloqueado");
        }
    });
    startTimer();
}

function esValido() {
    const board = document.getElementById("sudoku-board");
    const cells = Array.from(board.getElementsByTagName("input"));
    const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
    const rows = Array.from({ length: 9 }, () => new Set());
    const cols = Array.from({ length: 9 }, () => new Set());
    const boxes = Array.from({ length: 9 }, () => new Set());
    let completo = true;
    let valido = true;

    // Limpiar clases previas
    cells.forEach(cell => cell.classList.remove("invalido"));

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = cells[i * 9 + j];
            const value = parseInt(cell.value);
            if (!value || !numbers.includes(value)) {
                completo = false;
                cell.classList.add("invalido");
                continue;
            }
            const boxIdx = Math.floor(i / 3) * 3 + Math.floor(j / 3);
            if (
                rows[i].has(value) ||
                cols[j].has(value) ||
                boxes[boxIdx].has(value)
            ) {
                cell.classList.add("invalido");
                valido = false;
            }
            rows[i].add(value);
            cols[j].add(value);
            boxes[boxIdx].add(value);
        }
    }
    // Solo retorna true si está completo y válido
    return completo && valido;
}

function resolver() {
    const board = document.getElementById("sudoku-board");
    const cells = Array.from(board.getElementsByTagName("input"));
    const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
    const emptyCells = [];

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = cells[i * 9 + j];
            if (!cell.value) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    function backtrack(index) {
        if (index === emptyCells.length) {
            return true;
        }

        const { row, col } = emptyCells[index];
        for (const num of numbers) {
            document.getElementById(`cell-${row}-${col}`).value = num;
            if (esValido()) {
                if (backtrack(index + 1)) {
                    return true;
                }
            }
            document.getElementById(`cell-${row}-${col}`).value = "";
        }
        return false;
    }

    backtrack(0);
}

function verificar() {
    if (vidasRestantes === 0) {
        alert("¡Ya no tienes vidas! Reinicia el juego.");
        return;
    }

    const board = document.getElementById("sudoku-board");
    const cells = Array.from(board.getElementsByTagName("input"));
    const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
    const rows = Array.from({ length: 9 }, () => new Map());
    const cols = Array.from({ length: 9 }, () => new Map());
    const boxes = Array.from({ length: 9 }, () => new Map());
    let valido = true;
    let completo = true;

    // Limpiar clases previas
    cells.forEach(cell => {
        if (!cell.hasAttribute("readonly")) {
            cell.classList.remove("invalido");
        }
    });

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = cells[i * 9 + j];
            const value = parseInt(cell.value);
            if (!value || !numbers.includes(value)) {
                completo = false;
            }
            if (value && numbers.includes(value)) {
                const boxIdx = Math.floor(i / 3) * 3 + Math.floor(j / 3);

                if (!rows[i].has(value)) rows[i].set(value, []);
                if (!cols[j].has(value)) cols[j].set(value, []);
                if (!boxes[boxIdx].has(value)) boxes[boxIdx].set(value, []);

                rows[i].get(value).push(cell);
                cols[j].get(value).push(cell);
                boxes[boxIdx].get(value).push(cell);
            }
        }
    }

    function marcarInvalidos(mapa) {
        for (const map of mapa) {
            for (const [num, celdas] of map.entries()) {
                if (celdas.length > 1) {
                    celdas.forEach(cell => {
                        if (!cell.hasAttribute("readonly")) {
                            cell.classList.add("invalido");
                            valido = false;
                        }
                    });
                }
            }
        }
    }

    marcarInvalidos(rows);
    marcarInvalidos(cols);
    marcarInvalidos(boxes);

    // Solo otorga puntaje si está completo y válido
    if (valido && completo) {
        // Calcular puntaje
        const base = 1000;
        const penalidadTiempo = secondsElapsed * 2;
        let puntaje = base - penalidadTiempo;
        if (puntaje < 0) puntaje = 0;
        puntaje = Math.round(puntaje * (vidasRestantes / 5));
        alert(`¡Sudoku completado!\nTu puntaje es: ${puntaje}`);
        stopTimer();
    } else if (!valido) {
        // Solo se quitan vidas si hay errores
        if (vidasRestantes > 0) {
            vidasRestantes--;
            actualizarCorazones();
            if (vidasRestantes === 0) {
                alert("¡Te has quedado sin vidas! Intenta de nuevo.");
            } else {
                alert("El Sudoku no es válido. Revisa las celdas marcadas en rojo. Te quedan " + vidasRestantes + " vidas.");
            }
        }
    } else if (!completo) {
        // Si está incompleto pero sin errores, solo muestra mensaje
        alert("El Sudoku está incompleto. Completa todas las celdas para verificar.");
    }
}

function startTimer() {
    stopTimer();
    secondsElapsed = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
}

function updateTimerDisplay() {
    const timer = document.getElementById('timer');
    if (!timer) return;
    const min = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const sec = String(secondsElapsed % 60).padStart(2, '0');
    timer.textContent = `${min}:${sec}`;
}