// Kedy Chrome Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({
    enabled: true,
    catSize: 140,
    catColor: '#322d35',
    eyeColor: '#ffffff',
    showLedge: true,
    laserMode: false,
    soundEnabled: true,
    position: 'bottom-right'
  }, (items) => {
    chrome.storage.sync.set(items);
  });
});
