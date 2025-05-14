// PreFlop Hand Strength (HS) Precomputed
const hsPreflop = (mycards, nPlayer) =>
  HS_PREFLOP[nPlayer][hrepr(mycards)] / 100; // 0.1 ms (precomputed)

function hs(ourcards, boardcards) {
  let HPTotal = [0, 0, 0];
  let ourrank = handval(ourcards.concat(boardcards));
  let remainingCards = getAllRemainingCards(ourcards, boardcards);

  let oppcards = getAllOpponentCardCombinations(remainingCards);
  for (let i = 0; i < oppcards.length; i++) {
    let opprank = handval(oppcards[i].concat(boardcards));
    let index;
    if (ourrank < opprank) index = 0;
    else if (ourrank === opprank) index = 1;
    else index = 2;
    HPTotal[index] += 1;
  }

  let HS =
    (HPTotal[0] + HPTotal[1] / 2) / (HPTotal[0] + HPTotal[1] + HPTotal[2]);
  
  return HS;
}
  

// Hand Strength (HS), Hand Potential (Pos & Neg) & Effective Hand Strength (EHS) -> One-Step Ahead
function handPotential1(ourcards, boardcards) {
  // 162.2 ms
  // Hand potential array, each index represents ahead, tied, and behind
  let HP = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  let HPTotal = [0, 0, 0];
  let ourrank = handval(ourcards.concat(boardcards));
  let remainingCards = getAllRemainingCards(ourcards, boardcards);

  // Consider all two card combinations of the remaining cards for the opponent
  let oppcards = getAllOpponentCardCombinations(remainingCards); // 1081
  for (let i = 0; i < oppcards.length; i++) {
    let opprank = handval(oppcards[i].concat(boardcards));
    let index;
    if (ourrank < opprank) index = 0; // ahead
    else if (ourrank === opprank) index = 1; // tied
    else index = 2; // behind
    HPTotal[index] += 1;

    // All possible board cards to come
    var turnCards = remainingCards.filter((t) => !oppcards[i].includes(t)); // 45

    for (let j = 0; j < turnCards.length; j++) {
      let board = [...boardcards, turnCards[j]];
      let ourbest = handval(ourcards.concat(board));
      let oppbest = handval(oppcards[i].concat(board));
      if (ourbest < oppbest) HP[index][0] += 1; // ahead
      else if (ourbest === oppbest) HP[index][1] += 1; // tied
      else HP[index][2] += 1; // behind
    }
  }

  // Ppot: were behind but moved ahead
  let Ppot =
    (HP[2][0] + HP[2][1] / 2 + HP[1][0] / 2) /
    (HP[2][0] + HP[2][1] + HP[2][2] + (HP[1][0] + HP[1][1] + HP[1][2]) / 2);
  Ppot = isNaN(Ppot) ? 0 : Ppot;
  // Npot: were ahead but fell behind
  let Npot =
    (HP[0][2] + HP[1][2] / 2 + HP[0][1] / 2) /
    (HP[0][0] + HP[0][1] + HP[0][2] + (HP[1][0] + HP[1][1] + HP[1][2]) / 2);
  let HS =
    (HPTotal[0] + HPTotal[1] / 2) / (HPTotal[0] + HPTotal[1] + HPTotal[2]);
  // let HS2 = hs(ourcards, 2, boardcards);
  let EHS = HS + (1 - HS) * Ppot - HS * Npot;
  let EHS2 = HS + (1 - HS) * Ppot;

  return [HS, Ppot, Npot, EHS, EHS2];
}

