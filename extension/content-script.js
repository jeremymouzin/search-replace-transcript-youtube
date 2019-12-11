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

function replace(searchExpression, replacementExpression) {
  let lastTestAreaModified;

  [...document.querySelectorAll('textarea')].forEach((textArea) => {
    // We use a RegExp to replace *all* occurences of the searched expression
    const searchRegExp = new RegExp(searchExpression, 'g');
    const originalText = textArea.textContent;

    if (searchRegExp.test(originalText)) {
      const newReplacedExpression = originalText.replace(searchRegExp, replacementExpression);
      textArea.textContent = newReplacedExpression;
      textArea.value = newReplacedExpression;
      lastTestAreaModified = textArea;
    }
  });

  // We dispatch an event only when we have at least a match
  if (lastTestAreaModified) {
    dispatchFakeEvent(lastTestAreaModified);
  }
}

// This is the hook for unit testing with Jest
// The module object is not defined when running the extension in Chrome. To avoid
// any issue, we execute the affectation only when we run the tests (ie when module is defined).
if (typeof module !== 'undefined') {
  module.exports = replace;
}

/**
 * Listen to requests coming from the popup form
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { searchExpression, replacementExpression } = request;

  if (searchExpression && replacementExpression) {
    replace(searchExpression, replacementExpression);
  }

  if (request.preprocess) {
    const preprocessWordsList = [
      ['visual studio code', 'Visual Studio Code'],
      ['vs code', 'VSCode'],
      ['javascript', 'JavaScript'],
    ];
    preprocessWordsList.forEach(([wordsToSearchFor, replacement]) => replace(wordsToSearchFor, replacement));
  }

  sendResponse({ data: 'done' });
  return true;
});
