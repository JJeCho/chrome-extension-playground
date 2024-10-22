let score = 0;
let timeLeft = 10;
const scoreDisplay = document.getElementById('score');
const button = document.getElementById('click-me-button');

button.addEventListener('click', () => {
  score++;
  scoreDisplay.textContent = score;
});

const timer = setInterval(() => {
  timeLeft--;
  if (timeLeft <= 0) {
    clearInterval(timer);
    endGame();
  }
}, 1000);

function endGame() {
  alert(`Time's up! Your score is ${score}.`);
  chrome.storage.sync.get(['petStats'], (result) => {
    let petStats = result.petStats;
    petStats.happiness = Math.min(100, petStats.happiness + score);
    petStats.coins += score;
    chrome.storage.sync.set({ petStats }, () => {
      window.close();
    });
  });
}
