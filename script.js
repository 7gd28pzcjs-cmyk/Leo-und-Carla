const CORRECT_PASSWORD = '0303';
const DB_NAME = 'LeoCarlaDB';
const DB_VERSION = 1;

let db;
let currentMediaIndex = 0;
let allMedia = [];

// IndexedDB Initialisierung
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('media')) {
                db.createObjectStore('media', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('metadata')) {
                db.createObjectStore('metadata', { keyPath: 'key' });
            }
        };
    });
}

class DataManager {
    static async setText(text) {
        const tx = db.transaction('metadata', 'readwrite');
        tx.objectStore('metadata').put({ key: 'text', value: text });
        return new Promise((r) => tx.oncomplete = r);
    }

    static async getText() {
        const tx = db.transaction('metadata', 'readonly');
        const result = await new Promise((r) => {
            const req = tx.objectStore('metadata').get('text');
            req.onsuccess = () => r(req.result);
        });
        return result?.value || '<h3>Willkommen!</h3><p>Unsere gemeinsamen Erinnerungen...</p>';
    }

    static async addMedia(item) {
        const tx = db.transaction('media', 'readwrite');
        return new Promise((r) => {
            tx.objectStore('media').add(item);
            tx.oncomplete = r;
        });
    }

    static async getMedia() {
        const tx = db.transaction('media', 'readonly');
        return new Promise((r) => {
            const req = tx.objectStore('media').getAll();
            req.onsuccess = () => r(req.result);
        });
    }

    static async deleteMedia(id) {
        const tx = db.transaction('media', 'readwrite');
        return new Promise((r) => {
            tx.objectStore('media').delete(id);
            tx.oncomplete = r;
        });
    }

    static async setNotes(notes) {
        const tx = db.transaction('metadata', 'readwrite');
        tx.objectStore('metadata').put({ key: 'notes', value: notes });
        return new Promise((r) => tx.oncomplete = r);
    }

    static async getNotes() {
        const tx = db.transaction('metadata', 'readonly');
        const result = await new Promise((r) => {
            const req = tx.objectStore('metadata').get('notes');
            req.onsuccess = () => r(req.result);
        });
        return result?.value || [{ title: 'Unser erstes Treffen', content: 'Der Tag, an dem alles begann...' }];
    }
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginScreen = document.getElementById('loginScreen');
const mainContent = document.getElementById('mainContent');
const logoutBtn = document.getElementById('logoutBtn');

const editTextBtn = document.getElementById('editTextBtn');
const textDisplay = document.getElementById('textDisplay');
const textEditForm = document.getElementById('textEditForm');
const textInput = document.getElementById('textInput');
const cancelTextBtn = document.getElementById('cancelTextBtn');

const addMediaBtn = document.getElementById('addMediaBtn');
const galleryContainer = document.getElementById('galleryContainer');
const uploadArea = document.getElementById('uploadArea');
const mediaFileInput = document.getElementById('mediaFileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const cancelUploadBtn = document.getElementById('cancelUploadBtn');
const previewContainer = document.getElementById('previewContainer');
const uploadProgress = document.getElementById('uploadProgress');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const storageInfo = document.getElementById('storageInfo');

const addNoteBtn = document.getElementById('addNoteBtn');
const notesContainer = document.getElementById('notesContainer');
const noteForm = document.getElementById('noteForm');
const noteTitleInput = document.getElementById('noteTitleInput');
const noteContentInput = document.getElementById('noteContentInput');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');

// Lightbox Elements
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
const closeLightbox = document.getElementById('closeLightbox');
const prevMedia = document.getElementById('prevMedia');
const nextMedia = document.getElementById('nextMedia');
const currentIndex = document.getElementById('currentIndex');
const totalCount = document.getElementById('totalCount');

let selectedFiles = [];
let touchStartX = 0;
let touchEndX = 0;

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (passwordInput.value === CORRECT_PASSWORD) {
        loginScreen.style.display = 'none';
        mainContent.style.display = 'block';
        passwordInput.value = '';
        await loadAllContent();
    } else {
        document.getElementById('loginError').textContent = '❌ Falsches Passwort!';
        passwordInput.value = '';
    }
});

