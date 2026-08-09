const CORRECT_PASSWORD = '0303';
const STORAGE_KEY = 'leoCarlaMemories';

const loginScreen = document.getElementById('loginScreen');
const mainContent = document.getElementById('mainContent');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
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

const addNoteBtn = document.getElementById('addNoteBtn');
const notesContainer = document.getElementById('notesContainer');
const noteForm = document.getElementById('noteForm');
const noteTitleInput = document.getElementById('noteTitleInput');
const noteContentInput = document.getElementById('noteContentInput');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');

let selectedFiles = [];

class DataManager {
    static getData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : this.getDefaultData();
    }

    static getDefaultData() {
        return {
            text: `<h3>Willkommen zu unseren gemeinsamen Erinnerungen!</h3>
<p>Dies ist unser persönlicher Platz, an dem wir unsere liebsten Momente, gemeinsamen Abenteuer und wertvollen Erinnerungen festhalten können.</p>
<p>Hier können wir unsere Geschichte erzählen - die Momente, die uns verbinden, die Erlebnisse, die wir teilen, und die Liebe, die wir füreinander haben.</p>`,
            media: [
                { type: 'image', data: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop', title: 'Erinnerung 1' },
                { type: 'image', data: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop', title: 'Erinnerung 2' },
                { type: 'image', data: 'https://images.unsplash.com/photo-1495954484750-af469f1357be?w=500&h=500&fit=crop', title: 'Erinnerung 3' }
            ],
            notes: [
                { title: 'Unser erstes Treffen', content: 'Der Tag, an dem alles begann...' }
            ]
        };
    }

    static saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    static getText() { return this.getData().text; }
    static setText(text) { const data = this.getData(); data.text = text; this.saveData(data); }
    static getMedia() { return this.getData().media; }
    static addMedia(mediaItem) { const data = this.getData(); data.media.push(mediaItem); this.saveData(data); }
    static addMultipleMedia(mediaItems) { const data = this.getData(); data.media.push(...mediaItems); this.saveData(data); }
    static deleteMedia(index) { const data = this.getData(); data.media.splice(index, 1); this.saveData(data); }
    static getNotes() { return this.getData().notes; }
    static addNote(title, content) { const data = this.getData(); data.notes.push({ title, content }); this.saveData(data); }
    static updateNote(index, title, content) { const data = this.getData(); data.notes[index] = { title, content }; this.saveData(data); }
    static deleteNote(index) { const data = this.getData(); data.notes.splice(index, 1); this.saveData(data); }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === CORRECT_PASSWORD) {
        loginError.textContent = '';
        loginScreen.style.display = 'none';
        mainContent.style.display = 'block';
        passwordInput.value = '';
        loadAllContent();
    } else {
        loginError.textContent = '❌ Falsches Passwort. Bitte versuchen Sie es erneut.';
        passwordInput.value = '';
        passwordInput.focus();
    }
});

logoutBtn.addEventListener('click', () => {
    if (confirm('Möchten Sie sich wirklich abmelden?')) {
        loginScreen.style.display = 'flex';
        mainContent.style.display = 'none';
        passwordInput.value = '';
        passwordInput.focus();
    }
});

editTextBtn.addEventListener('click', () => {
    const textContent = textDisplay.innerHTML;
    textInput.value = textContent.replace(/<br\/?>/g, '\n').replace(/<[^>]*>/g, '');
    textDisplay.style.display = 'none';
    textEditForm.style.display = 'block';
    textInput.focus();
});

cancelTextBtn.addEventListener('click', () => {
    textEditForm.style.display = 'none';
    textDisplay.style.display = 'block';
});

textEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = textInput.value;
    if (text.trim()) {
        const formattedText = text.split('\n').filter(line => line.trim()).map(line => `<p>${line}</p>`).join('');
        textDisplay.innerHTML = formattedText;
        DataManager.setText(formattedText);
        textEditForm.style.display = 'none';
        textDisplay.style.display = 'block';
    } else {
        alert('Bitte geben Sie einen Text ein.');
    }
});

function isVideoFile(file) {
    return file.type.startsWith('video/');
}

function isImageFile(file) {
    return file.type.startsWith('image/');
}

function renderGallery() {
    const mediaItems = DataManager.getMedia();
    galleryContainer.innerHTML = '';
    
    mediaItems.forEach((media, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        if (media.type === 'video') {
            item.innerHTML = `
                <video controls style="width: 100%; height: 180px; object-fit: cover; background: #000;">
                    <source src="${media.data}" type="video/mp4">
                    Ihr Browser unterstützt das Video-Tag nicht.
                </video>
                <div class="video-badge">🎥 VIDEO</div>
                <div class="image-info">
                    <p>${media.title}</p>
                    <button class="delete-media-btn" data-index="${index}" type="button">🗑️</button>
                </div>
            `;
        } else {
            item.innerHTML = `
                <img src="${media.data}" alt="${media.title}" onerror="this.src='https://via.placeholder.com/500?text=Fehler'">
                <div class="image-info">
                    <p>${media.title}</p>
                    <button class="delete-media-btn" data-index="${index}" type="button">🗑️</button>
                </div>
            `;
        }
        
        galleryContainer.appendChild(item);
    });
    
    document.querySelectorAll('.delete-media-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Dieses Element wirklich löschen?')) {
                DataManager.deleteMedia(parseInt(btn.dataset.index));
                renderGallery();
            }
        });
    });
}

