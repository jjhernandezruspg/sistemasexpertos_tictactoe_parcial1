# Juego de TicTacToe para Sistemas Expertos
Proyecto: Tres en Raya (Tic Tac Toe) con Enfoque de Sistemas Expertos
Autor: Julio José Hernández - 2200030
Lenguaje: JavaScript
Auxiliares: HTML / CSS (interfaz gráfica)

1) Cómo ejecutar
   • Abrir este archivo HTML en cualquier navegador (Chrome, Edge, Firefox).
   • No requiere servidor ni instalación. Todo corre en el navegador.

2) ¿Cómo está organizada la base de conocimiento?
   • La base de conocimiento es un diccionario (Objeto JS) que mapea estados de tablero a la jugada recomendada.
     Formato de clave: "<STATE>|<TURN>", donde STATE es una cadena de 9 caracteres con 'X', 'O' o '-' (vacío), y TURN es 'X' u 'O' indicando quién mueve.
     Ejemplo: "XOX-O----|O" -> significa: en ese tablero le toca a 'O'.
   • El valor almacenado es el índice de casilla (0..8) que la IA jugó/eligió para ese estado.
   • Persistencia: se guarda automáticamente en localStorage con la clave 'ttt_kb_v1'.
   • Exportación/Importación: puede exportar la base de conocimientos a un archivo JSON e importar uno existente.

3) ¿Cómo se enriquece la base de conocimientos?
   • Cada vez que la IA se enfrenta a un estado nuevo, genera una jugada usando heurísticas simples (ganar, bloquear, centro, esquina, aleatoria) y luego almacena ese par (estado->índice) en la base de conocimientos para usos futuros.

4) Flujo del juego
   • Al iniciar una partida, se hace un sorteo aleatorio para decidir quién empieza.
     – Quien inicia usa 'X'; el segundo usa 'O'.
   • El tablero se muestra y se valida que la casilla esté libre antes de aceptar la jugada del usuario.
   • La máquina consulta su base de conocimientos; si no hay entrada, genera y guarda una nueva.
   • El sistema evalúa y muestra el resultado (Victoria Usuario, Victoria Máquina o Empate) y ofrece jugar de nuevo manteniendo la base de conocimientos.

5) Ejemplo de entrada en la base de conocimientos exportada
   {
     "X--O-----|X": 4,
     "XO--X-O--|O": 2
   }
