/* globals chrome, document */

const wordsList = document.getElementById('words-list');
const autosaveMessage = document.getElementById('autosave');
const addButton = document.getElementById('add');

// 🇫🇷 Sauvegarde la liste de mots dans le stockage local grâce à l'API chrome.storage
// 🇬🇧 Save words list into local storage through chrome.storage API
function saveOptions() {
  const list = document.querySelectorAll('li');

  if (list.length > 0) {
    const optionsToSave = {
      wordsList: [],
    };

    for (const item of list) {
      const [searchExpression, replacementExpression] = item.children;
      // 🇫🇷 Sauvegarde uniquement les lignes non vides
      // 🇬🇧 Save only non empty lines
      if (searchExpression.value.length || replacementExpression.value.length) {
        optionsToSave.wordsList.push([searchExpression.value, replacementExpression.value]);
      }
    }

    chrome.storage.sync.set(optionsToSave);
  } else {
    // 🇫🇷 S'il n'y a aucun mot dans la liste, supprimer tout du stockage
    // 🇬🇧 If there is no words in the list, delete everything from the storage
    chrome.storage.sync.set({ wordsList: [] });
  }

  autosaveMessage.classList.remove('saving');
  autosaveMessage.textContent = 'Done';
}

// 🇫🇷 Restaure la liste de mots depuis le stockage local
// 🇬🇧 Restores the words list from the local storage
function restoreOptions() {
  chrome.storage.sync.get({
    wordsList: [],
  }, (items) => {
    // 🇫🇷 S'il n'y a aucun mot de stocké...
    // 🇬🇧 If there is no stored word...
    if (items.wordsList.length <= 0) {
      // 🇫🇷 UX: Ajouter une ligne vide pour faciliter la saisie
      // 🇬🇧 UX: Add an empty line to facilitate input
      insertNewExpression();
      // 🇫🇷 UX: Focus sur le premier input pour que l'utilisateur puisse taper immédiatement son mot
      // 🇬🇧 UX: Focus on the first input so the user can start typing right away his word
      wordsList.firstElementChild.firstElementChild.focus();
    } else {
      // 🇫🇷 S'il y a des mots stockés, on les ajoute à la liste
      // 🇬🇧 If there are stored words, we add them to the list
      for (const [searchExpression, replacementExpression] of items.wordsList) {
        insertNewExpression(searchExpression, replacementExpression, 'beforeend');
      }
    }
  });
}

let keyboardTimeoutId = 0;

// 🇫🇷 Notifie et initie la sauvegarde des données après un délai
// 🇬🇧 Notify and initiate the data saving after a delay
function initSave() {
  clearTimeout(keyboardTimeoutId);
  autosaveMessage.classList.add('saving');
  autosaveMessage.textContent = 'Saving modifications...';
  keyboardTimeoutId = setTimeout(saveOptions, 500);
}

// 🇫🇷 Restaure les options dès que la page est complètement chargée
// 🇬🇧 Restores options as soon as the page is loaded
document.addEventListener('DOMContentLoaded', restoreOptions);

// 🇫🇷 Gère le gros bouton plus pour ajouter une nouvelle ligne
// 🇬🇧 Manage big plus button to add a new line
addButton.addEventListener('click', () => {
  insertEmptyExpression();
});

// 🇫🇷 Gère les boutons de suppression
// 🇬🇧 Manage delete buttons
wordsList.addEventListener('click', (e) => {
  if (e.target.matches('.trash-icon')) {
    e.target.parentElement.remove();
    initSave();
  }
});

// 🇫🇷 UX: Sauvegarde automatiquement après avoir tapé une touche
// 🇬🇧 UX: Autosave after hitting a key
wordsList.addEventListener('keydown', (event) => {
  // 🇫🇷 Ne sauvegarde pas quand on se déplace juste avec le clavier
  // 🇬🇧 Don't save when moving around with the keyboard
  if (event.code !== 'Tab' && event.key !== 'Shift' && event.code !== 'Enter') {
    initSave();
  }

  // 🇫🇷 UX: Facilite le processus d'édition grâce à la toucher ENTREE (pour éviter de toucher la souris)
  // 🇬🇧 UX: Ease the editing process with the use of ENTER key (avoid touching the mouse)
  if (event.code === 'Enter') {
    if (event.target.matches('input[name="replacement-expression"]')) {
      // 🇫🇷 Si tu édites l'expression de remplacement de la dernière ligne et tape ENTREE ça ajoutera une nouvelle ligne
      // 🇬🇧 If you edit the last line replacement expression and type ENTER it will add a new empty line
      if (event.target.parentElement === wordsList.lastElementChild
        || event.target.parentElement === wordsList.firstElementChild) {
        insertEmptyExpression();
      } else {
        // 🇫🇷 Si on n'est pas sur la dernière ligne, sélectionne et focus sur l'expression de recherche de la ligne suivante
        // 🇬🇧 If you're not on the last line, select and focus on the next line search expression
        event.target.parentElement.nextElementSibling.firstElementChild.select();
      }
    }

    if (event.target.matches('input[name="search-expression"]')) {
      // 🇫🇷 Taper ENTREE quand on édite l'expression de recherche nous fait bouger sur l'expression de remplacement
      // 🇬🇧 Typing ENTER when editing a search expression will move you to the replacement expression
      event.target.nextElementSibling.select();
    }
  }
});

// 🇫🇷 Ajoute une ligne vide ou une expression déjà sauvegardée précédemment
// 🇬🇧 Add an empty line or an expression that was already saved previously
function insertNewExpression(searchExpression = '', replacementExpression = '', position = 'afterbegin') {
  wordsList.insertAdjacentHTML(position, `
<li>
  <input type="text" placeholder="Search expression" value="${searchExpression}" name="search-expression"/>
  →
  <input type="text" placeholder="Replacement" value="${replacementExpression}" name="replacement-expression"/><button class="fas fa-trash trash-icon" tabindex="0"></button>
</li>
  `);
}

// 🇫🇷 UX: Focus immédiatement sur l'expression de recherche pour économiser un clic de souris
// 🇬🇧 UX: Focus immediately on the search expression to save one mouse click
function insertEmptyExpression() {
  insertNewExpression();
  wordsList.firstElementChild.firstElementChild.focus();
}
