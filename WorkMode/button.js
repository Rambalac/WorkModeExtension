var dummyUrl = chrome.extension.getURL("dummy.png");

var tabs = {};

chrome.storage.local.get(function (localStorage) {
  tabs = localStorage.tabs || {};

  chrome.windows.getAll({ populate: true }, function (windows) {
    var newtabs = {};
    windows.ForEach(function (win) {
      win.tabs.ForEach(function (tab) {
        if (tabs[tab.id] === true) newtabs[tab.id] = true;
      });
    });
    tabs = newtabs;
    chrome.storage.local.set({ tabs: tabs });
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
  var tab = sender.tab;
  //alert(tab.id);
  if (tabs[tab.openerTabId] === true) {
    tabs[tab.id] = true;
    chrome.storage.local.set({ tabs: tabs });
  }
  if (tabs[tab.id] === true) {
    chrome.browserAction.setBadgeText({ text: "on", tabId: tab.id });
    callback(tab.id);
  }
});

chrome.browserAction.onClicked.addListener(function (tab) {
  //alert(tab.id);
  var state = tabs[tab.id] || false;
  state = !state;

  if (state === true)
    tabs[tab.id] = true;
  else
    delete tabs[tab.id];
  chrome.storage.local.set({ tabs: tabs });

  if (state === true) {
    chrome.browserAction.setBadgeText({ text: "on", tabId: tab.id });
    chrome.tabs.executeScript({
      code: "workmodeon(" + tab.id + ");"
    });
    tab.onRemoved.addListener(function (tabid, removeInfo) {
      alert(1);
      delete tabs[tabid];
      chrome.storage.local.set({ tabs: tabs });
    });
  }
  else {
    chrome.browserAction.setBadgeText({ text: "", tabId: tab.id });
    chrome.tabs.executeScript({
      code: "workmodeoff();"
    });
  }
});

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      if (tabs[details.tabId] !== true) return;
      return { redirectUrl: dummyUrl };
    },
    {
      urls: ["<all_urls>"],
      types: ["image"]
    },
    ["blocking"]);