logoutBtn.addEventListener('click', () => {
    if (confirm('Abmelden?')) {
        loginScreen.style.display = 'flex';
        mainContent.style.display = 'none';
    }
});

// Text Management
editTextBtn.addEventListener('click', async () => {
    const text = await DataManager.getText();
    textInput.value = text.replace(/<br\/?>/g, '\n').replace(/<[^>]*>/g, '');
    textDisplay.style.display = 'none';
    textEditForm.style.display = 'block';
});

cancelTextBtn.addEventListener('click', () => {
    textEditForm.style.display = 'none';
    textDisplay.style.display = 'block';
});

textEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = textInput.value.trim();
    if (text) {
        const formatted = text.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('');
        textDisplay.innerHTML = formatted;
        await DataManager.setText(formatted);
        textEditForm.style.display = 'none';
        textDisplay.style.display = 'block';
    }
});

// Lightbox Functions
function openLightbox(index) {
    currentMediaIndex = index;
    displayLightboxMedia();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightboxHandler() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function displayLightboxMedia() {
    const media = allMedia[currentMediaIndex];
    if (!media) return;

    lightboxContent.innerHTML = '';
    const url = URL.createObjectURL(media.blob);

    if (media.type === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '100%';
        video.style.objectFit = 'contain';
        const source = document.createElement('source');
        source.src = url;
        source.type = media.blob.type;
        video.appendChild(source);
        lightboxContent.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        lightboxContent.appendChild(img);
    }

    currentIndex.textContent = currentMediaIndex + 1;
    totalCount.textContent = allMedia.length;
}

function nextMediaHandler() {
    currentMediaIndex = (currentMediaIndex + 1) % allMedia.length;
    displayLightboxMedia();
}

function prevMediaHandler() {
    currentMediaIndex = (currentMediaIndex - 1 + allMedia.length) % allMedia.length;
    displayLightboxMedia();
}

closeLightbox.addEventListener('click', closeLightboxHandler);
nextMedia.addEventListener('click', nextMediaHandler);
prevMedia.addEventListener('click', prevMediaHandler);

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'ArrowRight') nextMediaHandler();
        if (e.key === 'ArrowLeft') prevMediaHandler();
        if (e.key === 'Escape') closeLightboxHandler();
    }
});

// Touch Swipe für Mobile
lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextMediaHandler();
        } else {
            prevMediaHandler();
        }
    }
}

// Gallery
async function renderGallery() {
    allMedia = await DataManager.getMedia();
    galleryContainer.innerHTML = '';
    storageInfo.textContent = `📦 Geladen: ${allMedia.length}`;
    
    allMedia.forEach((item, index) => {
        const element = document.createElement('div');
        element.className = 'gallery-item';
        element.style.cursor = 'pointer';
        
        const url = URL.createObjectURL(item.blob);
        
        if (item.type === 'video') {
            element.innerHTML = `
                <video style="width:100%; height:150px; background:#000;">
                    <source src="${url}">
                </video>
                <div class="video-badge">🎥</div>
                <div class="image-info">
                    <p class="image-title">Video ${index + 1}</p>
                    <button class="delete-media-btn" data-id="${item.id}" type="button">🗑️</button>
                </div>
            `;
        } else {
            element.innerHTML = `
                <img src="${url}" style="width:100%; height:150px; object-fit:cover;">
                <div class="image-info">
                    <p class="image-title">Bild ${index + 1}</p>
                    <button class="delete-media-btn" data-id="${item.id}" type="button">🗑️</button>
                </div>
            `;
        }

        // Click to open lightbox
        element.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-media-btn')) {
                openLightbox(index);
            }
        });

        galleryContainer.appendChild(element);
    });

    document.querySelectorAll('.delete-media-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Löschen?')) {
                await DataManager.deleteMedia(parseInt(btn.dataset.id));
                renderGallery();
            }
        });
    });
}

addMediaBtn.addEventListener('click', () => {
    uploadArea.style.display = 'block';
    selectedFiles = [];
    previewContainer.innerHTML = '';
});

selectFilesBtn.addEventListener('click', () => mediaFileInput.click());

cancelUploadBtn.addEventListener('click', () => {
    uploadArea.style.display = 'none';
    selectedFiles = [];
    previewContainer.innerHTML = '';
});

