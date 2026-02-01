// Tarot spread functionality for three-card.html

let tarotData = null;
const drawnCards = new Set();

async function loadTarotData() {
  if (tarotData) return tarotData;
  const response = await fetch('/data/tarot.json');
  tarotData = await response.json();
  return tarotData;
}

function initializeSlots() {
  const template = document.getElementById('spread-slot-template');
  if (!template) {
    console.error('Slot template not found!');
    return;
  }

  document.querySelectorAll('.spread-slot-placeholder').forEach(placeholder => {
    const label = placeholder.dataset.label || '';
    const clone = template.content.cloneNode(true);

    clone.querySelector('.slot-label').textContent = label;
    clone.querySelector('.spread-card-slot').dataset.label = label;
    clone.querySelector('.slot-filled').style.display = 'none';

    placeholder.replaceWith(clone);
  });
}

function getRandomCard(data) {
  const availableKeys = Object.keys(data).filter(key => !drawnCards.has(key));
  if (availableKeys.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableKeys.length);
  const key = availableKeys[randomIndex];
  drawnCards.add(key);

  return {
    key,
    reversed: Math.random() < 0.5,
    ...data[key]
  };
}

function fillSlot(slot, card) {
  const isReversed = card.reversed;
  const slotFilled = slot.querySelector('.slot-filled');

  slot.dataset.cardKey = card.key;
  slotFilled.querySelector('.card-name').textContent = card.card_name;
  slotFilled.querySelector('.orientation').textContent = isReversed ? 'Reversed' : 'Upright';

  // Add edit icon to card name row
  const cardNameRow = slotFilled.querySelector('.card-name-row');
  const existingEditBtn = cardNameRow.querySelector('.edit-card-btn');
  if (existingEditBtn) existingEditBtn.remove();
  const editTemplate = document.getElementById('edit-card-icon');
  if (editTemplate) {
    cardNameRow.appendChild(editTemplate.content.cloneNode(true));
  }

  const img = slotFilled.querySelector('.card-image');
  img.src = card.img;
  img.alt = card.card_name;
  img.classList.toggle('card-reversed', isReversed);

  // Force reflow to restart the drawing animation
  img.classList.remove('drawing');
  void img.offsetWidth;
  img.classList.add('drawing');

  const keywords = isReversed ? card.keywords_reversed : card.keywords;
  slotFilled.querySelector('.spread-keywords').textContent = keywords.join('; ');
  slotFilled.querySelector('.spread-description').innerHTML = isReversed ? card.description_reversed : card.description || '';

  const elementsContainer = slotFilled.querySelector('.spread-elements');
  elementsContainer.innerHTML = '';
  if (card.elements?.length > 0) {
    card.elements.forEach(element => {
      const template = document.getElementById(`element-icon-${element}`);
      if (template) {
        elementsContainer.appendChild(template.content.cloneNode(true));
      }
    });
  }

  slot.querySelector('.slot-empty').style.display = 'none';
  slotFilled.style.display = '';
}

async function drawCard(slot) {
  const data = await loadTarotData();
  const card = getRandomCard(data);
  if (card) {
    fillSlot(slot, card);
  }
}

function getPlacedCards() {
  const placed = new Map();
  document.querySelectorAll('.spread-card-slot').forEach(slot => {
    const cardKey = slot.dataset.cardKey;
    if (cardKey) {
      placed.set(cardKey, slot);
    }
  });
  return placed;
}

async function showCardList(slot, suit, highlightKey = null) {
  const data = await loadTarotData();
  const cardList = slot.querySelector('.card-list');
  const suitList = slot.querySelector('.suit-list');
  const placed = getPlacedCards();

  // Hide other suit buttons, keep active one visible
  slot.querySelectorAll('.suit-button').forEach(btn => {
    btn.classList.toggle('hidden', btn.dataset.suit !== suit);
  });
  suitList.classList.add('collapsed');

  // Populate card list with cards matching the selected suit
  cardList.innerHTML = '';
  Object.entries(data)
    .filter(([, cardData]) => cardData.suit === suit)
    .forEach(([key, cardData]) => {
      const item = document.createElement('div');
      item.className = 'card-list-item';
      item.dataset.cardKey = key;
      item.classList.toggle('placed', placed.has(key));
      item.classList.toggle('highlighted', key === highlightKey);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'card-list-name';
      nameSpan.textContent = cardData.card_name;
      item.appendChild(nameSpan);

      const reverseTemplate = document.getElementById('reverse-toggle-icon');
      if (reverseTemplate) {
        item.appendChild(reverseTemplate.content.cloneNode(true));
      }

      cardList.appendChild(item);
    });

  cardList.classList.add('expanded');
}

function hideCardList(slot) {
  slot.querySelector('.card-list').classList.remove('expanded');
  slot.querySelector('.suit-list').classList.remove('collapsed');

  slot.querySelectorAll('.suit-button').forEach(btn => {
    btn.classList.remove('hidden', 'active');
  });
}