addMediaBtn.addEventListener('click', () => {
    uploadArea.style.display = 'block';
    selectedFiles = [];
    previewContainer.innerHTML = '';
    progressFill.style.width = '0%';
});

selectFilesBtn.addEventListener('click', () => {
    mediaFileInput.click();
});

cancelUploadBtn.addEventListener('click', () => {
    uploadArea.style.display = 'none';
    mediaFileInput.value = '';
    selectedFiles = [];
    previewContainer.innerHTML = '';
    progressFill.style.width = '0%';
    uploadProgress.style.display = 'none';
});

mediaFileInput.addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    displayPreviews();
});

function displayPreviews() {
    previewContainer.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            
            if (isVideoFile(file)) {
                div.innerHTML = `
                    <video style="width: 100%; height: 100%; object-fit: cover;">
                        <source src="${e.target.result}" type="${file.type}">
                    </video>
                    <div class="preview-video-badge">🎥</div>
                    <div class="preview-play">▶</div>
                    <button class="remove-preview" type="button" data-index="${index}">✕</button>
                `;
            } else {
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-preview" type="button" data-index="${index}">✕</button>
                `;
            }
            
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });

    setTimeout(() => {
        document.querySelectorAll('.remove-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.dataset.index);
                selectedFiles.splice(index, 1);
                displayPreviews();
            });
        });
    }, 100);
}

async function uploadMedia() {
    if (selectedFiles.length === 0) {
        alert('Bitte wählen Sie mindestens ein Bild oder Video aus.');
        return;
    }

    uploadProgress.style.display = 'block';
    const mediaToAdd = [];
    let uploaded = 0;

    for (const file of selectedFiles) {
        const reader = new FileReader();
        reader.onload = () => {
            const mediaType = isVideoFile(file) ? 'video' : 'image';
            mediaToAdd.push({
                type: mediaType,
                data: reader.result,
                title: file.name.replace(/\.[^/.]+$/, '')
            });
            uploaded++;
            const percent = Math.round((uploaded / selectedFiles.length) * 100);
            progressFill.style.width = percent + '%';
            progressText.textContent = `Laden... ${percent}%`;

            if (uploaded === selectedFiles.length) {
                DataManager.addMultipleMedia(mediaToAdd);
                renderGallery();
                uploadArea.style.display = 'none';
                mediaFileInput.value = '';
                selectedFiles = [];
                previewContainer.innerHTML = '';
                progressFill.style.width = '0%';
                uploadProgress.style.display = 'none';
                const imageCount = mediaToAdd.filter(m => m.type === 'image').length;
                const videoCount = mediaToAdd.filter(m => m.type === 'video').length;
                let msg = '✅ Erfolgreich hochgeladen: ';
                if (imageCount > 0) msg += `${imageCount} Bild(er) `;
                if (videoCount > 0) msg += `${videoCount} Video(s)`;
                alert(msg);
            }
        };
        reader.readAsDataURL(file);
    }
}

previewContainer.addEventListener('dblclick', (e) => {
    if (selectedFiles.length > 0) {
        uploadMedia();
    }
});

const uploadButton = document.createElement('button');
uploadButton.type = 'button';
uploadButton.className = 'save-button';
uploadButton.textContent = '✅ Bilder & Videos hochladen';
uploadButton.style.width = '100%';
uploadButton.style.marginTop = '1rem';
uploadButton.addEventListener('click', uploadMedia);

const uploadButtonClone = uploadButton.cloneNode(true);
uploadButtonClone.addEventListener('click', uploadMedia);
uploadArea.querySelector('.upload-container').appendChild(uploadButtonClone);

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
            noteForm.dataset.editingIndex = index;
            noteForm.style.display = 'block';
            noteTitleInput.focus();
        });
    });

    document.querySelectorAll('.note-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Diesen Moment wirklich löschen?')) {
                DataManager.deleteNote(parseInt(btn.dataset.index));
                renderNotes();
            }
        });
    });
}

addNoteBtn.addEventListener('click', () => {
    noteTitleInput.value = '';
    noteContentInput.value = '';
    delete noteForm.dataset.editingIndex;
    noteForm.style.display = 'block';
    noteTitleInput.focus();
});

cancelNoteBtn.addEventListener('click', () => {
    noteForm.style.display = 'none';
    delete noteForm.dataset.editingIndex;
});

noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    if (title && content) {
        const editingIndex = noteForm.dataset.editingIndex;
        if (editingIndex !== undefined) {
            DataManager.updateNote(parseInt(editingIndex), title, content);
        } else {
            DataManager.addNote(title, content);
        }
        renderNotes();
        noteForm.style.display = 'none';
        noteTitleInput.value = '';
        noteContentInput.value = '';
        delete noteForm.dataset.editingIndex;
    } else {
        alert('Bitte füllen Sie alle Felder aus.');
    }
});

function loadAllContent() {
    const text = DataManager.getText();
    textDisplay.innerHTML = text;
    renderGallery();
    renderNotes();
}

window.addEventListener('load', () => {
    if (loginScreen.style.display !== 'none') {
        passwordInput.focus();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (textEditForm.style.display === 'block') cancelTextBtn.click();
        if (uploadArea.style.display === 'block') cancelUploadBtn.click();
        if (noteForm.style.display === 'block') cancelNoteBtn.click();
    }
});

console.log('💑 Leo & Carla - Unsere Erinnerungen mit Videos! 🎬✨');
