const CORRECT_PASSWORD = '0303';
const STORAGE_KEY = 'leoCarlaMemories';
const MAX_STORAGE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB pro Datei

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

let selectedFiles = [];

class DataManager {
    static getData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (e) {
            console.error('Fehler beim Laden der Daten:', e);
            return this.getDefaultData();
        }
    }

    static getDefaultData() {
        return {
            text: `<h3>Willkommen zu unseren gemeinsamen Erinnerungen!</h3>
<p>Dies ist unser persönlicher Platz für unsere liebsten Momente.</p>`,
            media: [
                { type: 'image', data: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop', title: 'Erinnerung 1', size: 0 }
            ],
            notes: [
                { title: 'Unser erstes Treffen', content: 'Der Tag, an dem alles begann...' }
            ]
        };
    }

    static saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('❌ Speicher voll! Bitte löschen Sie einige Dateien.');
            } else {
                console.error('Fehler beim Speichern:', e);
            }
        }
    }

    static getStorageUsed() {
        const data = this.getData();
        let size = JSON.stringify(data).length;
        return size;
    }

    static getText() { return this.getData().text; }
    static setText(text) { const data = this.getData(); data.text = text; this.saveData(data); }
    static getMedia() { return this.getData().media; }
    static addMedia(item) { const data = this.getData(); data.media.push(item); this.saveData(data); }
    static deleteMedia(index) { const data = this.getData(); data.media.splice(index, 1); this.saveData(data); }
    static getNotes() { return this.getData().notes; }
    static addNote(title, content) { const data = this.getData(); data.notes.push({ title, content }); this.saveData(data); }
    static updateNote(index, title, content) { const data = this.getData(); data.notes[index] = { title, content }; this.saveData(data); }
    static deleteNote(index) { const data = this.getData(); data.notes.splice(index, 1); this.saveData(data); }
}

function updateStorageInfo() {
    const used = DataManager.getStorageUsed();
    const usedMB = (used / (1024 * 1024)).toFixed(1);
    const maxMB = (MAX_STORAGE / (1024 * 1024)).toFixed(0);
    storageInfo.textContent = `Speicher: ${usedMB}/${maxMB}MB`;
    
    if (used > MAX_STORAGE * 0.9) {
        storageInfo.style.color = '#e74c3c';
    } else if (used > MAX_STORAGE * 0.7) {
        storageInfo.style.color = '#f39c12';
    } else {
        storageInfo.style.color = '#7f8c8d';
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === CORRECT_PASSWORD) {
        loginScreen.style.display = 'none';
        mainContent.style.display = 'block';
        passwordInput.value = '';
        loadAllContent();
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

editTextBtn.addEventListener('click', () => {
    textInput.value = textDisplay.innerHTML.replace(/<br\/?>/g, '\n').replace(/<[^>]*>/g, '');
    textDisplay.style.display = 'none';
    textEditForm.style.display = 'block';
});

cancelTextBtn.addEventListener('click', () => {
    textEditForm.style.display = 'none';
    textDisplay.style.display = 'block';
});

textEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = textInput.value.trim();
    if (text) {
        const formatted = text.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('');
        textDisplay.innerHTML = formatted;
        DataManager.setText(formatted);
        textEditForm.style.display = 'none';
        textDisplay.style.display = 'block';
    }
});

