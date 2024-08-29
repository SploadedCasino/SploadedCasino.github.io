let playerBalance = 1000;
let playerBet = 0;
let playerHand = [];
let dealerHand = [];
let gameStarted = false;

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
        renderHands(false);
        checkForBlackjack();
        document.getElementById('hitButton').disabled = false;
        document.getElementById('standButton').disabled = false;
    }
}

function drawCard() {
    const cardValue = Math.floor(Math.random() * 13) + 1;
    const cardType = ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(Math.random() * 4)];
    return { value: cardValue, type: cardType };
}

function renderHands(showDealerCard) {
    const playerCardsDiv = document.getElementById('playerCards');
    const dealerCardsDiv = document.getElementById('dealerCards');
    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';

    // Render dealer's hidden card first (left)
    const dealerCardDiv = document.createElement('img');
    dealerCardDiv.src = showDealerCard ? `cards/${dealerHand[1].type}_${getCardName(dealerHand[1].value)}.png` : 'cards/back.png';
    dealerCardDiv.className = 'card';
    dealerCardsDiv.appendChild(dealerCardDiv);

    // Render the dealer's visible card (right)
    const dealerVisibleCardDiv = document.createElement('img');
    dealerVisibleCardDiv.src = `cards/${dealerHand[0].type}_${getCardName(dealerHand[0].value)}.png`;
    dealerVisibleCardDiv.className = 'card';
    dealerCardsDiv.appendChild(dealerVisibleCardDiv);

    // Render player's cards
    playerHand.forEach(card => {
        const cardDiv = document.createElement('img');
        cardDiv.src = `cards/${card.type}_${getCardName(card.value)}.png`;
        cardDiv.className = 'card';
        playerCardsDiv.appendChild(cardDiv);
    });
}

function getCardName(value) {
    if (value === 1) return 'a';
    if (value > 10) return '10'; // Treat Jack, Queen, King as 10
    return value;
}

function hit() {
    if (gameStarted) {
        playerHand.push(drawCard());
        renderHands(false);
        const playerTotal = calculateTotal(playerHand);
        if (playerTotal > 21) {
            document.getElementById('message').innerText = "You bust! Dealer wins.";
            renderHands(true);
            endGame();
        }
    }
}

function stand() {
    if (gameStarted) {
        const playerTotal = calculateTotal(playerHand);
        renderHands(true);
        while (calculateTotal(dealerHand) < 17) {
            dealerHand.push(drawCard());
        }
        renderHands(true);
        const dealerTotal = calculateTotal(dealerHand);
        if (dealerTotal > 21 || playerTotal > dealerTotal) {
            document.getElementById('message').innerText = "You win!";
            playerBalance += playerBet * 2;
        } else if (playerTotal < dealerTotal) {
            document.getElementById('message').innerText = "Dealer wins.";
        } else {
            document.getElementById('message').innerText = "It's a tie.";
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
        document.getElementById('message').innerText = "Blackjack! You win!";
        playerBalance += playerBet * 2.5;
        endGame();
    } else if (dealerTotal === 21) {
        document.getElementById('message').innerText = "Dealer has Blackjack! You lose.";
        renderHands(true);
        endGame();
    }
}

function endGame() {
    playerBet = 0;
    gameStarted = false;
    updateBalance();
    document.getElementById('hitButton').disabled = true;
    document.getElementById('standButton').disabled = true;
    document.getElementById('startButton').disabled = true;
}

document.getElementById('bettingArea').addEventListener('click', function() {
    document.getElementById('startButton').disabled = false;
});
