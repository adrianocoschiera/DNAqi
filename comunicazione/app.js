const CONFIG_KEY = 'dnaqi_comunicazione_config_v1';

const activities = {
  'Voglio dire': {
    icon: '💬',
    description: 'Uso immagini, simboli o voce per esprimere un bisogno, una preferenza o un rifiuto.',
    options: ['Voglio…', 'Non voglio', 'Mi piace', 'Ho bisogno di aiuto']
  },
  'Parliamo insieme': {
    icon: '🤝',
    description: 'CUSTODE guida un breve scambio e poi invita a parlare con una persona reale.',
    options: ['Saluti', 'Il mio turno', 'Faccio una domanda', 'Racconto qualcosa']
  },
  'Capisco e scelgo': {
    icon: '👆',
    description: 'Scelgo fra alternative chiare e seguo piccole consegne, con il tempo necessario.',
    options: ['Scelgo fra 2', 'Sì oppure no', 'Trova la figura', 'Segui la consegna']
  },
  'Emozioni e situazioni': {
    icon: '😊',
    description: 'Riconosco una situazione, dico come mi sento e posso chiedere aiuto o una pausa.',
    options: ['Come mi sento', 'Cosa è successo?', 'Chiedo aiuto', 'Storia sociale']
  }
};

const activityDialog = document.querySelector('#activityDialog');
const adultDialog = document.querySelector('#adultDialog');
const toast = document.querySelector('#speechToast');
let selectedActivity = '';
let toastTimer;

function speak(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'it-IT';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function openActivity(name) {
  const item = activities[name];
  selectedActivity = name;
  document.querySelector('#dialogIcon').textContent = item.icon;
  document.querySelector('#dialogTitle').textContent = name;
  document.querySelector('#dialogDescription').textContent = item.description;
  const holder = document.querySelector('#demoOptions');
  holder.replaceChildren(...item.options.map((label, index) => {
    const button = document.createElement('button');
    button.textContent = label;
    if (index === 0) button.classList.add('selected');
    button.addEventListener('click', () => {
      holder.querySelectorAll('button').forEach(x => x.classList.remove('selected'));
      button.classList.add('selected');
      speak(label);
    });
    return button;
  }));
  activityDialog.showModal();
}

function loadConfig() {
  try {
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY));
    if (!config) return;
    document.querySelector('#childName').value = config.childName || '';
    document.querySelector('#choiceCount').value = config.choiceCount || '4';
    document.querySelector('#waitTime').value = config.waitTime || '8 secondi';
    document.querySelector('#supportMode').value = config.supportMode || 'Pittogrammi + voce';
    if (config.childName) document.querySelector('#welcomeText').textContent = `Ciao ${config.childName}! Cosa vuoi fare?`;
  } catch (_) { /* configurazione locale non valida: uso i valori demo */ }
}

document.querySelectorAll('.activity-card').forEach(button => button.addEventListener('click', () => openActivity(button.dataset.activity)));
document.querySelectorAll('[data-say]').forEach(button => button.addEventListener('click', () => speak(button.dataset.say)));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));

document.querySelector('#adultButton').addEventListener('click', () => adultDialog.showModal());
document.querySelector('#homeButton').addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('dnaqi:navigate', {detail: {target: 'home'}}));
  speak('Torno alla home');
});
document.querySelector('#startButton').addEventListener('click', () => {
  const choice = document.querySelector('#demoOptions .selected')?.textContent || selectedActivity;
  activityDialog.close();
  speak(`Iniziamo: ${choice}`);
  window.dispatchEvent(new CustomEvent('dnaqi:activity-start', {detail: {module: 'comunicazione', activity: selectedActivity, choice}}));
});
document.querySelector('#saveSettings').addEventListener('click', () => {
  const config = {
    childName: document.querySelector('#childName').value.trim(),
    choiceCount: document.querySelector('#choiceCount').value,
    waitTime: document.querySelector('#waitTime').value,
    supportMode: document.querySelector('#supportMode').value
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  document.querySelector('#welcomeText').textContent = config.childName ? `Ciao ${config.childName}! Cosa vuoi fare?` : 'Ciao! Cosa vuoi fare?';
  adultDialog.close();
  speak('Preferenze salvate');
});

loadConfig();