function renderGallery() {
    const media = DataManager.getMedia();
    galleryContainer.innerHTML = '';
    media.forEach((item, index) => {
        const element = document.createElement('div');
        element.className = 'gallery-item';
        
        if (item.type === 'video') {
            element.innerHTML = `
                <video controls style="width:100%; height:150px; background:#000;">
                    <source src="${item.data}">
                </video>
                <div class="video-badge">🎥</div>
                <div class="image-info">
                    <p>${item.title}</p>
                    <button class="delete-media-btn" data-index="${index}" type="button">🗑️</button>
                </div>
            `;
        } else {
            element.innerHTML = `
                <img src="${item.data}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3C/svg%3E'">
                <div class="image-info">
                    <p>${item.title}</p>
                    <button class="delete-media-btn" data-index="${index}" type="button">🗑️</button>
                </div>
            `;
        }
        galleryContainer.appendChild(element);
    });

    document.querySelectorAll('.delete-media-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Löschen?')) {
                DataManager.deleteMedia(parseInt(btn.dataset.index));
                renderGallery();
                updateStorageInfo();
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
    selectedFiles = [];
    for (let file of e.target.files) {
        if (file.size > MAX_FILE_SIZE) {
            alert(`❌ ${file.name} ist zu groß (Max 5MB)`);
        } else {
            selectedFiles.push(file);
        }
    }
    displayPreviews();
});

function displayPreviews() {
    previewContainer.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            
            if (file.type.startsWith('video/')) {
                div.innerHTML = `
                    <video style="width:100%; height:100%; object-fit:cover;">
                        <source src="${e.target.result}">
                    </video>
                    <button class="remove-preview" data-index="${index}" type="button">✕</button>
                `;
            } else {
                div.innerHTML = `
                    <img src="${e.target.result}">
                    <button class="remove-preview" data-index="${index}" type="button">✕</button>
                `;
            }
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });

    setTimeout(() => {
        document.querySelectorAll('.remove-preview').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedFiles.splice(parseInt(btn.dataset.index), 1);
                displayPreviews();
            });
        });
    }, 100);
}

async function uploadMedia() {
    if (selectedFiles.length === 0) {
        alert('Keine Dateien ausgewählt!');
        return;
    }

    const stored = DataManager.getStorageUsed();
    if (stored > MAX_STORAGE * 0.9) {
        alert('❌ Speicher zu 90% voll! Bitte löschen Sie Dateien.');
        return;
    }

    uploadProgress.style.display = 'block';
    let uploaded = 0;

    for (const file of selectedFiles) {
        const reader = new FileReader();
        reader.onload = () => {
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            DataManager.addMedia({
                type: type,
                data: reader.result,
                title: file.name.replace(/\.[^/.]+$/, ''),
                size: file.size
            });
            
            uploaded++;
            const percent = Math.round((uploaded / selectedFiles.length) * 100);
            progressFill.style.width = percent + '%';
            progressText.textContent = `${percent}%`;

            if (uploaded === selectedFiles.length) {
                renderGallery();
                updateStorageInfo();
                uploadArea.style.display = 'none';
                selectedFiles = [];
                previewContainer.innerHTML = '';
                uploadProgress.style.display = 'none';
                alert(`✅ ${uploaded} Datei(en) hochgeladen!`);
            }
        };
        reader.readAsDataURL(file);
    }
}

uploadArea.querySelector('.upload-container').appendChild((() => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'save-button';
    btn.textContent = '✅ Hochladen';
    btn.style.width = '100%';
    btn.style.marginTop = '1rem';
    btn.addEventListener('click', uploadMedia);
    return btn;
})());

function renderNotes() {
    const notes = DataManager.getNotes();
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
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(btn.dataset.index);
            const note = notes[index];
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            noteForm.dataset.index = index;
            noteForm.style.display = 'block';
        });
    });

    document.querySelectorAll('.note-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Löschen?')) {
                DataManager.deleteNote(parseInt(btn.dataset.index));
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

noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    if (title && content) {
        if (noteForm.dataset.index !== undefined) {
            DataManager.updateNote(parseInt(noteForm.dataset.index), title, content);
        } else {
            DataManager.addNote(title, content);
        }
        renderNotes();
        noteForm.style.display = 'none';
    }
});

function loadAllContent() {
    textDisplay.innerHTML = DataManager.getText();
    renderGallery();
    renderNotes();
    updateStorageInfo();
}

window.addEventListener('load', () => {
    if (loginScreen.style.display !== 'none') {
        passwordInput.focus();
    }
});

console.log('💑 Leo & Carla - Mit Speicherschutz! ✨');
