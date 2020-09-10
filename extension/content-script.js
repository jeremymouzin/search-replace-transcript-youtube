/* global document, chrome, InputEvent */

/**
 * 🇫🇷 On génère un faux évènement, comme si on avait tapé sur le clavier à l'intérieur
 * de la textearea pour modifier le sous-titre. C'est utilisé pour déclencher le code
 * JavaScript qui gère les mises à jour et la sauvegarde automatique dans l'éditeur.
 * 🇬🇧 We generate a fake event, as if we typed on the keyboard within a textarea to
 * modify a caption. This is needed to trigger the JavaScript code that handles
 * updates and autosave the new content in the online editor.
 */
function dispatchFakeEvent(element) {
  const event = new InputEvent('input', {
    bubbles: true,
    cancelBubble: false,
    cancelable: false,
    composed: true,
    currentTarget: null,
    data: 'a',
    dataTransfer: null,
    defaultPrevented: false,
    detail: 0,
    eventPhase: 0,
    inputType: 'insertText',
    isComposing: false,
    isTrusted: false,
    returnValue: true,
    sourceCapabilities: null,
    srcElement: element,
    target: element,
    view: null,
    which: 0,
  });

  element.dispatchEvent(event);
}

function searchAndReplace(captionsList, searchExpression, replacementExpression, options) {
  let numberOfMatchesReplaced = 0;
  const updatedCaptionsList = captionsList.map((textArea) => {
    // 🇫🇷 Gère les recherches sur plusieurs mots et plusieurs lignes
    // 🇬🇧 Manage the search of a several words expression on multiple lines
    const robustSearchExpression = searchExpression.replace(/ /g, '([ \\n])*');
    let robustReplacementExpression = replacementExpression;

    // 🇫🇷 On utilise une RegExp pour remplacer *toutes* les occurences de l'expression recherchée
    // 🇬🇧 We use a RegExp to replace *all* occurences of the searched expression
    const searchRegExpFlags = options.insensitiveSearch ? 'gi' : 'g';
    // 🇫🇷 J'utilise une RegExp complexe au lieu de \b car ECMAScript considère que les lettres avec
    // accent sont des limites de mots !
    // 🇬🇧 I use a complex RegExp instead of just \b because ECMAScript considers that accent letters
    // are word limits!
    // See: https://stackoverflow.com/questions/5436824/matching-accented-characters-with-javascript-regexes
    let searchRegExp = new RegExp(`(?<![A-Za-z\u00C0-\u017F])${robustSearchExpression}(?![A-Za-z\u00C0-\u017F])`, searchRegExpFlags);
    const originalText = textArea.value;

    const result = searchRegExp.exec(originalText);
    if (result !== null) {
      const match = result[0];
      /**
       * 🇫🇷 Si on trouve plusieurs mots sur différentes lignes, on gère le retour à la ligne
       * correctement et on inclut n'importe quel caractère suivant qui n'est pas un espace
       * (comme une virgule, un point etc.)
       * 🇬🇧 If we find several words on different lines, manage the carriage return correctly
       * and include any trailing char that is not a space (like a comma, a dot etc.)
       */
      if (match.includes('\n')) {
        const trailingChar = originalText[searchRegExp.lastIndex];

        if (trailingChar !== ' ') {
          robustReplacementExpression += trailingChar;
        }
        robustReplacementExpression += '\n';
        searchRegExp = new RegExp(`\\b${robustSearchExpression}${trailingChar}[ ]*`, searchRegExpFlags);
      }

      const newReplacedExpression = originalText.replace(searchRegExp, robustReplacementExpression);

      textArea.textContent = newReplacedExpression;
      textArea.value = newReplacedExpression;
      numberOfMatchesReplaced++;

      // 🇫🇷 Dispatche le faux évènement pour que le système YouTube prenne en compte les modifications
      // 🇬🇧 Dispatch a fake event so that YouTube system takes into account the modifications
      dispatchFakeEvent(textArea);

      return newReplacedExpression;
    }

    return originalText;
  });

  return { updatedCaptionsList, numberOfMatchesReplaced };
}

