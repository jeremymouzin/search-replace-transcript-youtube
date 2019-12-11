/* global document, chrome */

const form = document.getElementById('form');
const searchInput = document.getElementById('search');
const replaceInput = document.getElementById('replace');
const preprocessButton = document.getElementById('preprocessButton');

form.onsubmit = (element) => {
  // Don't reload the page when submitting the form
  element.preventDefault();

  // Get input values from the form and send them to the content-script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const searchExpression = searchInput.value;
    const replacementExpression = replaceInput.value;

    chrome.tabs.sendMessage(tabs[0].id, { searchExpression, replacementExpression }, () => {
      // Clean up the inputs so you can immediately do another search/replace without touching the mouse at all!
      searchInput.value = '';
      replaceInput.value = '';
      searchInput.focus();
    });
  });
};

preprocessButton.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { preprocess: true });
  });
};
