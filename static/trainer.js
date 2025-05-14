"use strict";

// Función para cargar y almacenar las redes neuronales en arrays correspondientes
function loadNeuralNetworks() {
  // URLs de los archivos JSON que contienen las redes neuronales
  const neuralNetworkURLs = [
    'static/BrainNN/NNPreflop1.json',
    'static/BrainNN/NNPreflop2.json',
    'static/BrainNN/NNFlop1.json',
    'static/BrainNN/NNFlop2.json',
    'static/BrainNN/NNTurn1.json',
    'static/BrainNN/NNTurn2.json',
    'static/BrainNN/NNRiver1.json',
    'static/BrainNN/NNRiver2.json'
  ];

  window.preFlopNN = [];
  window.flopNN = [];
  window.turnNN = [];
  window.riverNN = [];

  fetch(neuralNetworkURLs[0]).then(response => response.json()).then(data => window.preFlopNN.push(new brain.NeuralNetwork().fromJSON(data)));
  fetch(neuralNetworkURLs[1]).then(response => response.json()).then(data => window.preFlopNN.push(new brain.NeuralNetwork().fromJSON(data)));
  fetch(neuralNetworkURLs[2]).then(response => response.json()).then(data => window.flopNN.push(new brain.NeuralNetwork().fromJSON(data)));
  fetch(neuralNetworkURLs[3]).then(response => response.json()).then(data => window.flopNN.push(new brain.NeuralNetwork().fromJSON(data)));
  fetch(neuralNetworkURLs[4]).then(response => response.json()).then(data => window.turnNN.push(new brain.NeuralNetwork().fromJSON(data)));
  fetch(neuralNetworkURLs[5]).then(response => response.json()).then(data => window.turnNN.push(new brain.NeuralNetwork().fromJSON(data)));
  fetch(neuralNetworkURLs[6]).then(response => response.json()).then(data => window.riverNN.push(new brain.NeuralNetwork().fromJSON(data)));
  fetch(neuralNetworkURLs[7]).then(response => response.json()).then(data => window.riverNN.push(new brain.NeuralNetwork().fromJSON(data)));
}
  

function progressBars(output, to_call) { 
    var foldBar = document.querySelector("#heroFold .progress-bar-fill");
    foldBar.style.width = `${(output.heroFold < 0 || to_call == 0) ? 0 : output.heroFold * 100}%`;

    var checkCallBar = document.querySelector("#heroCheckCall .progress-bar-fill");
    // Verifica si heroCheck está definido
    if (output.heroCheck !== undefined) {
        // Si heroCheck está definido, toma el máximo entre heroCheck y heroCall
        var checkValue = Math.max(output.heroCheck, output.heroCall);
        checkCallBar.style.width = `${checkValue < 0 ? 0 : checkValue * 100}%`;
    } else {
        // Si heroCheck no está definido, utiliza heroCall
        checkCallBar.style.width = `${output.heroCall < 0 ? 0 : output.heroCall * 100}%`;
    }

    var raiseBar = document.querySelector("#heroRaise .progress-bar-fill");
    raiseBar.style.width = `${output.heroRaise < 0 ? 0 : output.heroRaise * 100}%`;

    var betLevelH2Bar = document.querySelector("#betLevelH2 .progress-bar-fill");
    betLevelH2Bar.style.width = `${output.betLevelH2 < 0 ? 0 : output.betLevelH2 * 100}%`;

    var betLevelH3Bar = document.querySelector("#betLevelH3 .progress-bar-fill");
    betLevelH3Bar.style.width = `${output.betLevelH3 < 0 ? 0 : output.betLevelH3 * 100}%`;

    var betLevelH4Bar = document.querySelector("#betLevelH4 .progress-bar-fill");
    betLevelH4Bar.style.width = `${output.betLevelH4 < 0 ? 0 : output.betLevelH4 * 100}%`;

    var betLevelH5Bar = document.querySelector("#betLevelH5 .progress-bar-fill");
    betLevelH5Bar.style.width = `${output.betLevelH5 < 0 ? 0 : output.betLevelH5 * 100}%`;

    var allInBar = document.querySelector("#heroAllIn .progress-bar-fill");
    allInBar.style.width = `${output.heroAllIn < 0 ? 0 : output.heroAllIn * 100}%`;
}


