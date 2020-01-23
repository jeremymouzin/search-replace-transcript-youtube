// Let's grab useful elements
const wordsList = document.getElementById('words-list');
const flashAutoSave = document.querySelector('.flash-autosave');

// Saves options to chrome.storage
function saveOptions() {
  console.log("Saving options");
  const list = document.querySelectorAll("li");

  if (list.length > 0) {
    const optionsToSave = {
      wordsList: [],
    }

    for (const item of list) {
      const [searchExpression, replacementExpression] = item.children;
      // Only save non empty lines
      if (searchExpression.value.length || replacementExpression.value.length) {
        optionsToSave.wordsList.push([searchExpression.value, replacementExpression.value]);
      }
    }

    chrome.storage.sync.set(optionsToSave);
  } else {
    // Delete everything that was previously saved
    chrome.storage.sync.set({ wordsList: [] });
  }

  // Flash for autosaving
  flashAutoSave.classList.add('flash-open');
  setTimeout(function () {
    flashAutoSave.classList.remove('flash-open');
  }, 1500);
}

// Restores words list
function restoreOptions() {
  chrome.storage.sync.get({
    wordsList: [],
  }, function (items) {
    if (items.wordsList.length <= 0) {
      // UX: Add one empty line for the interface to get ready immediately
      insertNewExpression();
      // UX: Focus on the first input so the user can start typing right away 👌
      wordsList.firstElementChild.firstElementChild.focus();
    } else {
      for (const [searchExpression, replacementExpression] of items.wordsList) {
        insertNewExpression(searchExpression, replacementExpression);
      }
    }
  });
}

// Restores options as soon as the page is loaded
document.addEventListener('DOMContentLoaded', restoreOptions);

// Manage big plus button to add a new line
document.getElementById('add').addEventListener('click', () => {
  insertEmptyExpression();
});

// Manage delete button
wordsList.addEventListener('click', function(e) {
  if (e.target.matches('span')) {
    e.target.parentElement.remove();
    saveOptions();
  }
});

// UX: Autosave every second after hitting a key
let keyboardTimeoutId = 0;
wordsList.addEventListener('keyup', function(event) {
  // Don't save when moving around with the keyboard
  if (event.code !== 'Tab' && event.key !== 'Shift' && event.code !== 'Enter') {
    clearTimeout(keyboardTimeoutId);
    keyboardTimeoutId = setTimeout(saveOptions, 1000);
  }
  
  // UX: At the end of the last line, type ENTER to create a new expression
  // This way the user doesn't have to move the mouse and click!
  if (event.code === 'Enter') {
    if (event.target.matches('input[name="replacement-expression"]')) {
      if (event.target.parentElement === wordsList.lastElementChild) {
        insertEmptyExpression();
      } else {
        debugger;
      }
    }
  }
});

// Add an empty line or an expression that was already saved previously
function insertNewExpression(searchExpression = "", replacementExpression = "") {
  wordsList.insertAdjacentHTML('beforeend', `<li><input type="text" placeholder="Search expression" value="${searchExpression}"/>
    →
    <input type="text" placeholder="Replacement" value="${replacementExpression}" name="replacement-expression"/><span class="fas fa-trash trash-icon" tabindex="0"></span></li>
    `);
}

// UX: Focus immediately on the search expression to save one mouse click
function insertEmptyExpression() {
  insertNewExpression();
  wordsList.lastElementChild.firstElementChild.focus();
}