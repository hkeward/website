// Tarot spread functionality

let tarotData = null;
const drawnCards = new Set();

// Data loading

async function loadTarotData() {
  if (tarotData) return tarotData;

  const response = await fetch('/data/tarot.json');
  tarotData = await response.json();
  return tarotData;
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

// Slot initialization and management

function initializeSlots() {
  const template = document.getElementById('spread-slot-template');
  if (!template) {
    console.error('Slot template not found');
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

function fillSlot(slot, card) {
  const isReversed = card.reversed;
  const slotFilled = slot.querySelector('.slot-filled');

  slot.dataset.cardKey = card.key;

  // Card name and edit button
  const cardNameRow = slotFilled.querySelector('.card-name-row');
  slotFilled.querySelector('.card-name').textContent = card.card_name;

  const existingEditBtn = cardNameRow.querySelector('.edit-card-btn');
  if (existingEditBtn) existingEditBtn.remove();

  const editTemplate = document.getElementById('edit-card-icon');
  if (editTemplate) {
    cardNameRow.appendChild(editTemplate.content.cloneNode(true));
  }

  // Card image with animation
  const img = slotFilled.querySelector('.card-image');
  img.src = card.img;
  img.alt = card.card_name;
  img.classList.toggle('card-reversed', isReversed);

  img.classList.remove('drawing');
  void img.offsetWidth; // Force reflow to restart animation
  img.classList.add('drawing');

  // Keywords and description
  const keywords = isReversed ? card.keywords_reversed : card.keywords;
  const keywordsContainer = slotFilled.querySelector('.spread-keywords');
  keywordsContainer.innerHTML = '';
  keywords.forEach(keyword => {
    const badge = document.createElement('div');
    badge.className = 'keyword-badge';
    badge.textContent = keyword;
    keywordsContainer.appendChild(badge);
  });
  slotFilled.querySelector('.spread-description').innerHTML =
    isReversed ? card.description_reversed : card.description || '';

  // Element icons
  const elementsContainer = slotFilled.querySelector('.spread-elements');
  elementsContainer.innerHTML = '';
  if (card.elements?.length > 0) {
    card.elements.forEach(element => {
      const template = document.getElementById(`element-icon-${element}`);
      if (template) {
        const wrapper = document.createElement('span');
        wrapper.className = 'element-wrapper';
        wrapper.dataset.element = element.charAt(0).toUpperCase() + element.slice(1);
        wrapper.appendChild(template.content.cloneNode(true));
        elementsContainer.appendChild(wrapper);
      }
    });
  }

  // Show filled state
  slot.querySelector('.slot-empty').style.display = 'none';
  slotFilled.style.display = '';
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

// Card drawing

async function drawCard(slot) {
  const data = await loadTarotData();
  const card = getRandomCard(data);
  if (card) {
    fillSlot(slot, card);
  }
}

// Search view management

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

// Card list management

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

  // Populate card list
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

// Event handlers

async function handleDrawButton(slot) {
  hideSearchView(slot);
  await drawCard(slot);
}

function handleSearchButton(slot) {
  showSearchView(slot);
}

async function handleSuitButton(slot, suitButton) {
  const suit = suitButton.dataset.suit;
  if (!suit) return;

  // Toggle: if already active, collapse back to suit list
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

async function handleEditCardButton(slot) {
  const cardKey = slot.dataset.cardKey;
  const data = await loadTarotData();
  const suit = data[cardKey]?.suit;

  drawnCards.delete(cardKey);
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

function handleSearchBackButton(slot) {
  const suitList = slot.querySelector('.suit-list');
  if (suitList.classList.contains('collapsed')) {
    hideCardList(slot);
  } else {
    hideSearchView(slot);
  }
}

function handleResetButton() {
  hideAllSearchViews();
  resetSpread();
}

async function handleCardImageClick(slot) {
  const cardKey = slot.dataset.cardKey;
  if (!cardKey) return;

  const data = await loadTarotData();
  const card = data[cardKey];
  if (!card) return;

  const slotFilled = slot.querySelector('.slot-filled');
  const img = slotFilled.querySelector('.card-image');
  const isCurrentlyReversed = img.classList.contains('card-reversed');
  const willBeReversed = !isCurrentlyReversed;

  // Remove drawing class so transition (not animation) handles rotation
  img.classList.remove('drawing');

  // Temporarily hide overflow during rotation animation
  document.body.style.overflowX = 'hidden';
  setTimeout(() => {
    document.body.style.overflowX = '';
  }, 700);

  // Toggle reversed class
  img.classList.toggle('card-reversed');

  // Update keywords and description
  const keywords = willBeReversed ? card.keywords_reversed : card.keywords;
  const keywordsContainer = slotFilled.querySelector('.spread-keywords');
  keywordsContainer.innerHTML = '';
  keywords.forEach(keyword => {
    const badge = document.createElement('div');
    badge.className = 'keyword-badge';
    badge.textContent = keyword;
    keywordsContainer.appendChild(badge);
  });
  slotFilled.querySelector('.spread-description').innerHTML =
    willBeReversed ? card.description_reversed : card.description || '';
}

// Event delegation

document.addEventListener('DOMContentLoaded', initializeSlots);

document.addEventListener('click', async event => {
  const target = event.target;

  const drawButton = target.closest('.draw-card-button');
  if (drawButton) {
    const slot = drawButton.closest('.spread-card-slot');
    if (slot) await handleDrawButton(slot);
    return;
  }

  const searchButton = target.closest('.search-card-button');
  if (searchButton) {
    const slot = searchButton.closest('.spread-card-slot');
    if (slot) handleSearchButton(slot);
    return;
  }

  const searchBackButton = target.closest('.search-back-button');
  if (searchBackButton) {
    const slot = searchBackButton.closest('.spread-card-slot');
    if (slot) handleSearchBackButton(slot);
    return;
  }

  const searchDrawButton = target.closest('.search-draw-button');
  if (searchDrawButton) {
    const slot = searchDrawButton.closest('.spread-card-slot');
    if (slot) await handleDrawButton(slot);
    return;
  }

  const suitButton = target.closest('.suit-button');
  if (suitButton) {
    const slot = suitButton.closest('.spread-card-slot');
    if (slot) await handleSuitButton(slot, suitButton);
    return;
  }

  const cardListItem = target.closest('.card-list-item');
  if (cardListItem) {
    const slot = cardListItem.closest('.spread-card-slot');
    if (slot) await handleCardListItem(slot, cardListItem, event);
    return;
  }

  const editCardBtn = target.closest('.edit-card-btn');
  if (editCardBtn) {
    const slot = editCardBtn.closest('.spread-card-slot');
    if (slot) await handleEditCardButton(slot);
    return;
  }

  const cardImage = target.closest('.slot-filled .card-image');
  if (cardImage) {
    const slot = cardImage.closest('.spread-card-slot');
    if (slot) await handleCardImageClick(slot);
    return;
  }

  const resetButton = target.closest('.reset-spread-button');
  if (resetButton) {
    handleResetButton();
  }
});