const outputZero = {
    heroFold: 0,
    heroCheck: 0,
    heroCall: 0,
    heroRaise: 0,
    heroAllIn: 0,
    betLevelH1: 0,
    betLevelH2: 0,
    betLevelH3: 0,
    betLevelH4: 0,
    betLevelH5: 0,
};

function trainer_preflop(human_hand, to_call, button_index, players, contador) {
  
    const hand = human_hand.map(repr).join(' ').replace(/♥/g, "<span style='color:red;'>♥</span>")
                                                .replace(/♦/g, "<span style='color:blue;'>♦</span>")
                                                .replace(/♣/g, "<span style='color:green;'>♣</span>")
                                                .replace(/♠/g, "<span style='color:black;'>♠</span>");
  
    const trainer_text = "<tr><td><font size=+4>" +
      hand +
      "</font><br>" +
      "<font size=+2> Pot odds: <b>" +
      calc_pot_odds2(get_pot_size(), to_call) +
      " (" +
      calc_pot_odds(get_pot_size(), to_call) +
      "%)</b><br>" +
      "<font size=+2> Hand Strength: <b>" +
      (hsPreflop(human_hand, 2) * 100).toFixed(2) +
      "%</b><br>" +
      // "<font size=+2> EV call: <b>$" + calc_EV(get_pot_size(), to_call, hs(human_hand, 2)) + "</b><br>" +
      "</font></td></tr>";

  
    const NNinput = {
    //   preflopHS: normalize(hsPreflop(human_hand, 2), 0.15, 0.86), // 0.35, 0.86    
      preflopHS: hsPreflop(human_hand, 2),
      handGroup: classifyHand(hrepr(human_hand)) / 8,
      heroInButton: button_index === 1 ? 0 : 1,
      potOddsH: (calc_pot_odds(get_pot_size(), to_call) / 100) * 2,
      villainCheck:
        contador === 1 && button_index === 1 && to_call === 0 ? 1 : 0,
      villainRaise:
        contador === 1 && to_call > 50 ? 1 : (contador === 2 || contador === 3) && to_call > 0 ? 1 : 0,
      villainAllIn: (players[1].total_bet + players[1].subtotal_bet) === 20000 ? 1 : 0,
    };
    const NNoutput = preFlopNN[contador-1].run(NNinput);
    progressBars(NNoutput, to_call);
    console.log('Input preFlopNN: ', NNinput);    
    console.log('Output preFlopNN: ', [contador], NNoutput);
  
    gui_write_trainer_text(trainer_text);
}
  

