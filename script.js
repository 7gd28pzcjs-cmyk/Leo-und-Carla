// ========================================
// CONFIGURATION & CONSTANTS
// ========================================
const CORRECT_PASSWORD = '0303';
const STORAGE_KEY = 'privateWebsiteData';

// ========================================
// DOM ELEMENTS
// ========================================
const loginScreen = document.getElementById('loginScreen');
const mainContent = document.getElementById('mainContent');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Text section elements
const editTextBtn = document.getElementById('editTextBtn');
const textDisplay = document.getElementById('textDisplay');
const textEditForm = document.getElementById('textEditForm');
const textInput = document.getElementById('textInput');
const cancelTextBtn = document.getElementById('cancelTextBtn');

// Image section elements
const addImageBtn = document.getElementById('addImageBtn');
const gallery = document.querySelector('.gallery');
const imageUploadForm = document.getElementById('imageUploadForm');
const imageUrlInput = document.getElementById('imageUrlInput');
const imageTitleInput = document.getElementById('imageTitleInput');
const cancelImageBtn = document.getElementById('cancelImageBtn');

// Notes section elements
const addNoteBtn = document.getElementById('addNoteBtn');
const notesContainer = document.getElementById('notesContainer');
const noteForm = document.getElementById('noteForm');
const noteTitleInput = document.getElementById('noteTitleInput');
const noteContentInput = document.getElementById('noteContentInput');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');

// ========================================
// DATA MANAGEMENT
// ========================================
class DataManager {
    static getData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : this.getDefaultData();
    }

    static getDefaultData() {
        return {
            text: `<h3>Willkommen auf meiner privaten Seite!</h3>
<p>Dies ist mein persönlicher Bereich, in dem ich meine Gedanken, Ideen und Erinnerungen festhalten kann. Hier können alle meine liebsten Momente, Inspirationen und wichtigen Notizen gespeichert werden.</p>
<p>Die Seite ist vollständig passwortgeschützt und nur für mich zugänglich. Ich kann hier frei meine Texte schreiben, bearbeiten und personalisieren, wie es mir gefällt.</p>`,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
                    title: 'Berglandschaft'
                },
                {
                    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop',
                    title: 'Sonnenuntergang'
                },
                {
                    url: 'https://images.unsplash.com/photo-1495954484750-af469f1357be?w=500&h=500&fit=crop',
                    title: 'Naturszene'
                }
            ],
            notes: [
                {
                    title: 'Beispiel-Notiz',
                    content: 'Dies ist eine Beispiel-Notiz. Sie können Notizen hinzufügen, bearbeiten und löschen.'
                }
            ]
        };
    }

    static saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    static getText() {
        return this.getData().text;
    }

    static setText(text) {
        const data = this.getData();
        data.text = text;
        this.saveData(data);
    }

    static getImages() {
        return this.getData().images;
    }

    static addImage(url, title) {
        const data = this.getData();
        data.images.push({ url, title });
        this.saveData(data);
    }

    static deleteImage(index) {
        const data = this.getData();
        data.images.splice(index, 1);
        this.saveData(data);
    }

    static getNotes() {
        return this.getData().notes;
    }

    static addNote(title, content) {
        const data = this.getData();
        data.notes.push({ title, content });
        this.saveData(data);
    }

    static updateNote(index, title, content) {
        const data = this.getData();
        data.notes[index] = { title, content };
        this.saveData(data);
    }

    static deleteNote(index) {
        const data = this.getData();
        data.notes.splice(index, 1);
        this.saveData(data);
    }
}

// ========================================
// LOGIN FUNCTIONALITY
// ========================================
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const password = passwordInput.value;
    
    if (password === CORRECT_PASSWORD) {
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

// ========================================
// TEXT SECTION FUNCTIONALITY
// ========================================
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
        const formattedText = text
            .split('\n')
            .filter(line => line.trim())
            .map(line => `<p>${line}</p>`)
            .join('');
        
        textDisplay.innerHTML = formattedText;
        DataManager.setText(formattedText);
        textEditForm.style.display = 'none';
        textDisplay.style.display = 'block';
    } else {
        alert('Bitte geben Sie einen Text ein.');
    }
});

// ========================================
// IMAGE GALLERY FUNCTIONALITY
// ========================================
function renderGallery() {
    const images = DataManager.getImages();
    gallery.innerHTML = '';
    
    images.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${image.url}" alt="${image.title}" onerror="this.src='https://via.placeholder.com/500?text=Bild+konnte+nicht+geladen+werden'">
            <div class="image-info">
                <p>${image.title}</p>
                <button class="delete-image-btn" data-index="${index}">🗑️</button>
            </div>
        `;
        gallery.appendChild(galleryItem);
    });
    
    // Attach delete listeners
    document.querySelectorAll('.delete-image-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(btn.dataset.index);
            if (confirm('Dieses Bild wirklich löschen?')) {
                DataManager.deleteImage(index);
                renderGallery();
            }
        });
    });
}

addImageBtn.addEventListener('click', () => {
    imageUploadForm.style.display = 'block';
    imageUrlInput.focus();
});

cancelImageBtn.addEventListener('click', () => {
    imageUploadForm.style.display = 'none';
    imageUrlInput.value = '';
    imageTitleInput.value = '';
});

imageUploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const url = imageUrlInput.value.trim();
    const title = imageTitleInput.value.trim();
    
    if (url && title) {
        DataManager.addImage(url, title);
        renderGallery();
        imageUploadForm.style.display = 'none';
        imageUrlInput.value = '';
        imageTitleInput.value = '';
    } else {
        alert('Bitte geben Sie sowohl eine URL als auch einen Titel ein.');
    }
});

// ========================================
// NOTES FUNCTIONALITY
// ========================================
function renderNotes() {
    const notes = DataManager.getNotes();
    notesContainer.innerHTML = '';
    
    notes.forEach((note, index) => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <h4>${note.title}</h4>
            <p>${note.content}</p>
            <div class="note-actions">
                <button class="note-edit-btn" data-index="${index}">✏️</button>
                <button class="note-delete-btn" data-index="${index}">🗑️</button>
            </div>
        `;
        notesContainer.appendChild(noteCard);
    });
    
    // Attach event listeners
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
            const index = parseInt(btn.dataset.index);
            if (confirm('Diese Notiz wirklich löschen?')) {
                DataManager.deleteNote(index);
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

// ========================================
// INITIALIZATION
// ========================================
function loadAllContent() {
    // Load text
    const text = DataManager.getText();
    textDisplay.innerHTML = text;
    
    // Load gallery
    renderGallery();
    
    // Load notes
    renderNotes();
}

// Check if already logged in via localStorage
window.addEventListener('load', () => {
    // Optional: Add session security (logout after tab close)
    // You can modify this behavior as needed
    
    // Initial password input focus
    if (loginScreen.style.display !== 'none') {
        passwordInput.focus();
    }
});

// ========================================
// KEYBOARD SHORTCUTS
// ========================================
document.addEventListener('keydown', (e) => {
    // Escape key to close forms
    if (e.key === 'Escape') {
        if (textEditForm.style.display === 'block') {
            cancelTextBtn.click();
        }
        if (imageUploadForm.style.display === 'block') {
            cancelImageBtn.click();
        }
        if (noteForm.style.display === 'block') {
            cancelNoteBtn.click();
        }
    }
});

console.log('🔐 Private Website Script geladen. Version: 1.0.0');
