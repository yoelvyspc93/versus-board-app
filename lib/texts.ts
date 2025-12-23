export const uiText = {
  app: {
    name: "VersusBoard",
    description: "Plataforma de juegos de mesa multijugador en tiempo real.",
    descriptionSmall: "Plataforma de juegos de mesa",
    loading: "Cargando VersusBoard...",
  },
  actions: {
    connect: "Conectarse",
    backToStart: "Volver al inicio",
    createRoom: "Crear sala",
    joinRoom: "Unirse a sala",
    creatingRoom: "Creando...",
    connectingRoom: "Conectando...",
    goToLobby: "Volver al lobby",
    instructions: "Instrucciones",
    surrender: "Rendirse",
    cancel: "Cancelar",
    close: "Cerrar",
    leaveRoom: "Salir",
    pickDark: "Yo juego con Negras",
    pickLight: "Yo juego con Blancas",
    pickMouse: "Yo soy el Ratón",
    pickCat: "Yo soy el Gato",
  },
  confirmations: {
    yes: "Sí",
    no: "No",
    surrender: {
      title: "¿Rendirse?",
      description: "Perderás la partida actual y volverás al lobby.",
    },
    goToLobby: {
      title: "¿Volver al lobby?",
      description: "Salir de la partida actual te llevará de vuelta a la sala.",
    },
  },
  welcome: {
    title: "VersusBoard",
    subtitle: "Plataforma de juegos de mesa multijugador.",
    lobbyTitle: "Lobby principal",
    lobbySubtitle: "Crea una sala o únete a una existente",
    connectCta: "Conectarse",
  },
  forms: {
    playerNameLabel: "Tu nombre",
    playerNamePlaceholder: "Ej: Jugador1",
    roomNameLabel: "Nombre de la sala",
    roomNamePlaceholder: "Ej: Mesa de amigos",
    joinRoomLabel: "Nombre exacto de la sala",
    joinRoomPlaceholder: "Introduce el nombre de la sala",
  },
  connection: {
    waitingGuest: (room: string) =>
      `Esperando a que alguien se una a la sala "${room}"...`,
    ready: "Conectados y listos para jugar",
    unstable: "Conexión inestable: seguimos intentando reconectar...",
    offline: "Parece que no hay conexión a internet. Revisa la señal e inténtalo de nuevo.",
  },
  players: {
    host: "Anfitrión",
    guest: "Invitado",
    generic: "Jugador",
    you: "(Tú)",
    waiting: "Esperando...",
  },
  room: {
    title: "Sala",
    createDescription: "Ambos jugadores pueden elegir el juego",
    waitingGuest: "Esperando al segundo jugador",
    reconnecting: "Buscando conexión estable...",
    cards: {
      checkers: "Juego clásico para dos.",
      comeCome: "Modo rápido inspirado en damas.",
      catMouse: "Duelo asimétrico entre felinos y ratón.",
    },
  },
  games: {
    checkers: { name: "Damas" },
    comeCome: { name: "Come-Come" },
    catAndMouse: { name: "Gato y Ratón" },
    generic: { name: "Juego" },
    selectToStart: "Selecciona un juego para comenzar",
    chooseRole: "Elige tu rol",
    chooseColor: "Elige tu color",
    chooseRoleDescription:
      "Tú eliges ser el Ratón o el Gato; el otro jugador tendrá el rol contrario.",
    chooseColorDescription:
      "Elige Blancas o Negras; tu oponente jugará con el color opuesto.",
  },
  instructions: {
    checkers: [
      "Haz clic en una pieza para seleccionarla.",
      "Los cuadros azules indican movimientos válidos.",
      "Los cuadros verdes indican capturas disponibles.",
      "Las capturas son obligatorias cuando existen.",
      "Si capturas, puedes seguir capturando en el mismo turno.",
      "Llega al otro lado del tablero para coronar tu pieza.",
    ],
    comeCome: [
      "Las piezas normales solo avanzan y capturan hacia adelante.",
      "Las piezas normales no pueden retroceder.",
      "Las damas se mueven en diagonal varias casillas.",
      "Las capturas son obligatorias cuando existen.",
      "Puedes encadenar capturas múltiples en el mismo turno.",
      "Corona tu pieza al llegar al extremo opuesto.",
    ],
    catAndMouse: [
      "El ratón (gris) juega primero.",
      "El ratón puede moverse en diagonal en cualquier dirección.",
      "Los gatos (naranjas) solo pueden avanzar en diagonal hacia abajo.",
      "No hay capturas en este juego.",
      "El ratón gana si alcanza la fila superior.",
      "Los gatos ganan si bloquean al ratón sin movimientos disponibles.",
    ],
  },
  winners: {
    title: (name: string) => `¡Ganador: ${name}!`,
    subtitle: "Vuelve al lobby para elegir otro juego o sala.",
  },
  errors: {
    createRoom: "Error al crear la sala.",
    joinRoom: "Error al unirse a la sala.",
    missingFields: "Por favor completa tu nombre y el de la sala.",
  },
}

export type UiText = typeof uiText