function trainer_flop (human_hand, to_call, button_index, players, contador){
    var hand = human_hand.map(repr).join(' ').replace(/♥/g, "<span style='color:red;'>♥</span>")
                                             .replace(/♦/g, "<span style='color:blue;'>♦</span>")
                                             .replace(/♣/g, "<span style='color:green;'>♣</span>")
                                             .replace(/♠/g, "<span style='color:black;'>♠</span>");
    var flop = get_flop_cards(board);
    var flopval = handval(human_hand.concat(flop));
    let flopstats = handPotential2(human_hand, flop);
    var trainer_text = "<tr><td><font size=+4>" + hand + "<br>" + 
                        flop.map(repr).join(' ').replace(/♥/g, "<span style='color:red;'>♥</span>")
                                                .replace(/♦/g, "<span style='color:blue;'>♦</span>")
                                                .replace(/♣/g, "<span style='color:green;'>♣</span>")
                                                .replace(/♠/g, "<span style='color:black;'>♠</span>") + "</font><br>" +
                        "<font size=+2> You have: <b>" + handname(flopval) + "</b><br>" +
                        "<div style='line-height: 0.8;'>" + // Contenedor con estilo de interlineado reducido
                        "<font size=+0> Pot odds: <b>" + calc_pot_odds2(get_pot_size(), to_call) + " (" + calc_pot_odds(get_pot_size(), to_call) + "%)</b><br>" +
                        "<font size=+0> Hand Strength: <b>" + (flopstats[0]*100).toFixed(2) + "%</b><br>" +
                        "<font size=+0> Positive Potential: <b>" + (flopstats[1]*100).toFixed(2) + "%</b><br>" +
                        "<font size=+0> Negative Potential: <b>" + (flopstats[2]*100).toFixed(2) + "%</b><br>" +
                        "<font size=+0> Effective Hand Strength: <b>" + (flopstats[3]*100).toFixed(2) + "%</b><br>" +
                        // "<font size=+2> EV call: <b>$" + calc_EV(get_pot_size(), to_call, hs(human_hand, 2, flop)) + "</b><br>" +
                        "</font></td></tr>";
  
    const NNinput = {
        heroInButton: button_index === 1 ? 0 : 1,
        handGroup: classifyHand(hrepr(human_hand)) / 8,
        HS: flopstats[0],
        PPot: normalize(flopstats[1], 0, 0.642),
        EHS: flopstats[3],
        potOddsH: (calc_pot_odds(get_pot_size(), to_call) / 100) * 2,
        initiative: INITIATIVE,
        villainCheck: 
            contador === 1 && button_index === 0 && to_call === 0 ? 1 : 0,
        villainRaise: 
            to_call > 0 ? 1 : 0,
        villainAllIn: (players[1].total_bet + players[1].subtotal_bet) === 20000 ? 1 : 0,
        // villainAllIn: 0,
    };
    const NNoutput = flopNN[contador-1].run(NNinput);
    progressBars(NNoutput, to_call);    
    console.log('Input flopNN: ', NNinput);
    console.log('Output flopNN: ', [contador], NNoutput);

    gui_write_trainer_text(trainer_text);
    // progressBars(outputZero);
}

function trainer_turn (human_hand, to_call, button_index, players, contador){
    var hand = human_hand.map(repr).join(' ').replace(/♥/g, "<span style='color:red;'>♥</span>")
                                             .replace(/♦/g, "<span style='color:blue;'>♦</span>")
                                             .replace(/♣/g, "<span style='color:green;'>♣</span>")
                                             .replace(/♠/g, "<span style='color:black;'>♠</span>");
    var turn = get_turn_cards(board);      
    var turnval = handval(human_hand.concat(turn));
    let turnstats = handPotential1(human_hand, turn);
    var trainer_text = "<tr><td><font size=+4>" + hand + "<br>" + 
                        turn.map(repr).join(' ').replace(/♥/g, "<span style='color:red;'>♥</span>")
                                                .replace(/♦/g, "<span style='color:blue;'>♦</span>")
                                                .replace(/♣/g, "<span style='color:green;'>♣</span>")
                                                .replace(/♠/g, "<span style='color:black;'>♠</span>") + "</font><br>" +
                        "<font size=+2> You have: <b>" + handname(turnval) + "</b></font><br>" + 
                        "<div style='line-height: 0.8;'>" + // Contenedor con estilo de interlineado reducido
                        "<font size=+0> Pot odds: <b>" + calc_pot_odds2(get_pot_size(), to_call) + " (" + calc_pot_odds(get_pot_size(), to_call) + "%)</b></font><br>" +
                        "<font size=+0> Hand Strength: <b>" + (turnstats[0]*100).toFixed(2) + "%</b></font><br>" +
                        "<font size=+0> Positive Potential: <b>" + (turnstats[1]*100).toFixed(2) + "%</b></font><br>" +
                        "<font size=+0> Negative Potential: <b>" + (turnstats[2]*100).toFixed(2) + "%</b></font><br>" +
                        "<font size=+0> Effective Hand Strength: <b>" + (turnstats[3]*100).toFixed(2) + "%</b></font><br>" +
                        // "<font size=+2> EV call: <b>$" + calc_EV(get_pot_size(), to_call, hs(human_hand, 2, turn)) + "</b><br>" +
                        "</div></td></tr>";

    const NNinput = {
        heroInButton: button_index === 1 ? 0 : 1,
        handGroup: classifyHand(hrepr(human_hand)) / 8,
        HS: turnstats[0],
        PPot: normalize(turnstats[1], 0, 0.4273),
        EHS: turnstats[3],
        potOddsH: (calc_pot_odds(get_pot_size(), to_call) / 100) * 2,
        initiative: INITIATIVE,
        villainCheck: 
            contador === 1 && button_index === 0 && to_call === 0 ? 1 : 0,
        villainRaise: 
            to_call > 0 ? 1 : 0,
        villainAllIn: (players[1].total_bet + players[1].subtotal_bet) === 20000 ? 1 : 0,
        // villainAllIn: 0,
    };
    const NNoutput = turnNN[contador-1].run(NNinput);
    progressBars(NNoutput, to_call);    
    console.log('Input turnNN: ', NNinput);
    console.log('Output turnNN: ', [contador], NNoutput);

    gui_write_trainer_text(trainer_text);
}