/**
 * 🇫🇷 On écoute les requêtes venant du formulaire popup
 * 🇬🇧 Listen to requests coming from the popup form
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { searchExpression, replacementExpression, options } = request;

  let numberOfMatchesReplaced = 0;
  const captionsList = [...document.querySelectorAll('textarea')];

  // 🇫🇷 Si on a cliqué sur le bouton preprocess dans le formulaire du popup, on processe la liste des mots
  // 🇬🇧 If we clicked on the prepocess button in the popup form, process the words list
  if (request.preprocess) {
    chrome.storage.sync.get({
      wordsList: [],
    }, (items) => {
      if (items.wordsList.length > 0) {
        const preprocessWordsList = items.wordsList;
        preprocessWordsList.forEach(([wordsToSearchFor, replacement]) => {
          const result = searchAndReplace(captionsList, wordsToSearchFor, replacement, options);
          numberOfMatchesReplaced += result.numberOfMatchesReplaced;
        });
      }
      sendResponse({ data: 'done', numberOfMatchesReplaced });
    });
  } else {
    if (searchExpression && replacementExpression) {
      const result = searchAndReplace(captionsList, searchExpression, replacementExpression, options);
      numberOfMatchesReplaced += result.numberOfMatchesReplaced;
    }
    sendResponse({ data: 'done', numberOfMatchesReplaced });
  }

  return true;
});

function replaceCharAt(text, position, newChar) {
  if (position >= text.length) return text;
  return text.slice(0, position) + newChar + text.slice(position + 1);
}

function addCharAt(text, position, newChar) {
  if (position > text.length) return text;
  return text.slice(0, position) + newChar + text.slice(position);
}

function createStartOfSentence(text, cursorPosition) {
  let newText = text;
  while (cursorPosition >= 0) {
    const currentCharacter = text[cursorPosition];
    if (currentCharacter === ' ' || currentCharacter === '\n' || cursorPosition === 0) {
      // We add a dot only if there is other words before
      if (cursorPosition > 0) {
        newText = replaceCharAt(newText, cursorPosition + 1, newText[cursorPosition + 1].toUpperCase());
        // If there is already an end of sentence character, don't add the dot!
        const previousCharacter = newText[cursorPosition - 1];
        if (!'.?!'.includes(previousCharacter)) {
          newText = addCharAt(newText, cursorPosition, '.');
        }
      } else {
        newText = replaceCharAt(newText, cursorPosition, newText[cursorPosition].toUpperCase());
      }
      return newText;
    }
    cursorPosition--;
  }
  return newText;
}

let keyPressedCounter = 0;
document.addEventListener('keyup', (e) => {
  if (e.key === 'Control') {
    keyPressedCounter++;

    if (keyPressedCounter < 2) {
      // If the key is not pressed again quickly, reset the counter
      setTimeout(() => {
        keyPressedCounter = 0;
      }, 500);
    } else if (document.activeElement.matches('.timed-event-line-box textarea')) {
      const textArea = document.activeElement;

      // If there is no selection...
      if (textArea.selectionStart === textArea.selectionEnd) {
        const cursorPosition = textArea.selectionStart;
        const currentText = textArea.value;

        textArea.value = createStartOfSentence(currentText, cursorPosition);
        textArea.selectionStart = cursorPosition;
        textArea.selectionEnd = cursorPosition;

        dispatchFakeEvent(textArea);
      }
    }
  }
});

/**
 * 🇫🇷 Ceci est un hook pour les tests unitaires avec Jest
 * L'objet module n'est pas défini quand on exécute l'extension dans Chrome. Pour éviter des
 * problèmes, on exécute l'affectation seulement quand on exécute les tests (quand module est défini).
 * 🇬🇧 This is the hook for unit testing with Jest
 * The module object is not defined when running the extension in Chrome. To avoid
 * any issue, we execute the affectation only when we run the tests (ie when module is defined).
 */
if (typeof module !== 'undefined') {
  module.exports = { searchAndReplace, createStartOfSentence };
}
