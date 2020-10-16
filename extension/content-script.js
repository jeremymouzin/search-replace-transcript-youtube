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

function searchAndReplace(fullSubtitleText, searchExpression, replacementExpression, options, textArea) {
  let numberOfMatchesReplaced = 0;

  // 🇫🇷 On utilise une RegExp pour remplacer *toutes* les occurences de l'expression recherchée
  // 🇬🇧 We use a RegExp to replace *all* occurences of the searched expression
  const searchRegExpFlags = options.insensitiveSearch ? 'gi' : 'g';

  // 🇫🇷 J'utilise une RegExp complexe au lieu de \b car ECMAScript considère que les lettres avec
  // accent sont des limites de mots ! J'échappe les caractères spéciaux des RegExp également.
  // 🇬🇧 I use a complex RegExp instead of just \b because ECMAScript considers that accent letters
  // are word limits! I also escape special RegExp chars too.
  // See: https://stackoverflow.com/questions/5436824/matching-accented-characters-with-javascript-regexes
  const escapedSearchExpression = searchExpression.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
  const searchRegExp = new RegExp(`(?<![A-Za-z\u00C0-\u017F])${escapedSearchExpression}(?![A-Za-z\u00C0-\u017F])`, searchRegExpFlags);
  const originalText = fullSubtitleText.textContent;

  const result = originalText.match(searchRegExp);
  if (result !== null) {
    const newReplacedExpression = originalText.replace(searchRegExp, replacementExpression);

    fullSubtitleText.textContent = newReplacedExpression;
    fullSubtitleText.value = newReplacedExpression;

    /**
     * 🇫🇷 C'est l'élément <textarea> à côté du <pre> qui doit être mis à jour pour refléter
     * les changements dans l'interface utilisateur !
     * 🇬🇧 It's the <textarea> element next to the <pre> that must be updated to reflect changes
     * on the user interface!
     */
    if (textArea) {
      textArea.value = newReplacedExpression;
      // 🇫🇷 Dispatche le faux évènement pour que le système YouTube prenne en compte les modifications
      // 🇬🇧 Dispatch a fake event so that YouTube system takes into account the modifications
      dispatchFakeEvent(textArea);
    }

    numberOfMatchesReplaced = result.length;
  }

  return { updatedFullSubtitleText: fullSubtitleText.textContent, numberOfMatchesReplaced };
}

/**
 * 🇫🇷 On écoute les requêtes venant du formulaire popup
 * 🇬🇧 Listen to requests coming from the popup form
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { searchExpression, replacementExpression, options } = request;

  let numberOfMatchesReplaced = 0;
  const fullSubtitleText = document.querySelector('#textarea-container.ytve-lightweight-textarea > pre');
  const textArea = document.querySelector('#textarea-container.ytve-lightweight-textarea > pre + textarea');

  // 🇫🇷 Si on a cliqué sur le bouton preprocess dans le formulaire du popup, on processe la liste des mots
  // 🇬🇧 If we clicked on the prepocess button in the popup form, process the words list
  if (request.preprocess) {
    chrome.storage.sync.get({
      wordsList: [],
    }, (items) => {
      if (items.wordsList.length > 0) {
        const preprocessWordsList = items.wordsList;
        preprocessWordsList.forEach(([wordsToSearchFor, replacement]) => {
          const result = searchAndReplace(fullSubtitleText, wordsToSearchFor, replacement, options, textArea);
          numberOfMatchesReplaced += result.numberOfMatchesReplaced;
        });
      }
      sendResponse({ data: 'done', numberOfMatchesReplaced });
    });
  } else {
    if (searchExpression && replacementExpression) {
      const result = searchAndReplace(fullSubtitleText, searchExpression, replacementExpression, options, textArea);
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
        if (!'.?!\n'.includes(previousCharacter)) {
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
    } else if (document.activeElement.matches('#textarea-container.ytve-lightweight-textarea > pre + textarea')) {
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
