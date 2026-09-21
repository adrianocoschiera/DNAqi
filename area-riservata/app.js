const STORAGE_KEY = 'dnaqi_demo_profile_v1';
const CURRENT_YEAR = 2026;

const screens = {
  home: document.querySelector('#homeScreen'),
  setup: document.querySelector('#setupScreen'),
  theme: document.querySelector('#themeScreen'),
};

const themes = {
  junior: {
    title: 'DNAqi Junior',
    subtitle: 'Interfaccia consigliata: 4–10 anni',
    image: 'dnaqi_junior_1024x600.png',
  },
  next: {
    title: 'DNAqi Next',
    subtitle: 'Interfaccia consigliata: dagli 11 anni',
    image: 'dnaqi_next_1024x600.png',
  },
};

const moduleAreas = [
  ['Comunicazione', 31, 31],
  ['Apprendimento', 55, 31],
  ['Mente', 79, 31],
  ['Autonomia', 31, 76],
  ['Storie e creativita', 55, 76],
  ['Movimento', 79, 76],
];

function readProfile() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch (_) { return null; }
}

function isComplete(profile) {
  return Boolean(profile && profile.displayName && profile.birthYear &&
    profile.adultRole && profile.communication && profile.responseMode &&
    profile.visualLoad && profile.consentAccepted);
}

function suggestedTheme(profile) {
  const age = CURRENT_YEAR - Number(profile.birthYear);
  return age <= 10 ? 'junior' : 'next';
}

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function refreshHome() {
  const profile = readProfile();
  const complete = isComplete(profile);
  document.querySelector('#profileChip').textContent = complete
    ? `${profile.displayName} · Profilo attivo`
    : 'Profilo non configurato';
  document.querySelector('#setupStatus').textContent = complete
    ? 'Completato · Modifica'
    : 'Da completare';
  document.querySelectorAll('[data-theme]').forEach(card => {
    card.classList.toggle('locked', !complete);
    card.setAttribute('aria-disabled', String(!complete));
    const label = card.querySelector('.lock-label');
    if (label) label.textContent = complete
      ? (card.dataset.theme === suggestedTheme(profile) ? 'Tema consigliato' : 'Apri questo tema')
      : 'Completa prima il Setup';
  });
}

function populateForm() {
  const profile = readProfile();
  if (!profile) return;
  const form = document.querySelector('#profileForm');
  Object.entries(profile).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) return;
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = value ?? '';
  });
}

function openTheme(themeId) {
  const profile = readProfile();
  if (!isComplete(profile)) {
    showScreen('setup');
    document.querySelector('#formMessage').textContent = 'Completa il Setup per sbloccare le interfacce.';
    return;
  }
  const theme = themes[themeId];
  document.querySelector('#themeTitle').textContent = theme.title;
  document.querySelector('#themeSubtitle').textContent = theme.subtitle;
  document.querySelector('#themeImage').src = theme.image;
  const holder = document.querySelector('#hotspots');
  holder.innerHTML = '';
  moduleAreas.forEach(([label, x, y]) => {
    const button = document.createElement('button');
    button.className = 'hotspot';
    button.textContent = label;
    button.style.left = `${x}%`;
    button.style.top = `${y}%`;
    button.style.transform = 'translate(-50%,-50%)';
    button.addEventListener('click', () => alert(`${label}: collegamento modulo da configurare.`));
    holder.appendChild(button);
  });
  showScreen('theme');
}

document.addEventListener('click', event => {
  const go = event.target.closest('[data-go]');
  if (go) {
    const destination = go.dataset.go;
    if (destination === 'setup') populateForm();
    if (destination === 'home') refreshHome();
    showScreen(destination);
    return;
  }
  const theme = event.target.closest('[data-theme]');
  if (theme) openTheme(theme.dataset.theme);
});

document.querySelector('#profileForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form).entries());
  const previous = readProfile();
  delete data.demoConsent;
  data.birthYear = Number(data.birthYear);
  data.consentAccepted = form.elements.demoConsent.checked;
  data.profileId = previous?.profileId || `DNAQI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  data.preferredTheme = suggestedTheme(data);
  data.profileVersion = 1;
  data.createdAt = previous?.createdAt || new Date().toISOString();
  data.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  document.querySelector('#formMessage').textContent = `Profilo salvato. Tema suggerito: ${themes[suggestedTheme(data)].title}.`;
  refreshHome();
  setTimeout(() => showScreen('home'), 700);
});

refreshHome();
