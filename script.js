let playerBalance = 1000;
let playerBet = 0;
let playerHand = [];
let dealerHand = [];
let gameStarted = false;
let highScore = 1000;
let deck = [];
const numberOfDecks = 8;
let canDoubleDown = false;
const winSound = new Audio('sounds/win.mp3');
winSound.preload = 'auto';
const loseSound = new Audio('sounds/lose.mp3');
loseSound.preload = 'auto';
const startSound = new Audio('sounds/start.mp3');
startSound.preload = 'auto';

function showHelp() {
  document.getElementById('helpModal').style.display = 'flex';
}

function closeHelp() {
  document.getElementById('helpModal').style.display = 'none';
}

window.onclick = function(event) {
  const modal = document.getElementById('helpModal');
  const modalContent = document.querySelector('.modal-content');
  
  // Check if the click was outside the modal content
  if (event.target === modal) {
    closeHelpModal();
  }
};

function playWinSound() {
  winSound.play();
}
function playLoseSound() {
  loseSound.play();
}
function playStartSound() {
  startSound.play();
}
function playBetSound() {
  betSound.play();
}
function updateBalance() {
  document.getElementById('playerBalance').innerText = `Balance: $${playerBalance}`;
  document.getElementById('playerBetAmount').innerText = `Bet: $${playerBet}`;
}

function clearBet() {
  if (!gameStarted) {
    playerBalance += playerBet; 
    playerBet = 0; 
    updateBalance(); 
    document.getElementById('clearbetButton').disabled = true;
    document.getElementById('startButton').disabled = true;
  }
}

function placeBet(amount) {
  if (!gameStarted) {
    if (amount <= playerBalance) {
      playerBet += amount;
      playerBalance -= amount;
      updateBalance();
      document.getElementById('clearbetButton').disabled = false;
    } else {
      showCustomAlert("You stupid brokie 🤡😂");
    }
  }
}

function showCustomAlert(message) {
  document.getElementById('alertMessage').innerText = message;
  document.getElementById('customAlert').style.display = 'flex';
}

function closeCustomAlert() {
  document.getElementById('customAlert').style.display = 'none';
}

function startGame() {
  if (playerBet > 0 && !gameStarted) {
    playStartSound();
    gameStarted = true;
    canDoubleDown = true;
    document.getElementById('doubleDownButton').disabled = false;
    const dealerLabel = document.getElementById('dealerLabel');
    const playerLabel = document.getElementById('playerLabel');
    const message = document.getElementById('message');
    dealerLabel.style.display = 'block';
    dealerLabel.classList.remove('fade-out');
    playerLabel.style.display = 'block';
    playerLabel.classList.remove('fade-out');
    message.classList.remove('fade-out');
    if (deck.length < numberOfDecks * 52 * 0.25) {
      deck = shuffleDeck(createDeck());
    }
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];
    dealInitialCards();
    document.getElementById('hitButton').disabled = false;
    document.getElementById('standButton').disabled = false;
    document.getElementById('startButton').disabled = true;
    document.getElementById('clearbetButton').disabled = true;
    let betButtons = document.querySelectorAll('.placebetButton');
    betButtons.forEach(button => button.disabled = true);
  }
}

