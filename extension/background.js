/* global chrome */
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlMatches: 'https://studio.youtube.com/(channel|video)/.*/translations.*' },
      }),
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    }]);
  });
});
