const form = document.getElementById("form");
const searchInput = document.getElementById("search");
const replaceInput = document.getElementById("replace");
const preprocessButton = document.getElementById("preprocessButton");

form.onsubmit = function(element) {
  // Don't reload the page when submitting the form
  element.preventDefault();

  // Get input values from the form and send them to the contentScript
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const searchExpression = searchInput.value;
    const replacementExpression = replaceInput.value;

    chrome.tabs.sendMessage(tabs[0].id, { searchExpression, replacementExpression }, function(response) {
      // Clean up the inputs so you can immediately do another search/replace without touching the mouse at all!
      searchInput.value = "";
      replaceInput.value = "";
      searchInput.focus();
    });
  });
};

preprocessButton.onclick = function(element) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { preprocess: true });
  });
};
