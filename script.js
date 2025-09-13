// Inizializza jsPDF
window.jsPDF = window.jspdf.jsPDF;

// Elementi DOM
const form = document.getElementById('note-form');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');
const notesContainer = document.getElementById('notes-container');
const searchInput = document.getElementById('search');
const themeToggle = document.getElementById('theme-toggle');
const deleteModal = document.getElementById('delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const focusToggle = document.getElementById('focus-toggle');
const exportPdfBtn = document.getElementById('export-pdf');
const noteFormContainer = document.getElementById('note-form-container');
const wordCountElement = document.getElementById('word-count');
const storageUsedElement = document.getElementById('storage-used');
const storageProgressElement = document.getElementById('storage-progress');
const backupBtn = document.getElementById('backup-notes');
const restoreBtn = document.getElementById('restore-notes');
const saveNoteBtn = document.getElementById('save-note');
const toggleSelectionModeBtn = document.getElementById('toggle-selection-mode');

// Elementi per il modal di esportazione
const exportModal = document.getElementById('export-modal');
const exportNoteList = document.getElementById('export-note-list');
const cancelExportBtn = document.getElementById('cancel-export');
const confirmExportBtn = document.getElementById('confirm-export');
const exportSearchInput = document.getElementById('export-search');

// Elementi per la selezione multipla
const selectionControls = document.getElementById('selection-controls');
const selectionInfo = document.getElementById('selection-info');
const selectAllBtn = document.getElementById('select-all-btn');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const deleteModalText = document.getElementById('delete-modal-text');

// Variabili di stato
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let draggedIndex = null;
let noteToDelete = null;
let editMode = false;
let noteToEdit = null;
let focusMode = false;
let selectedNotesForExport = [];
let selectedNotes = []; // Array per tenere traccia delle note selezionate
let selectionMode = false; // Modalità selezione attiva/disattiva

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
  // Tema persistente
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.innerHTML = '<i class="fas fa-sun btn-icon"></i> Tema Chiaro';
  }
  
  updateStorageInfo();
  renderNotes();
  setupEventListeners();
});

// Imposta i listener degli eventi
function setupEventListeners() {
  // Form
  form.addEventListener('submit', handleFormSubmit);

  // Conteggio parole
  contentInput.addEventListener('input', updateWordCount);
  
  // Ricerca
  searchInput.addEventListener('input', () => {
    renderNotes(searchInput.value.toLowerCase());
  });
  
  // Tema
  themeToggle.addEventListener('click', toggleTheme);
  
  // Modal eliminazione
  cancelDeleteBtn.addEventListener('click', hideDeleteModal);
  confirmDeleteBtn.addEventListener('click', deleteNote);
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      hideDeleteModal();
      hideExportModal();
    });
  });
  
  // Modalità focus (solo tramite l'icona nel form)
  focusToggle.addEventListener('click', toggleFocusMode);
  
  // Esporta PDF
  exportPdfBtn.addEventListener('click', showExportModal);
  
  // Conferma esportazione
  confirmExportBtn.addEventListener('click', exportSelectedNotesToPDF);
  cancelExportBtn.addEventListener('click', hideExportModal);
  
  // Backup e ripristino
  backupBtn.addEventListener('click', backupNotes);
  restoreBtn.addEventListener('click', triggerRestore);
  
  // Chiudi modale cliccando fuori
  window.addEventListener('click', (e) => {
    if (e.target === deleteModal) hideDeleteModal();
    if (e.target === exportModal) hideExportModal();
  });

  // Selezione multipla
  selectAllBtn.addEventListener('click', toggleSelectAll);
  deleteSelectedBtn.addEventListener('click', showDeleteSelectedModal);
  toggleSelectionModeBtn.addEventListener('click', toggleSelectionMode);
  
  // Ricerca nel modal di esportazione
  exportSearchInput.addEventListener('input', () => {
    const filterText = exportSearchInput.value.toLowerCase();
    const noteItems = exportNoteList.querySelectorAll('.note-item');
    let anyVisible = false;

    noteItems.forEach(item => {
      const title = item.querySelector('strong').textContent.toLowerCase();
      if (title.includes(filterText)) {
        item.style.display = '';
        anyVisible = true;
      } else {
        item.style.display = 'none';
      }
    });

    // Mostra messaggio "nessuna nota trovata"
    let emptyMsg = exportNoteList.querySelector('.empty-state');
    if (!emptyMsg) {
      emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-state';
      emptyMsg.style.padding = '14px';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#888';
      emptyMsg.innerHTML = `
        <i class="fas fa-sticky-note"></i>
        <h3>Nessuna nota corrisponde alla ricerca</h3>
        <p>Prova con termini diversi</p>
      `;
      exportNoteList.appendChild(emptyMsg);
    }

    emptyMsg.style.display = anyVisible ? 'none' : 'block';
  });
}

