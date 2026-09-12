/* ISHAARA extension — background service worker */
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "ISHAARA_TOGGLE" }).catch(() => {
    /* no content script on this page yet */
  });
});