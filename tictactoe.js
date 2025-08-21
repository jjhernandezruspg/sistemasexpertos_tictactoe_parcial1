
    const KB_STORAGE_KEY = 'ttt_kb_v1';

    /** Carga la BK desde localStorage; si no existe, crea una mínima */
    function loadKB() {
      try {
        const raw = localStorage.getItem(KB_STORAGE_KEY);
        if (!raw) return seedKB();
        const obj = JSON.parse(raw);
        if (!obj || typeof obj !== 'object') return seedKB();
        return obj;
      } catch (e) {
        console.warn('BK corrupta, reiniciando…', e);
        return seedKB();
      }
    }

    /** Guarda la BK en localStorage */
    function saveKB(kb) {
      localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(kb));
      renderKB(kb);
    }

    /** BK mínima de arranque */
    function seedKB() {
      const kb = {
        // Estados triviales de ejemplo:
        // Centro libre al inicio → tomar centro
        '---------|X': 4,
      };
      saveKB(kb);
      return kb;
    }

    /** Actualiza el panel derecho con la BK y contadores */
    function renderKB(kb) {
      const kbView = document.getElementById('kbView');
      kbView.textContent = JSON.stringify(kb, null, 2);
      document.getElementById('kbCount').textContent = `BK: ${Object.keys(kb).length} estados`;
    }

    /******************* Lógica de Juego *******************/
    const boardEl = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const whoStartsEl = document.getElementById('whoStarts');
    const bkHitEl = document.getElementById('bkHit');

    let kb = loadKB();
    let board = Array(9).fill('-'); // '-', 'X', 'O'
    let human = null; // 'X' | 'O'
    let ai = null;    // 'X' | 'O'
    let turn = null;  // 'X' | 'O'
    let finished = false;

    function stateKey(b, t) { return `${b.join('')}|${t}`; }

    function newGame() {
      board = Array(9).fill('-');
      finished = false;
      // sorteo aleatorio
      const aiStarts = Math.random() < 0.5;
      if (aiStarts) {
        ai = 'X';
        human = 'O';
        turn = 'X';
        whoStartsEl.textContent = 'Inicia: IA (X)';
      } else {
        human = 'X';
        ai = 'O';
        turn = 'X';
        whoStartsEl.textContent = 'Inicia: Usuario (X)';
      }
      updateStatus();
      renderBoard();
      if (turn === ai) {
        aiMove();
      }
    }

    function updateStatus(result = null) {
      if (result) {
        statusEl.innerHTML = result;
        return;
      }
      statusEl.innerHTML = `Turno de <strong>${turn}</strong> · Usuario: <strong>${human}</strong> · IA: <strong>${ai}</strong>`;
    }

    function renderBoard() {
      boardEl.classList.toggle('finished', finished);
      boardEl.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell' + (finished ? ' disabled' : '');
        cell.textContent = board[i] === '-' ? '' : board[i];
        cell.addEventListener('click', () => onCellClick(i));
        boardEl.appendChild(cell);
      }
    }

    function onCellClick(i) {
      if (finished) return;
      if (turn !== human) return;
      if (board[i] !== '-') { flashMsg('Casilla ocupada'); return; }
      board[i] = human;
      afterMove();
    }

    function afterMove() {
      const result = checkEnd(board);
      if (result) { endGame(result); return; }
      turn = turn === 'X' ? 'O' : 'X';
      updateStatus();
      renderBoard();
      if (turn === ai && !finished) {
        setTimeout(aiMove, 200);
      }
    }

    function endGame(result) {
      finished = true;
      let msg = '';
      if (result.winner === human) msg = `<span class="result win">🥳 ¡Victoria del usuario! 🔥</span>`;
      else if (result.winner === ai) msg = `<span class="result lose">😭 Victoria de la máquina 🔥</span>`;
      else msg = `<span class="result draw">😕 Empate 😕</span>`;
      updateStatus(`${msg} · <button id="btnAgain" class="ghost" style="margin-left:8px;">¿Jugar de nuevo?</button>`);
      renderBoard();
      // botón jugar de nuevo
      setTimeout(() => {
        const btnAgain = document.getElementById('btnAgain');
        if (btnAgain) btnAgain.addEventListener('click', newGame);
      }, 0);
    }

    function aiMove() {
      const key = stateKey(board, ai);
      if (kb[key] !== undefined) {
        const move = kb[key];
        bkHitEl.textContent = 'BK: coincidencia encontrada';
        placeIfFree(move, ai);
        return;
      }
      bkHitEl.textContent = 'BK: estado nuevo → aprendiendo';
      const move = chooseMoveHeuristic(board, ai);
      kb[key] = move;
      saveKB(kb);
      placeIfFree(move, ai);
    }

    function placeIfFree(move, player) {
      if (board[move] === '-') {
        board[move] = player;
        afterMove();
      } else {
        const fallback = freeCells(board)[0];
        if (fallback !== undefined) {
          board[fallback] = player;
          afterMove();
        }
      }
    }

    /******************* Heurísticas *******************/
    const WIN_LINES = [
      [0,1,2], [3,4,5], [6,7,8], // filas
      [0,3,6], [1,4,7], [2,5,8], // columnas
      [0,4,8], [2,4,6]           // diagonales
    ];

    function freeCells(b) { return b.map((v,i)=>v==='-'?i:null).filter(v=>v!==null); }

    function winner(b) {
      for (const [a,b1,c] of WIN_LINES) {
        if (b[a] !== '-' && b[a] === b[b1] && b[a] === b[c]) return b[a];
      }
      return null;
    }

    function checkEnd(b) {
      const w = winner(b);
      if (w) return { winner: w };
      if (freeCells(b).length === 0) return { winner: null };
      return null;
    }

    function chooseMoveHeuristic(b, me) {
      const other = me === 'X' ? 'O' : 'X';
      for (const i of freeCells(b)) {
        const t = [...b]; t[i] = me;
        if (winner(t) === me) return i;
      }
      for (const i of freeCells(b)) {
        const t = [...b]; t[i] = other;
        if (winner(t) === other) return i;
      }
      if (b[4] === '-') return 4;
      const corners = [0,2,6,8].filter(i => b[i] === '-');
      if (corners.length) return randomOf(corners);
      const free = freeCells(b);
      return randomOf(free);
    }

    function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    /******************* Exportar / Importar *******************/
    document.getElementById('btnExport').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(kb, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'knowledge_base_ttt.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btnImport').addEventListener('click', () => {
      document.getElementById('fileImport').click();
    });

    document.getElementById('fileImport').addEventListener('change', (ev) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const obj = JSON.parse(String(reader.result));
          if (obj && typeof obj === 'object') {
            kb = obj;
            saveKB(kb);
            flashMsg('BK importada correctamente');
          } else {
            flashMsg('Archivo no válido');
          }
        } catch (e) {
          console.error(e);
          flashMsg('Error al leer JSON');
        }
      };
      reader.readAsText(file);
      ev.target.value = '';
    });

    document.getElementById('btnResetKB').addEventListener('click', () => {
      if (confirm('Esto borrará permanentemente la base de conocimiento local. ¿Continuar?')) {
        localStorage.removeItem(KB_STORAGE_KEY);
        kb = seedKB();
        flashMsg('BK reiniciada');
      }
    });

    document.getElementById('btnNew').addEventListener('click', newGame);

    // Ayuda (Modal)
    const helpDialog = document.getElementById('helpDialog');
    document.getElementById('btnHelp').addEventListener('click', () => helpDialog.showModal());
    document.getElementById('btnCloseHelp').addEventListener('click', () => helpDialog.close());

    /******************* UI Helpers *******************/
    function flashMsg(text) {
      bkHitEl.textContent = text;
      bkHitEl.animate([
        { transform: 'translateY(0)', opacity: 0.4 },
        { transform: 'translateY(-2px)', opacity: 1 },
        { transform: 'translateY(0)', opacity: 0.7 }
      ], { duration: 600, easing: 'ease-out' });
    }

    // Arranque
    renderKB(kb);
    newGame();