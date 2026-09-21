const STORAGE_KEY = 'dnaqi_demo_profile_v1';
const DOCUMENT_DB = 'dnaqi_demo_documents_v1';
const DOCUMENT_STORE = 'documents';
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
let currentStep = 0;

const screens = {
  home: document.querySelector('#homeScreen'),
  setup: document.querySelector('#setupScreen'),
  theme: document.querySelector('#themeScreen'),
};

const themes = {
  junior: {
    title: 'DNAqi Junior',
    subtitle: 'Interfaccia dedicata: 4–10 anni',
    image: 'dnaqi_junior_home.jpg',
    areas: [
      ['Comunicazione', 10.5, 7.5, 30, 24],
      ['Apprendimento', 10.5, 35.5, 30, 24],
      ['Logica', 10.5, 63.5, 30, 24],
      ['Autonomia', 68, 7.5, 29, 24],
      ['Creatività', 68, 35.5, 29, 24],
      ['Movimento', 68, 63.5, 29, 24],
    ],
  },
};

function readProfile() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch (_) { return null; }
}

function isComplete(profile) {
  return Boolean(profile && profile.displayName && profile.birthYear &&
    profile.adultRole && profile.communication && profile.responseMode &&
    profile.visualLoad && profile.consentAccepted);
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
    if (label) label.textContent = complete ? 'Entra in DNAqi Junior' : 'Completa prima il Setup';
  });
}

function populateForm() {
  const profile = readProfile();
  if (!profile) return;
  const form = document.querySelector('#profileForm');
  form.elements.demoConsent.checked = Boolean(profile.consentAccepted);
  Object.entries(profile).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) return;
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = value ?? '';
  });
}

function openDocumentDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DOCUMENT_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DOCUMENT_STORE)) {
        db.createObjectStore(DOCUMENT_STORE, {keyPath: 'id', autoIncrement: true});
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getDocuments() {
  const db = await openDocumentDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(DOCUMENT_STORE, 'readonly').objectStore(DOCUMENT_STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storeDocument(file, type) {
  const db = await openDocumentDb();
  const record = {
    name: file.name,
    type,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    addedAt: new Date().toISOString(),
    file,
  };
  return new Promise((resolve, reject) => {
    const request = db.transaction(DOCUMENT_STORE, 'readwrite').objectStore(DOCUMENT_STORE).add(record);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeDocument(id) {
  const db = await openDocumentDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(DOCUMENT_STORE, 'readwrite').objectStore(DOCUMENT_STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function readableSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function renderDocuments() {
  const list = document.querySelector('#documentList');
  if (!list) return;
  try {
    const documents = await getDocuments();
    list.innerHTML = '';
    documents.forEach(documentRecord => {
      const item = document.createElement('li');
      item.className = 'document-item';
      const info = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = documentRecord.name;
      const meta = document.createElement('small');
      meta.textContent = `${documentRecord.type.replaceAll('-', ' ')} · ${readableSize(documentRecord.size)}`;
      info.append(name, meta);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-document';
      remove.textContent = 'Rimuovi';
      remove.addEventListener('click', async () => {
        await removeDocument(documentRecord.id);
        await renderDocuments();
      });
      item.append(info, remove);
      list.appendChild(item);
    });
    document.querySelector('#documentNote').textContent = documents.length
      ? `${documents.length} document${documents.length === 1 ? 'o' : 'i'} disponibile${documents.length === 1 ? '' : 'i'} solo su questo dispositivo.`
      : 'Nessun documento aggiunto alla demo.';
  } catch (_) {
    document.querySelector('#documentNote').textContent = 'Archivio locale non disponibile in questo browser.';
  }
}

function showFormStep(step) {
  currentStep = Math.max(0, Math.min(3, step));
  document.querySelectorAll('.form-step').forEach(section => {
    section.hidden = Number(section.dataset.step) !== currentStep;
  });
  document.querySelectorAll('[data-step-nav]').forEach(item => {
    const itemStep = Number(item.dataset.stepNav);
    item.classList.toggle('current', itemStep === currentStep);
    item.classList.toggle('completed', itemStep < currentStep);
  });
  document.querySelector('#previousStep').hidden = currentStep === 0;
  document.querySelector('#nextStep').hidden = currentStep === 3;
  document.querySelector('#saveProfile').hidden = currentStep !== 3;
  document.querySelector('#formMessage').textContent = '';
}

function validateCurrentStep() {
  const fields = document.querySelectorAll(`.form-step[data-step="${currentStep}"] input, .form-step[data-step="${currentStep}"] select`);
  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }
  return true;
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
  theme.areas.forEach(([label, x, y, width, height]) => {
    const button = document.createElement('button');
    button.className = 'hotspot';
    button.textContent = label;
    button.setAttribute('aria-label', `Apri ${label}`);
    button.style.left = `${x}%`;
    button.style.top = `${y}%`;
    button.style.width = `${width}%`;
    button.style.height = `${height}%`;
    button.addEventListener('click', () => alert(`${label}: collegamento modulo da configurare.`));
    holder.appendChild(button);
  });
  showScreen('theme');
}

document.addEventListener('click', event => {
  const go = event.target.closest('[data-go]');
  if (go) {
    const destination = go.dataset.go;
    if (destination === 'setup') {
      populateForm();
      showFormStep(0);
      renderDocuments();
    }
    if (destination === 'home') refreshHome();
    showScreen(destination);
    return;
  }
  const theme = event.target.closest('[data-theme]');
  if (theme) openTheme(theme.dataset.theme);
});

document.querySelector('#nextStep').addEventListener('click', () => {
  if (validateCurrentStep()) showFormStep(currentStep + 1);
});

document.querySelector('#previousStep').addEventListener('click', () => {
  showFormStep(currentStep - 1);
});

document.querySelector('#addDocuments').addEventListener('click', async () => {
  const input = document.querySelector('#documentFiles');
  const note = document.querySelector('#documentNote');
  const files = [...input.files];
  if (!files.length) {
    note.textContent = 'Scegli almeno un documento.';
    return;
  }
  const oversized = files.find(file => file.size > MAX_DOCUMENT_SIZE);
  if (oversized) {
    note.textContent = `${oversized.name} supera il limite dimostrativo di 10 MB.`;
    return;
  }
  const type = document.querySelector('#documentType').value;
  try {
    for (const file of files) await storeDocument(file, type);
    input.value = '';
    await renderDocuments();
  } catch (_) {
    note.textContent = 'Non è stato possibile conservare il documento su questo dispositivo.';
  }
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
  data.preferredTheme = 'junior';
  data.profileVersion = 1;
  data.createdAt = previous?.createdAt || new Date().toISOString();
  data.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  document.querySelector('#formMessage').textContent = 'Profilo salvato. DNAqi Junior è ora disponibile.';
  refreshHome();
  setTimeout(() => showScreen('home'), 700);
});

refreshHome();