function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck = [];
  for (let i = 0; i < numberOfDecks; i++) {
    for (let suit of suits) {
      for (let value = 1; value <= 13; value++) {
        deck.push({ value, type: suit });
      }
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawCard() {
  return deck.pop();
}

function renderHands(revealDealerCard = false) {
  const playerCardsDiv = document.getElementById('playerCards');
  const dealerCardsDiv = document.getElementById('dealerCards');
  playerCardsDiv.innerHTML = '';
  dealerCardsDiv.innerHTML = '';
  playerHand.forEach(card => {
    const cardDiv = document.createElement('img');
    cardDiv.src = `cards/${card.type}_${getCardName(card.value)}.png`;
    cardDiv.className = 'card';
    playerCardsDiv.appendChild(cardDiv);
  });
  dealerHand.forEach((card, index) => {
    const cardDiv = document.createElement('img');
    if (index === 0 && !revealDealerCard) {
      cardDiv.src = `cards/back.png`;
    } else {
      cardDiv.src = `cards/${card.type}_${getCardName(card.value)}.png`;
    }
    cardDiv.className = 'card';
    dealerCardsDiv.appendChild(cardDiv);
  });
}

function getCardName(value) {
  if (value === 1) return 'a';
  if (value === 11) return 'j';
  if (value === 12) return 'q';
  if (value === 13) return 'k';
  if (value > 10) return '10';
  return value.toString();
}


function hit() {
  if (gameStarted) {
    document.getElementById('doubleDownButton').disabled = true;
    document.getElementById('hitButton').disabled = true;
    playerHand.push(drawCard());
    dealCard(playerHand[playerHand.length - 1], 'player').then(() => {
      const playerTotal = calculateTotal(playerHand);
      setTimeout(() => {
        document.getElementById('hitButton').disabled = false;

        if (playerTotal > 21) {
          document.getElementById('message').innerText = "You bust, Dealer wins.🤡";
          playLoseSound();
          endGame();
        }
        if (playerHand.length > 2) {
        }
      }, 500);
    });
  }
}
function doubleDown() {
  if (canDoubleDown && playerBalance >= playerBet) {
    playerBalance -= playerBet;
    playerBet *= 2;
    updateBalance();
    document.getElementById('doubleDownButton').disabled = true;
    document.getElementById('hitButton').disabled = true;
    playerHand.push(drawCard());
    dealCard(playerHand[playerHand.length - 1], 'player').then(() => {
      const playerTotal = calculateTotal(playerHand);

      if (playerTotal > 21) {
        document.getElementById('message').innerText = "You bust, Dealer wins.🤡";
        playLoseSound();
        endGame();
      } else {
        stand();
      }
    });
  } else {
    showCustomAlert("You stupid brokie 🤡😂");
  }
}
function dealCard(card, player, isHidden = false) {
  return new Promise(resolve => {
    const cardDiv = document.createElement('img');
    if (isHidden && player === 'dealer') {
      cardDiv.src = `cards/back.png`;
    } else {
      cardDiv.src = `cards/${card.type}_${getCardName(card.value)}.png`;
    }
    cardDiv.className = `card ${player}-card`;

    const targetDiv = document.getElementById(`${player}Cards`);
    targetDiv.appendChild(cardDiv);
    cardDiv.classList.add('slide-in');
    cardDiv.addEventListener('animationend', () => {
      cardDiv.classList.remove('slide-in');
      resolve();
    });
  });
}

async function dealInitialCards() {
  for (let card of playerHand) {
    await dealCard(card, 'player');
  }
  await dealCard(dealerHand[0], 'dealer', true);
  await dealCard(dealerHand[1], 'dealer');
  checkForBlackjack();
}

function stand() {
  if (gameStarted) {
    const playerTotal = calculateTotal(playerHand);
    while (calculateTotal(dealerHand) < 17) {
      dealerHand.push(drawCard());
    }
    renderHands(true);
    const dealerTotal = calculateTotal(dealerHand);
    if (dealerTotal > 21 || playerTotal > dealerTotal) {
      document.getElementById('message').innerText = "You win!🤑";
      playerBalance += playerBet * 2;
      playWinSound();
      updateHighScore();
    } else if (playerTotal < dealerTotal) {
      document.getElementById('message').innerText = "Dealer wins.🤡";
      playLoseSound();
    } else {
      document.getElementById('message').innerText = "It's a tie.🥶";
      playerBalance += playerBet;
      playLoseSound();
    }
    endGame();
  }
}
function calculateTotal(hand) {
  let total = 0;
  let aces = 0;
  hand.forEach(card => {
    if (card.value > 10) {
      total += 10;
    } else if (card.value === 1) {
      total += 11;
      aces++;
    } else {
      total += card.value;
    }
  });
  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }
  return total;
}

function checkForBlackjack() {
  const playerTotal = calculateTotal(playerHand);
  const dealerTotal = calculateTotal(dealerHand);
   if (playerTotal === 21 && dealerTotal === 21) {
    document.getElementById('message').innerText = "Both have Blackjack! It's a push.🤝";
    playLoseSound();
    document.getElementById('doubleDownButton').disabled = true;
    endGame();
  } else if (playerTotal === 21) {
    document.getElementById('message').innerText = "Blackjack! You win!🤑";
    playWinSound();
    playerBalance += Math.round(playerBet * 2.5);
    updateHighScore();
    document.getElementById('doubleDownButton').disabled = true;
    endGame();
  } else if (dealerTotal === 21) {
    document.getElementById('message').innerText = "Dealer has Blackjack! You lose.🥶";
    playLoseSound();
    document.getElementById('hitButton').disabled = true;
    document.getElementById('standButton').disabled = true;
    document.getElementById('doubleDownButton').disabled = true;
    setTimeout(endGame, 1);
  }
}

function endGame() {
  gameStarted = false;
  document.getElementById('hitButton').disabled = true;
  document.getElementById('standButton').disabled = true;
  document.getElementById('doubleDownButton').disabled = true;
  renderHands(true);
  const dealerCards = document.querySelectorAll('#dealerCards .card');
  const playerCards = document.querySelectorAll('#playerCards .card');
  dealerCards[0].classList.add('flip');
  setTimeout(() => {
    dealerCards.forEach(card => card.classList.add('fade-out'));
    playerCards.forEach(card => card.classList.add('fade-out'));
    document.getElementById('message').classList.add('fade-out');
    document.getElementById('dealerLabel').classList.add('fade-out');
    document.getElementById('playerLabel').classList.add('fade-out');
  }, 4000);
  setTimeout(() => {
    playerHand = [];
    dealerHand = [];
    document.getElementById('playerCards').innerHTML = '';
    document.getElementById('dealerCards').innerHTML = '';
    document.getElementById('message').innerText = '';
    document.getElementById('startButton').disabled = true;
    document.getElementById('clearbetButton').disabled = true;
    document.getElementById('doubleDownButton').disabled = true;
    document.getElementById('dealerLabel').style.display = 'none';
    document.getElementById('playerLabel').style.display = 'none';
    let betButtons = document.querySelectorAll('.placebetButton');
    betButtons.forEach(button => button.disabled = false);
    checkForBankruptcy();
  }, 5000);
  playerBet = 0;
  saveGameState();
  updateBalance();
}

function updateHighScore() {
  if (playerBalance > highScore) {
    highScore = playerBalance;
    document.getElementById('highScore').innerText = `High Score: $${highScore}`;
    localStorage.setItem('blackjackHighScore', highScore);
  }
}
function loadHighScore() {
  const savedHighScore = localStorage.getItem('blackjackHighScore');
  if (savedHighScore) {
    highScore = parseInt(savedHighScore, 10);
    document.getElementById('highScore').innerText = `High Score: $${highScore}`;
  }
}

document.getElementById('bettingArea').addEventListener('click', function() {
  if (playerBet > 0 && !gameStarted) {
    document.getElementById('startButton').disabled = false;
  }
});

function saveGameState() {
  const gameState = {
    playerBalance: playerBalance,
    playerBet: playerBet,
    highScore: highScore
  };
  localStorage.setItem('blackjackGameState', JSON.stringify(gameState));
}

function loadGameState() {
  const savedState = localStorage.getItem('blackjackGameState');
  if (savedState) {
    const gameState = JSON.parse(savedState);
    playerBalance = gameState.playerBalance;
    highScore = gameState.highScore;
    playerBet = gameState.playerBet;
    updateBalance();
    document.getElementById('highScore').innerText = `High Score: $${highScore}`;
    gameStarted = false;
    document.getElementById('hitButton').disabled = true;
    document.getElementById('standButton').disabled = true;
    if (playerBet > 0) {
      document.getElementById('startButton').disabled = false;
    } else {
      document.getElementById('startButton').disabled = true;
    }
  }
}

function checkForBankruptcy() {
  if (playerBalance <= 0) {
    playLoseSound();
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = "You lost all your money! Play again?";
    messageDiv.classList.remove('fade-out');
    const yesButton1 = document.createElement('button');
    yesButton1.innerText = "Yes";
    yesButton1.onclick = () => {
      playStartSound();
      resetBalance();
    }
    messageDiv.appendChild(yesButton1);
    const yesButton2 = document.createElement('button');
    yesButton2.innerText = "No";
    yesButton2.onclick = () => {
      playStartSound();
      resetBalance();
    }
    messageDiv.appendChild(yesButton2);
    document.getElementById('hitButton').disabled = true;
    document.getElementById('standButton').disabled = true;
    document.getElementById('doubleDownButton').disabled = true;
  }
}


function resetBalance() {
  playerBalance = 500;
  playerBet = 0;
  updateBalance();
  saveGameState();
  document.getElementById('message').innerHTML = '';
}

window.onload = function() {
  loadHighScore();
  loadGameState();
  checkForBankruptcy();
  startSound.load();
  winSound.load();
  loseSound.load();
}
