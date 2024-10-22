let petStats = {
  health: 100,
  hunger: 0,
  happiness: 100,
  energy: 100, 
  cleanliness: 100,
  coins: 0,
  stage: 1
};

let activeEffects = [];

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
      ...result.petStats
    };

    petStats = sanitizePetStats(petStats);

    updateStatsDisplay();
  });

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

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.petStats) {
    petStats = changes.petStats.newValue;
    updateStatsDisplay();
  }
});

function updateStatsDisplay() {
  document.getElementById('health').textContent = petStats.health;
  document.getElementById('hunger').textContent = petStats.hunger;
  document.getElementById('happiness').textContent = petStats.happiness;
  document.getElementById('energy').textContent = petStats.energy;
  document.getElementById('cleanliness').textContent = petStats.cleanliness;
  document.getElementById('coins').textContent = petStats.coins;
  updatePetImage();
}

function saveStats() {
  petStats = sanitizePetStats(petStats);
  chrome.storage.sync.set({ petStats }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving stats:', chrome.runtime.lastError);
    }
  });
}

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

function feedPet() {
  petStats.hunger = Math.max(0, petStats.hunger - 20);
  petStats.health = Math.min(100, petStats.health + 5);
  earnCoins(2);
  playSound('feed');
  saveStats();
  updateStatsDisplay();
}

function playWithPet() {
  petStats.happiness = Math.min(100, petStats.happiness + 20);
  petStats.hunger = Math.min(100, petStats.hunger + 10);
  earnCoins(5);
  playSound('play');
  saveStats();
  updateStatsDisplay();
}

function cleanPet() {
  petStats.cleanliness = Math.min(100, petStats.cleanliness + 10);
  petStats.happiness = Math.max(0, petStats.happiness - 5);
  earnCoins(3);
  playSound('clean');
  saveStats();
  updateStatsDisplay();
}

function putPetToSleep() {
  petStats.energy = Math.min(100, petStats.energy + 50);
  petStats.hunger = Math.min(100, petStats.hunger + 10);
  saveStats();
  updateStatsDisplay();
}

function givePetABath() {
  petStats.cleanliness = 100;
  petStats.happiness = Math.max(0, petStats.happiness - 5)
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

function openShop() {
  const item = prompt(
    'Buy an item:\n1. Toy (20 coins)\n2. Snack (10 coins)\n3. Energy Drink (15 coins)\n4. Soap (5 coins)'
  );
  if (item === '1' && petStats.coins >= 20) {
    addItemEffect('Toy', 5, 'happiness', 4);
    petStats.coins -= 20;
    alert('You bought a Toy!');
  } else if (item === '2' && petStats.coins >= 10) {
    addItemEffect('Snack', -5, 'hunger', 4);
    petStats.coins -= 10;
    alert('You bought a Snack!');
  } else if (item === '3' && petStats.coins >= 15) {
    addItemEffect('Energy Drink', 10, 'energy', 3);
    petStats.coins -= 15;
    alert('You bought an Energy Drink!');
  } else if (item === '4' && petStats.coins >= 5) {
    addItemEffect('Soap', 5, 'cleanliness', 2);
    petStats.coins -= 5;
    alert('You bought Soap!');
  } else {
    alert('Not enough coins or invalid choice.');
  }
  saveStats();
  updateStatsDisplay();
}

function applyEffect(effect, intervalId) {
  if (effect.remainingIntervals > 0) {
    petStats[effect.stat] = Math.max(
      0,
      Math.min(100, petStats[effect.stat] + effect.value)
    );
    effect.remainingIntervals--;
    saveStats();
    updateStatsDisplay();
  } else {
    clearInterval(intervalId);
    activeEffects = activeEffects.filter((e) => e !== effect);
  }
}

function addItemEffect(name, value, stat, intervals) {
  const effect = {
    name,
    value,
    stat,
    intervals,
    remainingIntervals: intervals,
  };

  activeEffects.push(effect);

  const intervalId = setInterval(() => {
    applyEffect(effect, intervalId);
  }, 5000);
}


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

    checkEvolution();

    chrome.storage.sync.set({ petStats });

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

chrome.notifications.onClicked.addListener(() => {
  chrome.action.openPopup();
});
