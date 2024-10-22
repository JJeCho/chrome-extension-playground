// Initialize pet stats
let petStats = {
  health: 100,
  hunger: 0,
  happiness: 100,
  energy: 100,       // New energy stat
  cleanliness: 100,  // New cleanliness stat
  coins: 0,          // New coins stat
  stage: 1           // Evolution stage
};

function sanitizePetStats(petStats) {
  return {
    health: Number(petStats.health) || 0,
    hunger: Number(petStats.hunger) || 0,
    happiness: Number(petStats.happiness) || 0,
    energy: Number(petStats.energy) || 0,
    cleanliness: Number(petStats.cleanliness) || 0,
    coins: Number(petStats.coins) || 0,
    stage: Number(petStats.stage) || 1,
  };
}


// Load saved stats from storage
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['petStats'], (result) => {
    petStats = {
      health: 100,
      hunger: 0,
      happiness: 100,
      energy: 100,
      cleanliness: 100,
      coins: 0,
      stage: 1,
      ...result.petStats // Merge stored stats
    };

    // Sanitize petStats
    petStats = sanitizePetStats(petStats);

    updateStatsDisplay();
  });

  // Attach event listeners to buttons
  document.getElementById('feed-button').addEventListener('click', feedPet);
  document.getElementById('play-button').addEventListener('click', playWithPet);
  document.getElementById('clean-button').addEventListener('click', cleanPet);
  document.getElementById('sleep-button').addEventListener('click', putPetToSleep);
  document.getElementById('bath-button').addEventListener('click', givePetABath);
  document.getElementById('pet-button').addEventListener('click', petThePet);
  document.getElementById('play-game-button').addEventListener('click', () => {
    window.open('minigame.html', '_blank', 'width=400,height=400');
  });
  document.getElementById('shop-button').addEventListener('click', openShop);
});

// Listen for changes in storage and update the display accordingly
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.petStats) {
    petStats = changes.petStats.newValue;
    updateStatsDisplay();
  }
});

// Functions to update the display
function updateStatsDisplay() {
  document.getElementById('health').textContent = petStats.health;
  document.getElementById('hunger').textContent = petStats.hunger;
  document.getElementById('happiness').textContent = petStats.happiness;
  document.getElementById('energy').textContent = petStats.energy;
  document.getElementById('cleanliness').textContent = petStats.cleanliness;
  document.getElementById('coins').textContent = petStats.coins;
  updatePetImage();
}

// Save stats to storage
function saveStats() {
  petStats = sanitizePetStats(petStats);
  chrome.storage.sync.set({ petStats }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving stats:', chrome.runtime.lastError);
    }
  });
}


// Update pet image based on stats and stage
function updatePetImage() {
  const petImage = document.getElementById('pet-image');
  let imageSrc = '';

  if (petStats.health <= 0) {
    imageSrc = 'images/sick.gif';
  } else if (petStats.hunger >= 80) {
    imageSrc = 'images/hungry.gif';
  } else if (petStats.happiness <= 20) {
    imageSrc = 'images/sad.gif';
  } else {
    // Change image based on stage
    switch (petStats.stage) {
      case 1:
        imageSrc = 'images/happy.gif';
        break;
      case 2:
        imageSrc = 'images/happy.gif';
        break;
      case 3:
        imageSrc = 'images/happy.gif';
        break;
      default:
        imageSrc = 'images/happy.gif';
    }
  }

  petImage.src = imageSrc;
}

// Interaction functions
function feedPet() {
  petStats.hunger = Math.max(0, petStats.hunger - 20);
  petStats.health = Math.min(100, petStats.health + 5);
  earnCoins(2); // Earn coins when feeding
  playSound('feed');
  saveStats();
  updateStatsDisplay();
}

function playWithPet() {
  petStats.happiness = Math.min(100, petStats.happiness + 20);
  petStats.hunger = Math.min(100, petStats.hunger + 10);
  earnCoins(5); // Earn coins when playing
  playSound('play');
  saveStats();
  updateStatsDisplay();
}

