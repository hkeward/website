// targets three-card.html

let tarotData = null;
const drawnCards = new Set();
let activePickerSlot = null;

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
  const cardKeys = Object.keys(data).filter(key => !drawnCards.has(key));
  if (cardKeys.length === 0) return null;

  const index = Math.floor(Math.random() * cardKeys.length);
  const key = cardKeys[index];
  drawnCards.add(key);

  const reversed = Math.random() < 0.5;
  return {
    key,
    reversed,
    ...data[key]
  };
}

function fillSlot(slot, card) {
  const isReversed = card.reversed;
  const keywords = isReversed ? card.keywords_reversed : card.keywords;
  const description = isReversed ? card.description_reversed : card.description;
  const orientationLabel = isReversed ? 'Reversed' : 'Upright';

  slot.dataset.cardKey = card.key;
  slot.querySelector('.card-name').textContent = card.card_name;
  slot.querySelector('.orientation').textContent = orientationLabel;

  const img = slot.querySelector('.card-image');
  img.src = card.img;
  img.alt = card.card_name;
  if (isReversed) {
    img.classList.add('card-reversed');
  } else {
    img.classList.remove('card-reversed');
  }
  img.classList.remove('drawing');
  void img.offsetWidth;
  img.classList.add('drawing');

  slot.querySelector('.spread-keywords').textContent = keywords.join('; ');
  slot.querySelector('.spread-description').innerHTML = description || '';

  slot.querySelector('.slot-empty').style.display = 'none';
  slot.querySelector('.slot-filled').style.display = '';
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

async function populateCardPicker() {
  const data = await loadTarotData();
  const select = document.querySelector('.card-picker-select');

  select.innerHTML = '<option value="">-- Choose a card --</option>';

  Object.keys(data).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = data[key].card_name;
    select.appendChild(option);
  });
}

function updatePickerMarkers() {
  const select = document.querySelector('.card-picker-select');
  const placed = getPlacedCards();

  Array.from(select.options).forEach(option => {
    if (!option.value) return;
    const baseName = option.textContent.replace(/ \*$/, '');
    option.textContent = placed.has(option.value) ? baseName + ' *' : baseName;
  });
}

function showCardPicker(slot) {
  activePickerSlot = slot;
  const picker = document.querySelector('.card-picker-overlay');

  // Reset the form
  picker.querySelector('.card-picker-select').value = '';
  picker.querySelector('input[name="orientation"][value="upright"]').checked = true;

  updatePickerMarkers();
  picker.style.display = '';
}

function hideCardPicker() {
  const picker = document.querySelector('.card-picker-overlay');
  picker.style.display = 'none';
  activePickerSlot = null;
}

function clearSlot(slot) {
  delete slot.dataset.cardKey;
  slot.querySelector('.slot-empty').style.display = '';
  slot.querySelector('.slot-filled').style.display = 'none';
  const img = slot.querySelector('.card-image');
  img.classList.remove('card-reversed');
  img.src = '';
}

async function confirmCardPicker() {
  if (!activePickerSlot) return;

  const data = await loadTarotData();
  const picker = document.querySelector('.card-picker-overlay');
  const selectedKey = picker.querySelector('.card-picker-select').value;
  const isReversed = picker.querySelector('input[name="orientation"]:checked').value === 'reversed';

  if (selectedKey && data[selectedKey]) {
    // If card is already placed elsewhere, clear that slot
    const placed = getPlacedCards();
    if (placed.has(selectedKey)) {
      const oldSlot = placed.get(selectedKey);
      if (oldSlot !== activePickerSlot) {
        clearSlot(oldSlot);
      }
    }

    drawnCards.add(selectedKey);
    const card = {
      key: selectedKey,
      reversed: isReversed,
      ...data[selectedKey]
    };
    fillSlot(activePickerSlot, card);
  }

  hideCardPicker();
}

function resetSpread() {
  drawnCards.clear();
  document.querySelectorAll('.spread-card-slot').forEach(slot => {
    clearSlot(slot);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeSlots();
  populateCardPicker();
});

document.addEventListener('click', async (e) => {
  const drawButton = e.target.closest('.draw-card-button');
  if (drawButton) {
    hideCardPicker();
    const slot = drawButton.closest('.spread-card-slot');
    if (slot) {
      await drawCard(slot);
    }
  }

  const selectButton = e.target.closest('.select-card-button');
  if (selectButton) {
    const slot = selectButton.closest('.spread-card-slot');
    if (slot) {
      showCardPicker(slot);
    }
  }

  if (e.target.classList.contains('card-picker-confirm')) {
    await confirmCardPicker();
  }

  if (e.target.classList.contains('card-picker-cancel')) {
    hideCardPicker();
  }

  if (e.target.classList.contains('reset-spread-button')) {
    resetSpread();
  }
});
