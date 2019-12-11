function replace(searchExpression, replacementExpression) {
  let lastTestAreaModified;
  console.log(`Replacing ${searchExpression} by ${replacementExpression}...`);

  [...document.querySelectorAll("textarea")].forEach(function(textArea) {
    // We use a RegExp to replace *all* occurences of the searched expression
    const searchRegExp = new RegExp(searchExpression, "g");
    
    if (searchRegExp.test(textArea.textContent)) {
      textArea.textContent = textArea.value = textArea.textContent.replace(searchRegExp, replacementExpression);
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
 * We generate a fake event, as if we typed on the keyboard within a textarea to
 * modify a caption. This is needed to trigger the JavaScript code that handles
 * updates and autosave the new content in the online editor.
 */
function dispatchFakeEvent(element) {
  const event = new InputEvent("input", {
    bubbles: true,
    cancelBubble: false,
    cancelable: false,
    composed: true,
    currentTarget: null,
    data: "a",
    dataTransfer: null,
    defaultPrevented: false,
    detail: 0,
    eventPhase: 0,
    inputType: "insertText",
    isComposing: false,
    isTrusted: false,
    returnValue: true,
    sourceCapabilities: null,
    srcElement: element,
    target: element,
    view: null,
    which: 0
  });

  element.dispatchEvent(event);
}

/**
 * Listen to requests coming from the popup form
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const {searchExpression, replacementExpression} = request;
  
  if (searchExpression && replacementExpression) {
    replace(searchExpression, replacementExpression);
  }

  if (request.preprocess) {
    console.log("Preprocessing your favorite words...");
    const preprocessWordsList = [
      ["visual studio code", "Visual Studio Code"],
      ["vs code", "VSCode"],
      ["javascript", "JavaScript"]
    ];
    preprocessWordsList.forEach(([searchExpression, replacementExpression]) => replace(searchExpression, replacementExpression));
  }

  sendResponse({ data: "done" });
  return true;
});