function trainer_river (human_hand, to_call, button_index, players, contador){
    var hand = human_hand.map(repr).join(' ').replace(/♥/g, "<span style='color:red;'>♥</span>")
                                             .replace(/♦/g, "<span style='color:blue;'>♦</span>")
                                             .replace(/♣/g, "<span style='color:green;'>♣</span>")
                                             .replace(/♠/g, "<span style='color:black;'>♠</span>");
    var river = get_river_cards(board);
    var riverval = handval(human_hand.concat(river));
    var trainer_text = "<tr><td><font size=+4>" + hand + "  " + "<br>" + 
                        river.map(repr).join(' ').replace(/♥/g, "<span style='color:red;'>♥</span>")
                        .replace(/♦/g, "<span style='color:blue;'>♦</span>")
                        .replace(/♣/g, "<span style='color:green;'>♣</span>")
                        .replace(/♠/g, "<span style='color:black;'>♠</span>") + "</font><br>" +
                        "<font size=+2> You have: <b>" + handname(riverval) + "</b><br>" + 
                        "<font size=+2> Pot odds: <b>" + calc_pot_odds2(get_pot_size(), to_call) + " (" + calc_pot_odds(get_pot_size(), to_call) + "%)</b><br>" +
                        "<font size=+2> Hand Strength: <b>" + (hs(human_hand, river)*100).toFixed(2) + "%</b><br>" +
                        // "<font size=+2> EV call: <b>$" + calc_EV(get_pot_size(), to_call, hs(human_hand, 2, river)) + "</b><br>" +
                        "</font></td></tr>";

    const NNinput = {
        heroInButton: button_index === 1 ? 0 : 1,
        handGroup: classifyHand(hrepr(human_hand)) / 8,
        HS: hs(human_hand, river),
        potOddsH: (calc_pot_odds(get_pot_size(), to_call) / 100) * 2,
        initiative: INITIATIVE,
        villainCheck: 
            contador === 1 && button_index === 0 && to_call === 0 ? 1 : 0,
        villainRaise: 
            to_call > 0 ? 1 : 0,
        villainAllIn: (players[1].total_bet + players[1].subtotal_bet) === 20000 ? 1 : 0,
        // villainAllIn: 0,
    };
    const NNoutput = riverNN[contador-1].run(NNinput);
    progressBars(NNoutput, to_call);    
    console.log('Input riverNN: ', NNinput);
    console.log('Output riverNN: ', [contador], NNoutput);

    gui_write_trainer_text(trainer_text);
}

function calc_pot_odds (pot_size, call_size){
    var pot_odds = call_size / (pot_size + call_size);

    return parseFloat((pot_odds*100).toFixed(2));
}

function calc_pot_odds2(pot_size, call_size) {
    if (call_size === 0) {
        return "0:1";
    } else {
        var ratio = (pot_size / call_size);
        if (ratio % 1 !== 0) {
            return ratio.toFixed(1) + ":1";
        } else {
            return ratio + ":1";
        }
    }
}


function calc_EV(pot_size, call_size, win_prob) {
    let profit = pot_size;
    let losses = -call_size;
    // Calculamos la EV como la suma del producto de la probabilidad de cada resultado posible y el valor de cada resultado
    let EV = (win_prob * profit) + ((1 - win_prob) * losses);
    
    return parseFloat(EV.toFixed(2));
}

function normalize(data, minValue, maxValue) {
    return (data - minValue) / (maxValue - minValue);
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