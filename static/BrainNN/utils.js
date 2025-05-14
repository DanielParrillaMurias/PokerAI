

// Función para inicializar la matriz de confusión
function initializeConfusionMatrix(classes) {
  return classes.reduce((matrix, actualClass) => {
    matrix[actualClass] = {};
    classes.forEach(predClass => {
      matrix[actualClass][predClass] = 0;
    });
    return matrix;
  }, {});
}

// Función para llenar la matriz de confusión con las predicciones y clases reales
function fillConfusionMatrix(confusionMatrix, predictedClasses, actualLabels, classesOfInterest) {
  predictedClasses.forEach((predClass, i) => {
    const actualClass = Object.keys(actualLabels[i]).find(label => actualLabels[i][label] === 1);
    if (classesOfInterest.includes(actualClass)) {
      confusionMatrix[actualClass][predClass]++;
    }
  });
}

// Función para calcular métricas de rendimiento para cada clase
function calculateMetrics(confusionMatrix, classesOfInterest) {
  return classesOfInterest.reduce((metrics, actualClass) => {
    const truePositives = confusionMatrix[actualClass][actualClass];
    const falsePositives = classesOfInterest.reduce((sum, predClass) => sum + confusionMatrix[predClass][actualClass], 0) - truePositives;
    const falseNegatives = classesOfInterest.reduce((sum, predClass) => sum + confusionMatrix[actualClass][predClass], 0) - truePositives;

    const precision = parseFloat((truePositives / (truePositives + falsePositives || 1)).toFixed(3));
    const recall = parseFloat((truePositives / (truePositives + falseNegatives || 1)).toFixed(3));
    const f1Score = parseFloat((2 * (precision * recall) / (precision + recall || 1)).toFixed(3));
    const errorRate = parseFloat(((falsePositives + falseNegatives) / (truePositives + falsePositives + falseNegatives || 1)).toFixed(3));

    metrics[actualClass] = {
      errorRate,
      precision,
      recall,
      f1Score
    };

    return metrics;
  }, {});
}

// Función para imprimir la matriz de confusión
function printConfusionMatrix(confusionMatrix) {
  console.log("Matriz de Confusión Completa:");
  console.table(confusionMatrix);
}

// Función para imprimir las métricas por clase
function printMetricsByClass(metrics) {
  console.log("Métricas por Clase:");
  console.table(metrics);
}

// Función principal que ejecuta el proceso
function evaluateNeuralNetwork(testData, net, classesOfInterest) {
  const predictions = testData.map(data => net.run(data.input));
  const actualLabels = testData.map(data => data.output);
  const predictedClasses = predictions.map(pred => Object.keys(pred).reduce((a, b) => pred[a] > pred[b] ? a : b));

  const confusionMatrix = initializeConfusionMatrix(classesOfInterest);
  fillConfusionMatrix(confusionMatrix, predictedClasses, actualLabels, classesOfInterest);

  const metricsByClass = calculateMetrics(confusionMatrix, classesOfInterest);

  printConfusionMatrix(confusionMatrix);
  printMetricsByClass(metricsByClass);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function calculateMSE(predictions, targets) {
  return predictions.reduce((sum, prediction, i) => sum + Math.pow(prediction - targets[i], 2), 0) / predictions.length;
}

function normalize(data, minValue, maxValue) {
  return (data - minValue) / (maxValue - minValue);
}

function getElementsAtEvenPositions(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i += 2) {
    result.push(arr[i]*2); // * 2 para normalizar las potOdds (nunca superarían 0.5)
  }
  return result;
}

function getElementsAtOddPositions(arr) {
  const result = [];
  for (let i = 1; i < arr.length; i += 2) {
    result.push(arr[i]*2); // * 2 para normalizar las potOdds (nunca superarían 0.5)
  }
  return result;
}

function getCards(heroHand) {
  if(heroHand.length % 2 != 0) return 'cadena invalida';
  let hand = new Array(heroHand.length/2);
  for(let i = 0; i < heroHand.length; i+=2){
      let suit = heroHand[i+1];
      let number = heroHand[i];
      switch (number) {
        case "A":
          number = 14;
          break;
        case "K":
          number = 13;
          break;
        case "Q":
          number = 12;
          break;
        case "J":
          number = 11;
          break;
        case "T":
          number = 10;
          break;
        default:
          number = parseInt(number);
          break;
      }
      let suitIndex;
      switch (suit) {
        case 'h':
          suitIndex = 0;
          break;
        case 'd':
          suitIndex = 1;
          break;
        case 'c':
          suitIndex = 2;
          break;
        case 's':
          suitIndex = 3;
          break;
      }
      hand[i/2] = suitIndex + (number - 2) * 4;
  }
  return hand;
}

