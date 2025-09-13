# 📚 AppNote++
# 🔗 Link: https://cortrifer.github.io/AppNote/

_Un'applicazione web elegante e interattiva per gestire 
le tue note personali con funzionalità avanzate._

---

## ⌨️ Utilizzare al PC!

---

## ✨ Caratteristiche

- **Gestione Note**: Crea, modifica e elimina tue note  
- **Modalità Focus**: Interfaccia a schermo intero per la scrittura senza distrazioni  
- **Ricerca Avanzata**: Trova rapidamente le note per titolo o contenuto  
- **Fissaggio Note**: Fissa le note importanti in cima alla lista  
- **Tema Scuro/Chiaro**: Interfaccia personalizzabile con tema chiaro e scuro  
- **Esportazione PDF**: Esporta le tue note in formato PDF  
- **Backup e Ripristino**: Salva e ripristina tutte le tue note  
- **Selezione Multipla**: Gestisci più note contemporaneamente   
- **Salvataggio Automatico**: Dati persistiti nel `localStorage`  
- **Contatore Parole**: Monitora la lunghezza delle tue note in tempo reale  
- **Personalizzazione Colori**: Scegli il colore per ogni nota  

---

## 🎯 Utilizzo

### Creare una Nuova Nota
1. Compila il titolo e il contenuto nel form  
2. Scegli un colore per la nota
3. Clicca **"Aggiungi Nota"**

### Modificare una Nota
1. Clicca sull'icona di modifica (✏️)  
2. Modifica titolo, contenuto o colore  
3. Clicca **"Salva Modifiche"**

### Fissare/Bloccare Note
- Clicca sull'icona 📌 per fissare una nota in cima

### Eliminare Note
- Clicca sull'icona 🗑️ sulla nota  
- Conferma l'eliminazione nel modal  

### Modalità Selezione Multipla
1. Attiva la **"Modalità Selezione"**  
2. Seleziona le note desiderate  
3. Usa **"Seleziona tutto"** o **"Elimina selezionate"**  

### Esportare in PDF
1. Clicca **"Esporta PDF"**  
2. Seleziona le note da esportare  
3. Clicca **"Esporta"** per scaricare i PDF  

### Backup e Ripristino
- **Backup**: Clicca **"Backup"** per scaricare un file con tutte le note  
- **Ripristino**: Clicca **"Ripristina"** per caricare un backup precedente  

### Modalità Focus
- Clicca sull'icona [] per attivare la modalità schermo intero  

---

## 📊 Struttura Dati

Le note sono memorizzate come:

```javascript
{
  id: string,           // ID univoco
  title: string,        // Titolo della nota
  content: string,      // Contenuto della nota
  color: string,        // Colore di sfondo
  icon: string,         // Emoji/icona associata
  createdAt: string,    // Data di creazione (ISO string)
  updatedAt: string,    // Data ultima modifica (ISO string)
  pinned: boolean       // Se la nota è fissata
}
```

---

## 🛠 Tecnologie Utilizzate
- **HTML5** – Struttura semantica e markup  
- **CSS3** – Stili avanzati con gradienti, flexbox, grid e animazioni  
- **JavaScript ES6** – Logica applicativa e gestione dello stato  
- **jsPDF** – Generazione di documenti PDF dalle note  
- **Font Awesome** – Icone e elementi UI  
- **LocalStorage API** – Persistenza dati lato client  

---

## 📝 Note Importanti
- I dati vengono salvati **automaticamente nel browser locale**  
- È possibile **esportare i dati** per backup esterni  
- L'applicazione funziona **completamente offline** dopo il caricamento iniziale  

---

## 🚀 Come Iniziare

### Metodo: Usa Link all'inizio

### Metodo: Browser Locale

1. Scarica i file del progetto (`index.html`, `styles.css`, `script.js`)  
2. Apri **index.html** nel tuo browser preferito  
3. Inizia a creare le tue note! 🎉  