function cleanPet() {
  petStats.cleanliness = Math.min(100, petStats.cleanliness + 10);
  petStats.happiness = Math.max(0, petStats.happiness - 5);
  earnCoins(3); // Earn coins when cleaning
  playSound('clean');
  saveStats();
  updateStatsDisplay();
}

function putPetToSleep() {
  petStats.energy = Math.min(100, petStats.energy + 50);
  petStats.hunger = Math.min(100, petStats.hunger + 10); // Pet gets hungrier after sleep
  playSound('sleep');
  saveStats();
  updateStatsDisplay();
}

function givePetABath() {
  petStats.cleanliness = 100;
  petStats.happiness = Math.max(0, petStats.happiness - 5); // Some pets don't like baths!
  playSound('bath');
  saveStats();
  updateStatsDisplay();
}

function petThePet() {
  petStats.happiness = Math.min(100, petStats.happiness + 10);
  playSound('pet');
  saveStats();
  updateStatsDisplay();
}

function earnCoins(amount) {
  petStats.coins += amount;
  saveStats();
  updateStatsDisplay();
}

function playSound(action) {
  const audio = new Audio(`sounds/${action}.wav`);
  audio.play();
}

// Shop functionality
function openShop() {
  const item = prompt('Buy an item:\n1. Toy (20 coins)\n2. Snack (10 coins)');
  if (item === '1' && petStats.coins >= 20) {
    petStats.happiness = Math.min(100, petStats.happiness + 20);
    petStats.coins -= 20;
    alert('You bought a Toy!');
  } else if (item === '2' && petStats.coins >= 10) {
    petStats.hunger = Math.max(0, petStats.hunger - 20);
    petStats.coins -= 10;
    alert('You bought a Snack!');
  } else {
    alert('Not enough coins or invalid choice.');
  }
  saveStats();
  updateStatsDisplay();
}

// Decrease stats over time
function updatePetStats() {
  chrome.storage.sync.get(['petStats'], (result) => {
    let petStats = result.petStats || {
      health: 100,
      hunger: 0,
      happiness: 100,
      energy: 100,
      cleanliness: 100,
      coins: 0,
      stage: 1
    };

    // Modify stats over time
    petStats.hunger = Math.min(100, petStats.hunger + 1);
    petStats.happiness = Math.max(0, petStats.happiness - 1);
    petStats.energy = Math.max(0, petStats.energy - 1);
    petStats.cleanliness = Math.max(0, petStats.cleanliness - 1);

    if (petStats.hunger >= 80) {
      petStats.health = Math.max(0, petStats.health - 1);
    }
    if (petStats.energy <= 20) {
      petStats.happiness = Math.max(0, petStats.happiness - 1);
    }
    if (petStats.cleanliness <= 20) {
      petStats.health = Math.max(0, petStats.health - 1);
    }

    // Check for evolution
    checkEvolution();

    // Save updated stats
    chrome.storage.sync.set({ petStats });

    // Check if notification is needed
    let messages = [];
    if (petStats.hunger >= 80) messages.push('Your pet is very hungry!');
    if (petStats.health <= 20) messages.push('Your pet is not feeling well!');
    if (petStats.happiness <= 20) messages.push('Your pet is very sad!');
    if (petStats.energy <= 20) messages.push('Your pet is very tired!');
    if (petStats.cleanliness <= 20) messages.push('Your pet is very dirty!');

    if (messages.length > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: 'Your pet needs attention!',
        message: messages.join(' '),
        priority: 1
      });
    }
  });
}

function checkEvolution() {
  if (petStats.happiness >= 80 && petStats.health >= 80 && petStats.stage < 3) {
    petStats.stage += 1;
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: 'Your pet has evolved!',
      message: `Your pet has reached stage ${petStats.stage}!`,
      priority: 1
    });
  }
}

setInterval(updatePetStats, 30000);

// Handle notification clicks
chrome.notifications.onClicked.addListener(() => {
  chrome.action.openPopup();
});