function getPreviousPot(previousBetSizes) {  
  let previousPot = previousBetSizes.slice(-1);
  return (+previousPot)*2;
}

function getBetSizesPreFlop(actions) {
  // Creamos un array vacío para almacenar los tamaños de apuesta
  const betSizes = [];
  let consecutiveC = 0;
  // Recorremos cada caracter de actions
  for (let i = 0; i < actions.length; i++) {
    // Si el caracter es un dígito, lo añadimos a betSizes como un número entero
    if (/\d/.test(actions[i])) {
      // Añadimos a betSizes el tamaño de apuesta correspondiente al caracter actual y a los siguientes dígitos
      betSizes.push(parseInt(actions.slice(i)));
      // Actualizamos la variable i para saltarnos los dígitos que ya hemos procesado
      i += actions.slice(i).search(/\D/);
      consecutiveC = 0;
    } else if (actions[i] === 'c') {
      consecutiveC++;
      if(consecutiveC === 1){
        // Si el caracter es 'c', añadimos 100 a betSizes
        betSizes.push(100);
      }
    } else {
        consecutiveC = 0;
    }
  }
  if(actions[actions.length-1] === 'c'){
    betSizes.push(betSizes[betSizes.length-1])
  }
  return betSizes;
}

function getBetSizesPostFlop(actions, previousPot) {
  // Creamos un array vacío para almacenar los tamaños de apuesta
  const betSizes = [];
  let consecutiveC = 0;
  // Recorremos cada caracter de actions
  for (let i = 0; i < actions.length; i++) {
    // Si el caracter es un dígito, lo añadimos a betSizes como un número entero
    if (/\d/.test(actions[i])) {
      // Añadimos a betSizes el tamaño de apuesta correspondiente al caracter actual y a los siguientes dígitos
      betSizes.push(parseInt(actions.slice(i)));
      // Actualizamos la variable i para saltarnos los dígitos que ya hemos procesado
      i += actions.slice(i).search(/\D/);
      consecutiveC = 0;
    } else if (actions[i] === 'c') {
      consecutiveC++;
      if(consecutiveC === 1){
        // Si el caracter es 'c', añadimos 0 a betSizes
        betSizes.push(previousPot/2);
      }
    } else {
        consecutiveC = 0;
    }
  }
  if(actions[actions.length-1] === 'c'){
    betSizes.push(betSizes[betSizes.length-1])
  }
  return betSizes;
}

function getActualBetSizes(previousBetSizes, betSizes) {
  // Paso 1: Extraer la última apuesta de cada jugador (será la misma)
  const [previousBet] = previousBetSizes.slice(-1);
  let actualBetSizes = [];
  let j = 0;

  // Paso 2: Calcular las apuestas reales de la ronda actual para cada jugador
  for (let i = 0; i < betSizes.length; i++) {
    if (betSizes[i] === 0) {
      actualBetSizes[i] = 0;
    } else if (j < 2) {
      actualBetSizes[i] = betSizes[i] - previousBet;
      j++;
    } else {
      actualBetSizes[i] = betSizes[i] - betSizes[i - 2];
    }
  }
  return actualBetSizes;
}

function betFractionsPotOdds(betSizes) {
  let currentPot = 150;
  let betFractions = [];
  let potOdds = [];
  let toCall = 50;

  potOdds.push(toCall / (currentPot + toCall));

  for (let i = 0; i < betSizes.length; i++) {
    let betSize = betSizes[i];
    switch (i) {
      case 0:
        toCall = betSize - 100;
        betSize -= 50;
        betFractions.push(betSize / currentPot);
        currentPot += betSize;
        potOdds.push(toCall / (currentPot + toCall));
        break;
      case 1:
        toCall = betSize - betSizes[i-1];        
        betSize -= 100;
        betFractions.push(betSize / currentPot);
        currentPot += betSize;
        potOdds.push(toCall / (currentPot + toCall));
        break;
      default:
        toCall = betSize - betSizes[i-1]; 
        betSize -= betSizes[i-2];
        betFractions.push(betSize / currentPot);
        currentPot += (betSize);
        potOdds.push(toCall / (currentPot + toCall));
        break;
    }
  }
  //console.log(betFractions, potOdds)
  return [betFractions, potOdds, currentPot];
}