// Hand Strength (HS), Hand Potential (Pos & Neg) & Effective Hand Strength (EHS) -> Two-Step Ahead
function handPotential2(ourcards, boardcards) {
  // 1320.8 ms
  // Hand potential array, each index represents ahead, tied, and behind
  let HP = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  let HPTotal = [0, 0, 0];
  let ourrank = handval(ourcards.concat(boardcards));
  let remainingCards = getAllRemainingCards(ourcards, boardcards);

  // Consider all two card combinations of the remaining cards for the opponent
  let oppcards = getAllOpponentCardCombinations(remainingCards); // Function to get all possible opponent card combinations
  for (let i = 0; i < oppcards.length; i++) {
    let opprank = handval(oppcards[i].concat(boardcards));
    let index;
    if (ourrank < opprank) index = 0; // ahead
    else if (ourrank === opprank) index = 1; // tied
    else index = 2; // behind
    HPTotal[index] += 1;

    // All possible board cards to come
    var turnCards = remainingCards.filter((t) => !oppcards[i].includes(t));

    for (let j = 0; j < turnCards.length; j++) {
      var riverCards = turnCards.filter((r) => r !== turnCards[j]);
      for (let k = 0; k < riverCards.length; k++) {
        // Final 5-card board
        let board = [...boardcards, turnCards[j], riverCards[k]];
        let ourbest = handval(ourcards.concat(board));
        let oppbest = handval(oppcards[i].concat(board));
        if (ourbest < oppbest) HP[index][0] += 1; // ahead
        else if (ourbest === oppbest) HP[index][1] += 1; // tied
        else HP[index][2] += 1; // behind
      }
    }
  }

  // Ppot: were behind but moved ahead
  let Ppot =
    (HP[2][0] + HP[2][1] / 2 + HP[1][0] / 2) /
    (HP[2][0] + HP[2][1] + HP[2][2] + (HP[1][0] + HP[1][1] + HP[1][2]) / 2);
  Ppot = isNaN(Ppot) ? 0 : Ppot;
  // Npot: were ahead but fell behind
  let Npot =
    (HP[0][2] + HP[1][2] / 2 + HP[0][1] / 2) /
    (HP[0][0] + HP[0][1] + HP[0][2] + (HP[1][0] + HP[1][1] + HP[1][2]) / 2);
  let HS =
    (HPTotal[0] + HPTotal[1] / 2) / (HPTotal[0] + HPTotal[1] + HPTotal[2]);
  // let HS2 = hs(ourcards, 2, boardcards);
  let EHS = HS + (1 - HS) * Ppot - HS * Npot;
  let EHS2 = HS + (1 - HS) * Ppot;

  return [HS, Ppot, Npot, EHS, EHS2];
}

function getAllRemainingCards(ourcards, boardcards) {
  let knownCards = ourcards.concat(boardcards);
  let remainingCards = deckX().filter((c) => !knownCards.includes(c));
  return remainingCards;
}

function getAllOpponentCardCombinations(remainingCards) {
  let combinations = [];
  for (let i = 0; i < remainingCards.length - 1; i++) {
    for (let j = i + 1; j < remainingCards.length; j++) {
      combinations.push([remainingCards[i], remainingCards[j]]);
    }
  }
  return combinations;
}

// Monte Carlo Hand Strength (HS) (not used)
const hs22 = (mycards, nPlayer = 2, board = [], nSample = 10000) => {
  // 112.0 ms
  // Inicializar el contador de victorias en 0
  let winCount = 0;

  // Realizar el número de simulaciones especificado por nSample
  for (let i = 0; i < nSample; i++) {
    // Crear una copia del tablero y las cartas del jugador
    const currentBoard = [...board];
    const currentCards = [...mycards];

    // Calcular cuántas cartas se deben repartir en el tablero
    const numDraw = 5 - currentBoard.length;

    // Filtrar las cartas restantes del mazo
    const remainingDeck = deckX().filter(
      (x) => !currentCards.includes(x) && !currentBoard.includes(x)
    );

    // Repartir las cartas adicionales al tablero
    const additionalCards = remainingDeck.slice(0, numDraw);
    currentBoard.push(...additionalCards);

    // Evaluar la fuerza de la mano del jugador
    const myvalue = handval7([...currentBoard, ...currentCards]);

    let isWinner = true;

    // Verificar si la mano del jugador es más débil que las de los otros jugadores
    for (let j = 0; j < nPlayer - 1; j++) {
      // Crear la mano de un jugador oponente
      const opponentHand = [
        ...currentBoard,
        ...remainingDeck.slice(numDraw + 2 * j, numDraw + 2 * j + 2),
      ];

      // Evaluar la fuerza de la mano del oponente
      const opponentValue = handval7(opponentHand);

      // Verificar si la mano del jugador es más fuerte que la del oponente
      if (myvalue > opponentValue) {
        isWinner = false;
        break;
      }
    }

    // Incrementar el contador de victorias si el jugador gana o empata
    if (isWinner) {
      winCount++;
    }
  }

  // Calcular y devolver la proporción de victorias del jugador
  return winCount / nSample;
};

// MonteCarlo hand strength(HS) (not used)
const hs222 = (mycards, nPlayer = 2, board = [], nSample = 10000) => {
  // 112.0 ms
  const stats = simulateN(nSample)(
    () => {
      // returns true if I win or draw
      const numDraw = 5 - board.length;
      const dk = deckX().filter(
        (x) => !mycards.includes(x) && !board.includes(x)
      );
      const allboard = [...board, ...dk.slice(0, numDraw)];
      const myvalue = handval7([...allboard, ...mycards]);
      return Array.from(Array(nPlayer - 1).keys()) //range(nPlayer - 1)
        .map((i) => [
          ...allboard,
          ...dk.slice(numDraw + 2 * i, numDraw + 2 * i + 2),
        ])
        .map(handval7)
        .reduce((acc, x) => acc && myvalue <= x, true);
    },
    (count, win) => (win ? count + 1 : count),
    0 // count
  );
  return stats / nSample;
};
