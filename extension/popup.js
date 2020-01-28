/* global document, chrome */

const form = document.getElementById('form');
const searchInput = document.getElementById('search');
const replaceInput = document.getElementById('replace');
const caseInsensitiveSearch = document.getElementById('insensitive-search');
const preprocessButton = document.getElementById('preprocess-button');

form.onsubmit = (event) => {
  // 🇫🇷 Ne pas recharger la page lorsqu'on soumet le formulaire
  // 🇬🇧 Don't reload the page when submitting the form
  event.preventDefault();
  
  // 🇫🇷 Récupère les valeurs du formulaire et envoie-les au content-script
  // 🇬🇧 Get input values from the form and send them to the content-script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const searchExpression = searchInput.value;
    const replacementExpression = replaceInput.value;
    const options = {
      insensitiveSearch: caseInsensitiveSearch.checked,
    };

    chrome.tabs.sendMessage(tabs[0].id, { searchExpression, replacementExpression, options }, () => {
      // 🇫🇷 UX: Efface les inputs pour pouvoir faire immédiatement une autre recherche sans toucher la souris du tout !
      // 🇬🇧 UX: Clean up the inputs so you can immediately do another search/replace without touching the mouse at all!
      searchInput.value = '';
      replaceInput.value = '';
      searchInput.focus();
    });
  });
};

preprocessButton.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const options = {
      insensitiveSearch: caseInsensitiveSearch.checked,
    };
    chrome.tabs.sendMessage(tabs[0].id, { preprocess: true, options });
  });
};
