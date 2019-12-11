/* global chrome */
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlMatches: 'https://www.youtube.com/timedtext_editor.*edit_id.*' },
      }),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()],
    }]);
  });
});
