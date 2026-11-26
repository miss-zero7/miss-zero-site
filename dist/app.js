'use strict';
const avatars = [{"id": "1703", "traits": {"Hair": "Ivory Bob", "Face": "Soft Smile", "Shirt": "Cherry Signal", "Tattoo": "None", "Background": "Stargate", "Hand": "Finger Heart"}}, {"id": "1132", "traits": {"Hair": "Pigtails", "Face": "Wink", "Shirt": "I Need Money", "Tattoo": "Lightning", "Background": "Gray", "Hand": "Cash Stack"}}, {"id": "3201", "traits": {"Hair": "Black Bob", "Face": "Soft Smile", "Shirt": "More Self Love", "Tattoo": "Barbed Wire", "Background": "Photobooth", "Hand": "Flip Phone"}}, {"id": "0484", "traits": {"Hair": "Pigtails", "Face": "Wink", "Shirt": "Player Two", "Tattoo": "Lightning", "Background": "Orbit", "Hand": "Heart Lollipop"}}, {"id": "2999", "traits": {"Hair": "Short Curls", "Face": "Surprised", "Shirt": "Out of Range", "Tattoo": "Butterflies", "Background": "Manga Dots", "Hand": "Molly Bag"}}, {"id": "0254", "traits": {"Hair": "Ivory Bob", "Face": "Grin", "Shirt": "More Self Love", "Tattoo": "None", "Background": "Stargate", "Hand": "Founder Plush"}}];
const dialog = document.querySelector('.avatar-dialog');
const portrait = document.querySelector('#portrait');
const name = document.querySelector('#nft-name');
const traits = document.querySelector('#traits');
const download = document.querySelector('#download');
let selectedIndex = 0;

function showAvatar(index) {
  selectedIndex = (index + avatars.length) % avatars.length;
  const avatar = avatars[selectedIndex];
  const label = `MISS ZERO #${avatar.id}`;
  portrait.src = `assets/${avatar.id}.webp`;
  portrait.alt = label;
  name.textContent = label;
  download.href = portrait.src;
  download.download = `miss-zero-${avatar.id}.webp`;

  traits.replaceChildren();
  for (const [trait, value] of Object.entries(avatar.traits)) {
    const term = document.createElement('dt');
    term.textContent = trait;
    const description = document.createElement('dd');
    description.textContent = value;
    traits.append(term, description);
  }
}

function openAvatar(index) {
  showAvatar(index);
  dialog.showModal();
}

for (const card of document.querySelectorAll('.print')) {
  const index = avatars.findIndex(avatar => avatar.id === card.dataset.id);
  card.addEventListener('click', () => openAvatar(index));
}

document.querySelector('#pick').addEventListener('click', () => openAvatar(selectedIndex));
document.querySelector('.close').addEventListener('click', () => dialog.close());
document.querySelector('#previous').addEventListener('click', () => showAvatar(selectedIndex - 1));
document.querySelector('#next').addEventListener('click', () => showAvatar(selectedIndex + 1));