// Attiva/disattiva modalità selezione
function toggleSelectionMode() {
  selectionMode = !selectionMode;
  
  if (selectionMode) {
    // Entra in modalità selezione
    selectionControls.style.display = 'flex';
    toggleSelectionModeBtn.innerHTML = '<i class="fas fa-times btn-icon"></i> Esci Selezione';
    toggleSelectionModeBtn.style.background = '#dc3545';
  } else {
    // Esci dalla modalità selezione
    selectionMode = false;
    selectedNotes = [];
    selectionControls.style.display = 'none';
    toggleSelectionModeBtn.innerHTML = '<i class="fas fa-check-square btn-icon"></i> Modalità Selezione';
    toggleSelectionModeBtn.style.background = '';
  }
  
  updateSelectionInfo();
  renderNotes();
}

// Aggiorna il conteggio parole
function updateWordCount() {
  const text = contentInput.value;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  
  wordCountElement.textContent = `${wordCount} parole, ${charCount} caratteri`;
}

// Toggle tema
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  if (isDark) {
    themeToggle.innerHTML = '<i class="fas fa-sun btn-icon"></i> Tema Chiaro';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon btn-icon"></i> Tema Scuro';
  }
}

// Toggle modalità focus
function toggleFocusMode() {
  focusMode = !focusMode;
  noteFormContainer.classList.toggle('focus-mode', focusMode);
  
  // Aggiorna griglia note
  document.querySelector('.main-content').classList.toggle('focus-mode-active', focusMode);
  
  if (focusMode) {
    focusToggle.innerHTML = '<i class="fas fa-compress"></i>';
  } else {
    focusToggle.innerHTML = '<i class="fas fa-expand"></i>';
  }
}

// Mostra modal per selezione nota da esportare
function showExportModal() {
  if (notes.length === 0) {
    alert("Non ci sono note da esportare!");
    return;
  }
  
  // Pulisci la lista
  exportNoteList.innerHTML = '';
  selectedNotesForExport = [];
  
  // Aggiungi tutte le note alla lista
  notes.forEach((note, index) => {
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.innerHTML = `
      <strong>${note.title}</strong>
      <div style="font-size: 0.8rem; color: #777; margin-top: 5px;">
        ${formatDate(note.updatedAt || note.createdAt)}
      </div>
    `;
    
    noteItem.addEventListener('click', () => {
      const noteIndex = index;
      
      if (selectedNotesForExport.includes(noteIndex)) {
        // Deseleziona se già selezionata
        selectedNotesForExport = selectedNotesForExport.filter(i => i !== noteIndex);
        noteItem.classList.remove('selected');
      } else {
        // Aggiungi alla selezione
        selectedNotesForExport.push(noteIndex);
        noteItem.classList.add('selected');
      }
    });

    exportNoteList.appendChild(noteItem);
  });
  
  // Mostra il modal
  exportModal.style.display = 'flex';
}

// Nascondi modal esportazione
function hideExportModal() {
  exportModal.style.display = 'none';

  // Resetta la barra di ricerca
  exportSearchInput.value = '';

  // Mostra tutte le note di nuovo
  const noteItems = exportNoteList.querySelectorAll('.note-item');
  noteItems.forEach(item => {
    item.style.display = '';
    item.classList.remove('selected');
  });

  // Nascondi eventuale messaggio "nessuna nota trovata"
  const emptyMsg = exportNoteList.querySelector('.empty-state');
  if (emptyMsg) {
    emptyMsg.style.display = 'none';
  }

  // Pulisce l'array delle note selezionate per esportazione
  selectedNotesForExport = [];
}

