
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

function updatePetStats() {
  chrome.storage.sync.get(['petStats'], (result) => {
    let petStats = {
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

    checkEvolution(petStats);

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

function checkEvolution(petStats) {
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