mediaFileInput.addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    displayPreviews();
});

function displayPreviews() {
    previewContainer.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        
        const url = URL.createObjectURL(file);
        
        if (file.type.startsWith('video/')) {
            div.innerHTML = `
                <video style="width:100%; height:100%; object-fit:cover;">
                    <source src="${url}">
                </video>
                <button class="remove-preview" data-index="${index}" type="button">✕</button>
            `;
        } else {
            div.innerHTML = `
                <img src="${url}">
                <button class="remove-preview" data-index="${index}" type="button">✕</button>
            `;
        }
        previewContainer.appendChild(div);
    });

    document.querySelectorAll('.remove-preview').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedFiles.splice(parseInt(btn.dataset.index), 1);
            displayPreviews();
        });
    });
}

async function uploadMedia() {
    if (selectedFiles.length === 0) {
        alert('Keine Dateien ausgewählt!');
        return;
    }

    uploadProgress.style.display = 'block';
    let uploaded = 0;

    for (const file of selectedFiles) {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        
        await DataManager.addMedia({
            type: type,
            blob: file,
            title: file.name.replace(/\.[^/.]+$/, '')
        });
        
        uploaded++;
        const percent = Math.round((uploaded / selectedFiles.length) * 100);
        progressFill.style.width = percent + '%';
        progressText.textContent = `${percent}%`;
    }

    renderGallery();
    uploadArea.style.display = 'none';
    selectedFiles = [];
    previewContainer.innerHTML = '';
    uploadProgress.style.display = 'none';
    alert(`✅ ${uploaded} Datei(en) hochgeladen!`);
}

const uploadBtn = document.createElement('button');
uploadBtn.type = 'button';
uploadBtn.className = 'save-button';
uploadBtn.textContent = '✅ Hochladen';
uploadBtn.style.width = '100%';
uploadBtn.style.marginTop = '1rem';
uploadBtn.addEventListener('click', uploadMedia);
uploadArea.querySelector('.upload-container').appendChild(uploadBtn);

// Notes
async function renderNotes() {
    const notes = await DataManager.getNotes();
    notesContainer.innerHTML = '';
    
    notes.forEach((note, index) => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <h4>${note.title}</h4>
            <p>${note.content}</p>
            <div class="note-actions">
                <button class="note-edit-btn" data-index="${index}" type="button">✏️</button>
                <button class="note-delete-btn" data-index="${index}" type="button">🗑️</button>
            </div>
        `;
        notesContainer.appendChild(card);
    });

    document.querySelectorAll('.note-edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const notes = await DataManager.getNotes();
            const index = parseInt(btn.dataset.index);
            noteTitleInput.value = notes[index].title;
            noteContentInput.value = notes[index].content;
            noteForm.dataset.index = index;
            noteForm.style.display = 'block';
        });
    });

    document.querySelectorAll('.note-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const notes = await DataManager.getNotes();
            const index = parseInt(btn.dataset.index);
            if (confirm('Löschen?')) {
                notes.splice(index, 1);
                await DataManager.setNotes(notes);
                renderNotes();
            }
        });
    });
}

addNoteBtn.addEventListener('click', () => {
    noteTitleInput.value = '';
    noteContentInput.value = '';
    delete noteForm.dataset.index;
    noteForm.style.display = 'block';
});

cancelNoteBtn.addEventListener('click', () => {
    noteForm.style.display = 'none';
});

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    if (title && content) {
        const notes = await DataManager.getNotes();
        if (noteForm.dataset.index !== undefined) {
            notes[parseInt(noteForm.dataset.index)] = { title, content };
        } else {
            notes.push({ title, content });
        }
        await DataManager.setNotes(notes);
        renderNotes();
        noteForm.style.display = 'none';
    }
});

// Init
async function loadAllContent() {
    textDisplay.innerHTML = await DataManager.getText();
    renderGallery();
    renderNotes();
}

window.addEventListener('load', async () => {
    await initDB();
    if (loginScreen.style.display !== 'none') {
        passwordInput.focus();
    }
});

console.log('💑 Leo & Carla mit Lightbox & Swipe! 🚀');