// Esporta la nota selezionata in PDF
function exportSelectedNotesToPDF() {
  if (selectedNotesForExport.length === 0) {
    alert("Seleziona almeno una nota da esportare!");
    return;
  }

  selectedNotesForExport.forEach(index => {
    const note = notes[index];
    const doc = new jsPDF();

    // Titolo PDF
    doc.setFontSize(20);
    doc.text("Nota - AppNote++", 105, 20, { align: "center" });

    // Data esportazione
    doc.setFontSize(12);
    const exportDate = new Date().toLocaleDateString('it-IT', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    doc.text(`Esportato il: ${exportDate}`, 105, 30, { align: "center" });

    let yPosition = 45;
    const margin = 15;

    // Titolo nota
    doc.setFontSize(16);
    doc.text(`Titolo: ${note.title}`, margin, yPosition);
    yPosition += 10;

    // Data nota
    const noteDate = formatDate(note.updatedAt || note.createdAt);
    doc.setFontSize(10);
    doc.text(`Creata il: ${noteDate}`, margin, yPosition);
    yPosition += 15;

    // Contenuto
    doc.setFontSize(12);
    const splitContent = doc.splitTextToSize(note.content, 170);
    doc.text(splitContent, margin, yPosition);

    // Salva PDF
    doc.save(`nota_${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  });

  hideExportModal();
  alert("Note esportate con successo!");
}

// Backup note
function backupNotes() {
  const dataStr = JSON.stringify(notes);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `note_backup_${new Date().toISOString().slice(0,10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  alert('Backup delle note esportato con successo!');
}

// Trigger ripristino
function triggerRestore() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const importedNotes = JSON.parse(e.target.result);
        if (Array.isArray(importedNotes)) {
          notes = importedNotes;
          saveNotes();
          renderNotes();
          updateStorageInfo();
          alert('Note ripristinate con successo!');
        } else {
          throw new Error('Formato file non valido');
        }
      } catch (err) {
        alert('Errore nel ripristino: file non valido');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Aggiorna informazioni storage
function updateStorageInfo() {
  const data = localStorage.getItem('notes');
  const size = data ? new Blob([data]).size : 0;
  const sizeKB = (size / 1024).toFixed(2);
  
  storageUsedElement.textContent = `${sizeKB} KB`;
  
  // Limite simulato di 500MB
  const maxSize = 500 * 1024; // 500MB in KB
  const percentage = Math.min((sizeKB / maxSize) * 100, 100);
  
  storageProgressElement.style.width = `${percentage}%`;
  
  if (percentage > 90) {
    storageProgressElement.style.background = 'linear-gradient(90deg, #ff6b6b 0%, #c92a2a 100%)';
  } else if (percentage > 70) {
    storageProgressElement.style.background = 'linear-gradient(90deg, #ffa726 0%, #f57c00 100%)';
  } else {
    storageProgressElement.style.background = 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)';
  }
}

// Salva note nel localStorage
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
  updateStorageInfo();
}

// Formatta data
function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('it-IT', options);
}

// Render note
function renderNotes(filter = '') {
  const filteredNotes = filter ? notes.filter(note => 
    note.title.toLowerCase().includes(filter) || 
    note.content.toLowerCase().includes(filter)
  ) : notes;
  
  notesContainer.innerHTML = '';
  
  if (filteredNotes.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <i class="fas fa-sticky-note"></i>
      <h3>${filter ? 'Nessuna nota corrisponde alla ricerca' : 'Nessuna nota ancora'}</h3>
      <p>${filter ? 'Prova con termini diversi' : 'Aggiungi la tua prima nota per iniziare!'}</p>
    `;
    notesContainer.appendChild(emptyState);
    
    // Nascondi i controlli di selezione se non ci sono note
    selectionControls.style.display = 'none';
    return;
  }
  
  // Mostra i controlli di selezione se siamo in modalità selezione
  selectionControls.style.display = selectionMode ? 'flex' : 'none';
  updateSelectionInfo();
  
  // Dividi note pinnate e non
  const pinnedNotes = filteredNotes.filter(note => note.pinned);
  const normalNotes = filteredNotes.filter(note => !note.pinned);
  
  // Render note pinnate
  pinnedNotes.forEach((note, index) => {
    const originalIndex = notes.findIndex(n => n.id === note.id);
    if (originalIndex !== -1) {
      createNoteElement(note, originalIndex, true);
    }
  });
  
  // Render note normali
  normalNotes.forEach((note, index) => {
    const originalIndex = notes.findIndex(n => n.id === note.id);
    if (originalIndex !== -1) {
      createNoteElement(note, originalIndex, false);
    }
  });
}

// Crea elemento nota
function createNoteElement(note, index, isPinned) {
  const noteEl = document.createElement('div');
  noteEl.className = `note ${isPinned ? 'pinned' : ''} ${selectedNotes.includes(index) ? 'selected' : ''}`;
  noteEl.style.backgroundColor = note.color;
  noteEl.draggable = true;
  
  const isSelected = selectedNotes.includes(index);
  
  noteEl.innerHTML = `
    <div class="note-header">
      <div class="note-title">
        <span class="emoji">${note.icon}</span>
        ${note.title}
      </div>
      <div class="note-actions">
        <button class="note-btn pin-note ${isPinned ? 'pinned' : ''}" aria-label="${isPinned ? 'Sblocca nota' : 'Fissa nota'}">
          <i class="fas fa-thumbtack"></i>
        </button>
        <button class="note-btn edit-note" aria-label="Modifica nota">
          <i class="fas fa-edit"></i>
        </button>
        <button class="note-btn delete-note ${isSelected ? 'selected' : ''}" aria-label="${selectionMode ? 'Seleziona nota' : 'Elimina nota'}">
          <i class="fas ${selectionMode && isSelected ? 'fa-check' : 'fa-trash'}"></i>
        </button>
      </div>
    </div>
    <div class="note-content">${note.content}</div>
    <div class="note-footer">
      <span class="note-date">${formatDate(note.updatedAt || note.createdAt)}</span>
    </div>
  `;
  
  // Aggiungi event listeners per i pulsanti
  noteEl.querySelector('.pin-note').addEventListener('click', () => togglePinNote(index));
  noteEl.querySelector('.edit-note').addEventListener('click', () => editNote(index));
  
  // Listener per il pulsante elimina/selezione
  const deleteBtn = noteEl.querySelector('.delete-note');
  if (selectionMode) {
    deleteBtn.addEventListener('click', () => toggleNoteSelection(index));
  } else {
    deleteBtn.addEventListener('click', () => showDeleteModal(index));
  }
  
  // Drag and drop
  noteEl.addEventListener('dragstart', () => {
    draggedIndex = index;
    noteEl.classList.add('dragging');
  });
  
  noteEl.addEventListener('dragend', () => {
    noteEl.classList.remove('dragging');
  });
  
  notesContainer.appendChild(noteEl);
}

// Gestione submit form
function handleFormSubmit(e) {
  e.preventDefault();
  
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const color = document.getElementById('note-color').value;
  
  if (editMode && noteToEdit !== null) {
    // Modifica nota esistente
    notes[noteToEdit] = {
      ...notes[noteToEdit],
      title,
      content,
      color,
      updatedAt: new Date().toISOString()
    };
    
    editMode = false;
    noteToEdit = null;
    saveNoteBtn.innerHTML = '<i class="fas fa-plus"></i> Aggiungi Nota';
  } else {
    // Aggiungi nuova nota
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      color,
      icon: '📝',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false
    };
    
    notes.unshift(newNote);
  }
  
  saveNotes();
  renderNotes();
  form.reset();
  updateWordCount();
}

// Modifica nota
function editNote(index) {
  // Se clicchi sulla stessa nota già in modifica → annulla modifica
  if (editMode && noteToEdit === index) {
    editMode = false;
    noteToEdit = null;
    form.reset();
    updateWordCount();
    saveNoteBtn.innerHTML = '<i class="fas fa-plus"></i> Aggiungi Nota';
    return;
  }

  const note = notes[index];
  titleInput.value = note.title;
  contentInput.value = note.content;
  document.getElementById('note-color').value = note.color;

  editMode = true;
  noteToEdit = index;
  saveNoteBtn.innerHTML = '<i class="fas fa-save"></i> Salva Modifiche';

  // Scrolla al form
  noteFormContainer.scrollIntoView({ behavior: 'smooth' });
  titleInput.focus();
}

// Toggle pin nota
function togglePinNote(index) {
  notes[index].pinned = !notes[index].pinned;
  saveNotes();
  renderNotes();
}

// Toggle selezione nota
function toggleNoteSelection(index) {
  if (selectedNotes.includes(index)) {
    selectedNotes = selectedNotes.filter(i => i !== index);
  } else {
    selectedNotes.push(index);
  }
  updateSelectionInfo();
  renderNotes();
}

// Mostra modale eliminazione
function showDeleteModal(index) {
  noteToDelete = index;
  deleteModalText.textContent = "Sei sicuro di voler eliminare questa nota? L'azione non può essere annullata.";
  deleteModal.style.display = 'flex';
}

// Mostra modale eliminazione per note selezionate
function showDeleteSelectedModal() {
  if (selectedNotes.length === 0) return;
  
  noteToDelete = null; // Indica che stiamo eliminando note selezionate
  const noteCount = selectedNotes.length;
  deleteModalText.textContent = `Sei sicuro di voler eliminare ${noteCount} ${noteCount === 1 ? 'nota' : 'note'}? L'azione non può essere annullata.`;
  deleteModal.style.display = 'flex';
}

// Nascondi modale eliminazione
function hideDeleteModal() {
  deleteModal.style.display = 'none';
  noteToDelete = null;
}

// Elimina nota
function deleteNote() {
  if (noteToDelete !== null) {
    // Elimina una singola nota
    notes.splice(noteToDelete, 1);
    saveNotes();
    renderNotes();
    hideDeleteModal();
  } else if (selectedNotes.length > 0) {
    // Elimina le note selezionate
    // Ordina in ordine decrescente per evitare problemi con gli indici
    selectedNotes.sort((a, b) => b - a);
    selectedNotes.forEach(index => {
      notes.splice(index, 1);
    });
    selectedNotes = [];
    selectionMode = false;
    toggleSelectionModeBtn.innerHTML = '<i class="fas fa-check-square btn-icon"></i> Modalità Selezione';
    toggleSelectionModeBtn.style.background = '';
    saveNotes();
    renderNotes();
    hideDeleteModal();
  }
}

// Toggle seleziona tutto
function toggleSelectAll() {
  const allNotes = document.querySelectorAll('.note');
  
  if (selectedNotes.length === notes.length) {
    // Deseleziona tutto
    selectedNotes = [];
  } else {
    // Seleziona tutto
    selectedNotes = notes.map((_, index) => index);
  }
  
  // Aggiorna feedback visivo
  allNotes.forEach((noteEl, index) => {
    if (selectedNotes.includes(index)) {
      noteEl.classList.add('selected');
      const deleteBtn = noteEl.querySelector('.delete-note');
      deleteBtn.classList.add('selected');
      deleteBtn.querySelector('i').classList.remove('fa-trash');
      deleteBtn.querySelector('i').classList.add('fa-check');
    } else {
      noteEl.classList.remove('selected');
      const deleteBtn = noteEl.querySelector('.delete-note');
      deleteBtn.classList.remove('selected');
      deleteBtn.querySelector('i').classList.remove('fa-check');
      deleteBtn.querySelector('i').classList.add('fa-trash');
    }
  });

  updateSelectionInfo();
}

// Aggiorna informazioni selezione
function updateSelectionInfo() {
  const count = selectedNotes.length;
  selectionInfo.textContent = `${count} ${count === 1 ? 'nota selezionata' : 'note selezionate'}`;
  deleteSelectedBtn.disabled = count === 0;
  
  // Aggiorna il testo del pulsante "Seleziona tutto"
  const allNoteElements = notesContainer.querySelectorAll('.note');
  if (allNoteElements.length > 0 && selectedNotes.length === allNoteElements.length) {
    selectAllBtn.innerHTML = '<i class="fas fa-times-circle"></i> Deseleziona tutto';
  } else {
    selectAllBtn.innerHTML = '<i class="fas fa-check-square"></i> Seleziona tutto';
  }
}