/* global document, chrome, InputEvent */

/**
 * We generate a fake event, as if we typed on the keyboard within a textarea to
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

function searchAndReplace(captionsList, searchExpression, replacementExpression) {
  let lastTextAreaModified;

  const updatedCaptionsList = captionsList.map((textArea) => {
    // Manage the search of a several words expression on multiple lines
    const robustSearchExpression = searchExpression.replace(/ /g, '([ \\n])*');
    let robustReplacementExpression = replacementExpression;

    // We use a RegExp to replace *all* occurences of the searched expression
    let searchRegExp = new RegExp(`\\b${robustSearchExpression}\\b`, 'g');
    const originalText = textArea.value;

    const result = searchRegExp.exec(originalText);
    if (result !== null) {
      const match = result[0];
      /**
       * If it's several words on different lines, manage the new line correctly
       * and include any trailing char that is not a space (like a comma, a dot etc.)
       */
      if (match.includes('\n')) {
        const trailingChar = originalText[searchRegExp.lastIndex];

        if (trailingChar !== ' ') {
          robustReplacementExpression += trailingChar;
        }
        robustReplacementExpression += '\n';
        searchRegExp = new RegExp(`\\b${robustSearchExpression}${trailingChar}[ ]*`, 'g');
      }

      const newReplacedExpression = originalText.replace(searchRegExp, robustReplacementExpression);

      // Update textarea inputs values
      textArea.textContent = newReplacedExpression;
      textArea.value = newReplacedExpression;

      // Store the last modified item to dispatch the fake event on it
      lastTextAreaModified = textArea;

      return newReplacedExpression;
    }

    return originalText;
  });

  // We dispatch an event only when we have at least a match
  if (lastTextAreaModified) {
    dispatchFakeEvent(lastTextAreaModified);
  }

  return updatedCaptionsList;
}

// This is the hook for unit testing with Jest
// The module object is not defined when running the extension in Chrome. To avoid
// any issue, we execute the affectation only when we run the tests (ie when module is defined).
if (typeof module !== 'undefined') {
  module.exports = searchAndReplace;
}

/**
 * Listen to requests coming from the popup form
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { searchExpression, replacementExpression } = request;

  const captionsList = [...document.querySelectorAll('textarea')];

  if (searchExpression && replacementExpression) {
    searchAndReplace(captionsList, searchExpression, replacementExpression);
  }

  if (request.preprocess) {
    const preprocessWordsList = [
      ['visual studio code', 'Visual Studio Code'],
      ['vs code', 'VSCode'],
      ['javascript', 'JavaScript'],
    ];
    preprocessWordsList.forEach(([wordsToSearchFor, replacement]) => searchAndReplace(wordsToSearchFor, replacement));
  }

  sendResponse({ data: 'done' });
  return true;
});
