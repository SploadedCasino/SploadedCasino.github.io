let playerBalance = 1000;
let playerBet = 0;
let playerHand = [];
let dealerHand = [];
let gameStarted = false;
let highScore = 0;

function updateBalance() {
  document.getElementById('playerBalance').innerText = `Balance: $${playerBalance}`;
}

function placeBet(amount) {
  if (!gameStarted) {
    if (playerBet + amount <= playerBalance) {
      playerBet += amount;
      playerBalance -= amount;
      updateBalance();
    } else {
      alert("Insufficient balance for this bet.");
    }
  }
}

function startGame() {
  if (playerBet > 0 && !gameStarted) {
    gameStarted = true;
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];
    renderHands();
    checkForBlackjack();
    document.getElementById('hitButton').disabled = false;
    document.getElementById('standButton').disabled = false;
    document.getElementById('startButton').disabled = true;
  }
}

function drawCard() {
  const cardValue = Math.floor(Math.random() * 13) + 1;
  const cardType = ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(Math.random() * 4)];
  return { value: cardValue, type: cardType };
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
  if (value > 10) return '10';
  return value.toString();
}

function hit() {
  if (gameStarted) {
    playerHand.push(drawCard());
    renderHands();
    const playerTotal = calculateTotal(playerHand);
    if (playerTotal > 21) {
      document.getElementById('message').innerText = "You bust, Dealer wins.🤡";
      endGame();
    }
  }
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
      updateHighScore();
    } else if (playerTotal < dealerTotal) {
      document.getElementById('message').innerText = "Dealer wins.🤡";
    } else {
      document.getElementById('message').innerText = "It's a tie.🥶";
      playerBalance += playerBet;
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

  if (playerTotal === 21) {
    document.getElementById('message').innerText = "Blackjack! You win!🤑";
    playerBalance += playerBet * 2.5;
    updateHighScore();
    endGame();
  } else if (dealerTotal === 21) {
    document.getElementById('message').innerText = "Dealer has Blackjack! You lose.🥶";
    endGame();
  }
}

function endGame() {
  renderHands(true);
  setTimeout(() => {
    playerHand = [];
    dealerHand = [];
    document.getElementById('playerCards').innerHTML = '';
    document.getElementById('dealerCards').innerHTML = '';
    document.getElementById('message').innerText = '';
    playerBet = 0;
    gameStarted = false;
    updateBalance();
    document.getElementById('hitButton').disabled = true;
    document.getElementById('standButton').disabled = true;
    document.getElementById('startButton').disabled = true;
    saveGameState();
  }, 4000);
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
  document.getElementById('startButton').disabled = false;
});

function saveGameState() {
  const gameState = {
    playerBalance: playerBalance,
    playerHand: playerHand,
    dealerHand: dealerHand,
    gameStarted: gameStarted,
    playerBet: playerBet,
    timestamp: Date.now()
  };
  localStorage.setItem('blackjackGameState', JSON.stringify(gameState));
}

function loadGameState() {
  const savedState = localStorage.getItem('blackjackGameState');
  if (savedState) {
    const gameState = JSON.parse(savedState);

    const currentTime = Date.now();
    if (currentTime - gameState.timestamp <= 30000 && !gameStarted) 
    {
      playerBalance = gameState.playerBalance;
      playerHand = gameState.playerHand;
      dealerHand = gameState.dealerHand;
      gameStarted = gameState.gameStarted;
      playerBet = gameState.playerBet;

      updateBalance();
      renderHands(true);
      if (gameStarted) {
        document.getElementById('hitButton').disabled = false;
        document.getElementById('standButton').disabled = false;
        document.getElementById('startButton').disabled = true;
      }
    }
  }
}

window.onload = function() {
  loadHighScore();
  loadGameState();
}
