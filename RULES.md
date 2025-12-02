# Reglas de los juegos

Este archivo resume las reglas **tal como están implementadas en la aplicación**.

## Damas
- Tablero de 8x8 usando solo las casillas oscuras. Cada jugador inicia con 12 piezas en las tres primeras filas de su lado.
- Turnos alternos. Las piezas normales se mueven una casilla en diagonal hacia adelante y coronan al llegar a la última fila propia (fila 7 para "oscuras", fila 0 para "claras").
- Las capturas son obligatorias. Los peones pueden capturar en cualquiera de las cuatro diagonales saltando sobre una pieza rival adyacente y aterrizando en la casilla vacía inmediatamente después.
- Las damas (coronadas) pueden moverse y capturar a larga distancia en cualquiera de las diagonales, deteniéndose en cualquier casilla vacía más allá de la pieza capturada.
- Si tras una captura existen capturas adicionales desde la nueva casilla, el turno continúa con movimientos de captura adicionales.
- Un jugador pierde si se queda sin piezas o si ninguna de sus piezas dispone de movimientos legales.

## Come-Come
- Tablero de 8x8 y 12 piezas por jugador colocadas como en Damas.
- Piezas normales se mueven una casilla en diagonal hacia adelante y coronan al llegar a la última fila propia.
- Las capturas son obligatorias, pero las piezas **solo capturan hacia adelante** (dos casillas en diagonal sobre una pieza rival adyacente). No pueden capturar hacia atrás.
- Las damas pueden moverse y capturar a larga distancia en cualquier diagonal, como en las damas internacionales.
- Después de una captura, si desde la nueva posición hay más capturas disponibles, el turno continúa con capturas adicionales.
- Se pierde la partida al quedarse sin piezas o sin movimientos legales.

## Gato y Ratón
- Tablero de 8x8 usando casillas oscuras. El ratón empieza en la fila 7, columna 4. Los cuatro gatos empiezan en la fila 0, columnas 1, 3, 5 y 7.
- El ratón se mueve una casilla en diagonal en cualquiera de las cuatro direcciones, sin capturas.
- Cada gato se mueve una casilla en diagonal solo hacia adelante (de fila 0 hacia 7), sin capturas.
- El ratón gana si llega a la fila 0. Los gatos ganan si logran bloquear al ratón, dejándolo sin movimientos disponibles.

## Ajedrez
- El modo de Ajedrez aún no está implementado en la aplicación.