function betFractionsPotOddsPostFlop(previousPot, actualBetSizes) {
  let currentPot = 0;
  let betFractions = [];
  let potOdds = [];
  let toCall = 0;

  potOdds.push(toCall / (previousPot + toCall));

  for (let i = 0; i < actualBetSizes.length; i++) {
    let betSize = actualBetSizes[i];
    switch (i) {
      case 0:
        betFractions.push(betSize / previousPot);
        currentPot = previousPot + betSize;
        potOdds.push(betSize / (currentPot + betSize));
        break;
      case 1:
        betFractions.push(betSize / currentPot);
        currentPot += betSize;
        toCall = betSize - actualBetSizes[i-1];
        potOdds.push(toCall / (currentPot + toCall));
      break;
      default:
        betFractions.push(betSize / currentPot);
        currentPot += betSize;
        toCall = betSize - actualBetSizes[i-1] + actualBetSizes[i-2];
        console.log();
        potOdds.push(toCall / (currentPot + toCall));
      break;
    }
  }

  return [betFractions, potOdds, currentPot];
}

function sumVector(numbers) {  
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }  
  return sum;
}

function formatTimeElapsed(startTime, currentTime) {
  const timeElapsed = currentTime - startTime;
  const hours = Math.floor(timeElapsed / (1000 * 60 * 60));
  const minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function getIniciative(prevSequence, heroInButton, flag = 0) {
    // Filtrar solo las letras del array
    const lettersOnly = prevSequence.split('').filter((char) => /^[A-Za-z]$/.test(char));

    // Buscar la posición de la última 'r'
    let lastIndex = -1;
    for (let i = 0; i < lettersOnly.length; i++) {
      if (lettersOnly[i].toLowerCase() === 'r') {
        lastIndex = i;
      }
    }

    let iniciative;
    let inversa;
    if(heroInButton === 1){
        if (lastIndex % 2 === 0) {
            iniciative = 0; // Índice par
            inversa = 1;
        } else {
            iniciative = 1; // Índice impar
            inversa = 0;
        }
    } else {
        if (lastIndex % 2 === 0) {
            iniciative = 1; // Índice par
            inversa = 0;
        } else {
            iniciative = 0; // Índice impar
            inversa = 1;
        }
    }

    iniciative = (flag === 0) ? iniciative : inversa;
    iniciative = (lastIndex === -1) ? 0.5 : iniciative;
  
    return iniciative;    
}


function classifyHand(hand) {
  const handCluster = {
    "22":4,"32s":1,"42s":1,"52s":1,"62s":1,"72s":1,"82s":2,"92s":2,"T2s":2,"J2s":4,"Q2s":4,"K2s":4,"A2s":6,
    "32o":1,"33":6,"43s":1,"53s":1,"63s":1,"73s":1,"83s":2,"93s":2,"T3s":3,"J3s":4,"Q3s":4,"K3s":6,"A3s":6,
    "42o":1,"43o":1,"44":6,"54s":1,"64s":1,"74s":2,"84s":2,"94s":2,"T4s":3,"J4s":4,"Q4s":4,"K4s":6,"A4s":6,
    "52o":1,"53o":1,"54o":1,"55":6,"65s":3,"75s":3,"85s":3,"95s":3,"T5s":3,"J5s":4,"Q5s":4,"K5s":6,"A5s":6,
    "62o":1,"63o":1,"64o":1,"65o":1,"66":7,"76s":3,"86s":3,"96s":3,"T6s":3,"J6s":4,"Q6s":5,"K6s":6,"A6s":6,
    "72o":1,"73o":1,"74o":1,"75o":2,"76o":3,"77":7,"87s":3,"97s":3,"T7s":5,"J7s":5,"Q7s":5,"K7s":6,"A7s":7,
    "82o":1,"83o":1,"84o":2,"85o":2,"86o":3,"87o":3,"88":8,"98s":3,"T8s":5,"J8s":5,"Q8s":5,"K8s":6,"A8s":7,
    "92o":2,"93o":2,"94o":2,"95o":2,"96o":3,"97o":3,"98o":3,"99":8,"T9s":5,"J9s":5,"Q9s":5,"K9s":7,"A9s":7,
    "T2o":2,"T3o":2,"T4o":2,"T5o":2,"T6o":3,"T7o":3,"T8o":3,"T9o":5,"TT":8,"JTs":5,"QTs":7,"KTs":7,"ATs":7,
    "J2o":2,"J3o":2,"J4o":4,"J5o":4,"J6o":4,"J7o":4,"J8o":5,"J9o":5,"JTo":5,"JJ":8,"QJs":7,"KJs":7,"AJs":7,
    "Q2o":4,"Q3o":4,"Q4o":4,"Q5o":4,"Q6o":4,"Q7o":4,"Q8o":5,"Q9o":5,"QTo":5,"QJo":5,"QQ":8,"KQs":7,"AQs":7,
    "K2o":4,"K3o":4,"K4o":4,"K5o":6,"K6o":6,"K7o":6,"K8o":6,"K9o":6,"KTo":7,"KJo":7,"KQo":7,"KK":8,"AKs":7,
    "A2o":6,"A3o":6,"A4o":6,"A5o":6,"A6o":6,"A7o":6,"A8o":6,"A9o":7,"ATo":7,"AJo":7,"AQo":7,"AKo":7,"AA":8,
  };
  return handCluster[hand];
}

const preflopHSprecomputed = {
  "22":51.3108,"32s":38.8592,"42s":39.7188,"52s":40.7332,"62s":40.5806,"72s":40.8827,"82s":42.8767,"92s":44.8382,"T2s":47.1106,"J2s":49.5335,"Q2s":52.2447,"K2s":55.1791,"A2s":59.2971,
  "32o":35.3438,"33":54.5613,"43s":41.6493,"53s":42.6911,"63s":42.4567,"73s":42.7897,"83s":43.5487,"93s":45.6297,"T3s":47.9727,"J3s":50.4911,"Q3s":53.0682,"K3s":56.0640,"A3s":60.1473,
  "42o":36.3073,"43o":38.1899,"44":57.7467,"54s":44.2891,"64s":44.2298,"74s":44.5565,"84s":45.3078,"94s":46.3261,"T4s":48.9167,"J4s":51.2407,"Q4s":53.8468,"K4s":56.8655,"A4s":60.8228,
  "52o":37.4324,"53o":39.4218,"54o":41.2431,"55":60.9536,"65s":45.9199,"75s":46.3689,"85s":47.1079,"95s":48.1013,"T5s":49.4156,"J5s":52.1842,"Q5s":54.8217,"K5s":57.7177,"A5s":61.7567,
  "62o":37.0663,"63o":39.1338,"64o":41.0411,"65o":42.8628,"66":63.8965,"76s":47.9156,"86s":48.7531,"96s":49.7228,"T6s":51.0417,"J6s":52.5134,"Q6s":55.6002,"K6s":58.5071,"A6s":61.7141,
  "72o":37.3716,"73o":39.4333,"74o":41.4571,"75o":43.3358,"76o":45.0259,"77":66.6894,"87s":50.1824,"97s":51.2992,"T7s":52.6071,"J7s":54.1922,"Q7s":56.1537,"K7s":59.2198,"A7s":62.5664,
  "82o":39.5791,"83o":40.1383,"84o":42.1231,"85o":44.1398,"86o":45.8158,"87o":47.3086,"88":69.6264,"98s":52.6673,"T8s":54.1110,"J8s":55.6944,"Q8s":57.6124,"K8s":59.7952,"A8s":63.3798,
  "92o":41.6130,"93o":42.7004,"94o":43.2198,"95o":45.1556,"96o":46.8602,"97o":48.5252,"98o":50.0776,"99":72.4757,"T9s":55.7207,"J9s":57.2324,"Q9s":59.1241,"K9s":61.3357,"A9s":64.0968,
  "T2o":44.1201,"T3o":45.0178,"T4o":45.8914,"T5o":46.6916,"T6o":48.3258,"T7o":50.0609,"T8o":51.6646,"T9o":53.2968,"TT":75.3498,"JTs":58.9250,"QTs":60.7121,"KTs":62.9238,"ATs":65.6766,
  "J2o":46.5991,"J3o":47.5448,"J4o":48.4826,"J5o":49.4435,"J6o":49.9147,"J7o":51.6551,"J8o":53.2382,"J9o":54.8809,"JTo":56.6373,"JJ":77.8088,"QJs":61.4579,"KJs":63.6467,"AJs":66.3846,
  "Q2o":49.4197,"Q3o":50.4041,"Q4o":51.3225,"Q5o":52.2619,"Q6o":53.0552,"Q7o":53.6059,"Q8o":55.2417,"Q9o":56.9237,"QTo":58.6269,"QJo":59.3416,"QQ":80.2465,"KQs":64.3357,"AQs":67.1379,
  "K2o":52.6495,"K3o":53.5974,"K4o":54.4877,"K5o":55.3236,"K6o":56.1356,"K7o":56.8855,"K8o":57.6263,"K9o":59.2926,"KTo":60.9329,"KJo":61.6498,"KQo":62.4950,"KK":82.6360,"AKs":67.8471,
  "A2o":56.9037,"A3o":57.9400,"A4o":58.7058,"A5o":59.6383,"A6o":59.4934,"A7o":60.5035,"A8o":61.3623,"A9o":62.1113,"ATo":63.8681,"AJo":64.6403,"AQo":65.3551,"AKo":66.1339,"AA":85.4579,
};