function showSearchView(slot) {
  const defaultView = slot.querySelector('.card-action-default');
  const searchView = slot.querySelector('.card-action-search');
  if (defaultView) defaultView.style.display = 'none';
  if (searchView) searchView.style.display = '';
}

function hideSearchView(slot) {
  const defaultView = slot.querySelector('.card-action-default');
  const searchView = slot.querySelector('.card-action-search');
  if (defaultView) defaultView.style.display = '';
  if (searchView) searchView.style.display = 'none';
  hideCardList(slot);
}

function hideAllSearchViews() {
  document.querySelectorAll('.spread-card-slot').forEach(hideSearchView);
}

function clearSlot(slot) {
  delete slot.dataset.cardKey;
  slot.querySelector('.slot-empty').style.display = '';
  slot.querySelector('.slot-filled').style.display = 'none';

  const img = slot.querySelector('.card-image');
  img.classList.remove('card-reversed');
  img.src = '';
}

function resetSpread() {
  drawnCards.clear();
  document.querySelectorAll('.spread-card-slot').forEach(clearSlot);
}

async function handleDrawButton(slot) {
  hideSearchView(slot);
  await drawCard(slot);
}

function handleSearchButton(slot) {
  hideAllSearchViews();
  showSearchView(slot);
}

async function handleSuitButton(slot, suitButton) {
  const suit = suitButton.dataset.suit;
  if (!suit) return;

  // Toggle: if this button is already active, collapse back to suit list
  if (suitButton.classList.contains('active')) {
    hideCardList(slot);
    return;
  }

  slot.querySelectorAll('.suit-button').forEach(btn => btn.classList.remove('active'));
  suitButton.classList.add('active');
  await showCardList(slot, suit);
}

async function handleCardListItem(slot, cardListItem, event) {
  const selectedKey = cardListItem.dataset.cardKey;
  if (!selectedKey) return;

  const data = await loadTarotData();
  if (!data[selectedKey]) return;

  // If card is already placed elsewhere, clear that slot
  const placed = getPlacedCards();
  if (placed.has(selectedKey)) {
    const oldSlot = placed.get(selectedKey);
    if (oldSlot !== slot) {
      clearSlot(oldSlot);
    }
  }

  drawnCards.add(selectedKey);
  const isReversed = event.target.closest('.reverse-toggle') !== null;
  fillSlot(slot, {
    key: selectedKey,
    reversed: isReversed,
    ...data[selectedKey]
  });
}

document.addEventListener('DOMContentLoaded', initializeSlots);

document.addEventListener('click', async (event) => {
  const drawButton = event.target.closest('.draw-card-button');
  if (drawButton) {
    const slot = drawButton.closest('.spread-card-slot');
    if (slot) await handleDrawButton(slot);
    return;
  }

  const searchButton = event.target.closest('.search-card-button');
  if (searchButton) {
    const slot = searchButton.closest('.spread-card-slot');
    if (slot) handleSearchButton(slot);
    return;
  }

  const searchBackButton = event.target.closest('.search-back-button');
  if (searchBackButton) {
    const slot = searchBackButton.closest('.spread-card-slot');
    if (slot) {
      const suitList = slot.querySelector('.suit-list');
      if (suitList.classList.contains('collapsed')) {
        // In card list view - go back to suit selection
        hideCardList(slot);
      } else {
        // In suit selection - go back to draw menu
        hideSearchView(slot);
      }
    }
    return;
  }

  const searchDrawButton = event.target.closest('.search-draw-button');
  if (searchDrawButton) {
    const slot = searchDrawButton.closest('.spread-card-slot');
    if (slot) await handleDrawButton(slot);
    return;
  }

  const suitButton = event.target.closest('.suit-button');
  if (suitButton) {
    const slot = suitButton.closest('.spread-card-slot');
    if (slot) await handleSuitButton(slot, suitButton);
    return;
  }

  const cardListItem = event.target.closest('.card-list-item');
  if (cardListItem) {
    const slot = cardListItem.closest('.spread-card-slot');
    if (slot) await handleCardListItem(slot, cardListItem, event);
    return;
  }

  const editCardBtn = event.target.closest('.edit-card-btn');
  if (editCardBtn) {
    const slot = editCardBtn.closest('.spread-card-slot');
    if (slot) {
      const cardKey = slot.dataset.cardKey;
      const data = await loadTarotData();
      const suit = data[cardKey]?.suit;

      clearSlot(slot);
      hideAllSearchViews();
      showSearchView(slot);

      if (suit) {
        const suitButton = slot.querySelector(`.suit-button[data-suit="${suit}"]`);
        if (suitButton) {
          suitButton.classList.add('active');
          await showCardList(slot, suit, cardKey);
        }
      }
    }
    return;
  }

  const resetButton = event.target.closest('.reset-spread-button');
  if (resetButton) {
    hideAllSearchViews();
    resetSpread();
  }
});
