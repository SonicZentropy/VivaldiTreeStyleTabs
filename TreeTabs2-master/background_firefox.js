// QUANTUM

let date1;
let date2;
let diff;

function QuantumStart() {
    chrome.storage.local.get(null, function(storage) {
        chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(w) {

            let windows_data = {};
            let tabs_data = {};

            for (let win of w) {
                Promise.resolve(browser.sessions.getWindowValue(win.id, 'TTdata')).then(function(WindowData) {
                    windows_data[win.id] = WindowData;
                    for (let tab of win.tabs) {
                        Promise.resolve(browser.sessions.getTabValue(tab.id, 'TTdata')).then(function(TData) {
                            if (TData != undefined) b.tt_ids[TData.ttid] = tab.id;
                            tabs_data[tab.id] = TData;
                        });
                    }
                });
            }

            setTimeout(function() {

                // LOAD PREFERENCES
                Preferences_GetCurrentPreferences(storage);

                // CACHED COUNTS AND STUFF
                let tabs_matched = 0;
                let tabs_count = 0;

                for (let win of w) {
                    tabs_count += win.tabs.length;
                }

                let lastWinId = w[w.length - 1].id;
                let lastTabId = w[w.length - 1].tabs[w[w.length - 1].tabs.length - 1].id;

                if (storage.debug_log != undefined) b.debug = storage.debug_log;
                pushlog('background_firefox.js: Firefox Start ------------------------------------------------------------------------------------------------------------- ');

                for (let win of w) {

                    // LOAD TTID FROM FIREFOX GET WINDOW VALUE
                    if (opt.skip_load == false && windows_data[win.id] != undefined) {
                        b.windows[win.id] = Object.assign({}, windows_data[win.id]);
                    } else {
                        QuantumAppendWinTTId(win.id);
                    }

                    for (let tab of win.tabs) {
                        // LOAD TTID FROM FIREFOX GET TAB VALUE
                        if (opt.skip_load == false && tabs_data[tab.id] != undefined) {
                            b.tabs[tab.id] = Object.assign({}, tabs_data[tab.id]);
                            tabs_matched++;
                        } else {
                            QuantumAppendTabTTId(tab);
                        }
                        if (tab.active) b.windows[win.id].activeTabId = tab.id;
                    }
                }

                // OK, DONE, NOW REPLACE OLD PARENTS IDS WITH THIS SESSION IDS
                for (let tabId in b.tabs) {
                    if (b.tt_ids[b.tabs[tabId].parent] != undefined) {
                        b.tabs[tabId].parent = b.tt_ids[b.tabs[tabId].parent]; // is tab
                    } else {
                        b.tabs[tabId].parent = b.tabs[tabId].parent; // is not tab
                    }
                }

                // OK, SAME THING FOR ACTIVE TABS IN GROUPS
                for (let winId in b.windows) {
                    for (let group in b.windows[winId].groups) {
                        if (b.tt_ids[b.windows[winId].groups[group].active_tab] != undefined) b.windows[winId].groups[group].active_tab = b.tt_ids[b.windows[winId].groups[group].active_tab];
                        if (b.tt_ids[b.windows[winId].groups[group].prev_active_tab] != undefined) b.windows[winId].groups[group].prev_active_tab = b.tt_ids[b.windows[winId].groups[group].prev_active_tab];
                    }
                }

                pushlog('background_firefox.js: ' + arguments.callee.name + ' tabs_matched = ' + tabs_matched + ' tabs_count = ' + tabs_count);
                if (opt.skip_load == false && tabs_matched < tabs_count * 0.5) {
                    b.safe_mode = true;
                    if (opt.debug) pushlog('started in safe mode: tabs_matched = ' + tabs_matched + ': tabs_count = ' + tabs_count);
                    SafeModeCheck();
                    // SAFE MODE IS DISABLED AFTER 10 MINUTES
                    setTimeout(function() {
                        b.safe_mode = false;
                    }, 600000);

                }

                b.bg_running = true;
                QuantumAutoSaveData();
                QuantumStartListeners();
                delete DefaultToolbar;
                delete DefaultTheme;
                delete DefaultPreferences;
                delete DefaultMenu;
                chrome.runtime.sendMessage({ command: 'bg_started' });

                if (opt.debug) pushlog('QuantumStart, Current windows count is: ' + w.length + ' Current tabs count is: ' + tabs_count + ' Matching tabs: ' + tabs_matched);

            }, 1000);
        });
    });
}

// save every second if there is anything to save obviously
async function QuantumAutoSaveData() {
    setInterval(function() {
        if (b.schedule_save > 1) b.schedule_save = 1;
        if (b.safe_mode == false && b.bg_running && b.schedule_save > 0 && Object.keys(b.tabs).length > 1) {
            chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(w) {
                for (let win of w) {
                    if (b.windows[win.id] != undefined) {
                        if (b.windows[win.id].ttid != undefined && b.windows[win.id].group_bar != undefined && b.windows[win.id].search_filter != undefined && b.windows[win.id].active_shelf != undefined && b.windows[win.id].active_group != undefined && b.windows[win.id].groups != undefined && b.windows[win.id].folders != undefined) {
                            let windowData = Object.assign({}, b.windows[win.id]);
                            for (let groupId in b.windows[win.id].groups) {
                                if (b.tabs[b.windows[win.id].groups[groupId].active_tab]) windowData.groups[groupId].active_tab = b.tabs[b.windows[win.id].groups[groupId].active_tab].ttid;
                                if (b.tabs[b.windows[win.id].groups[groupId].prev_active_tab]) windowData.groups[groupId].prev_active_tab = b.tabs[b.windows[win.id].groups[groupId].prev_active_tab].ttid;
                            }
                            browser.sessions.setWindowValue(win.id, 'TTdata', windowData);
                        }
                    } else {
                        QuantumAppendWinTTId(win.id);
                    }

                    for (let tab of win.tabs) {
                        if (b.tabs[tab.id] != undefined) {
                            if (b.tabs[tab.id].ttid != undefined && b.tabs[tab.id].parent != undefined && b.tabs[tab.id].index != undefined && b.tabs[tab.id].expand != undefined) {
                                browser.sessions.setTabValue(tab.id, 'TTdata', { ttid: b.tabs[tab.id].ttid, parent: (b.tabs[b.tabs[tab.id].parent] ? b.tabs[b.tabs[tab.id].parent].ttid : b.tabs[tab.id].parent), index: b.tabs[tab.id].index, expand: b.tabs[tab.id].expand });
                            } else {
                                QuantumAppendTabTTId(tab);
                            }
                        }
                    }
                }
                b.schedule_save--;
            });
        }
        if (opt.debug == true) chrome.storage.local.set({ debug_log: b.debug });
    }, 1000);
}

function QuantumGenerateNewWindowID() {
    let newID = '';
    while (newID == '') {
        newID = 'w_' + GenerateRandomID();
        for (let wId in b.windows) {
            if (wId == newID) newID = '';
        }
    }
    return newID;
}

function QuantumGenerateNewTabID() {
    let newID = '';
    while (newID == '') {
        newID = 't_' + GenerateRandomID();
        for (let tId in b.tabs) {
            if (tId == newID) newID = '';
        }
    }
    return newID;
}

function QuantumAppendTabTTId(tab) {
    let NewTTTabId = QuantumGenerateNewTabID();
    if (b.tabs[tab.id] != undefined) {
        b.tabs[tab.id].ttid = NewTTTabId;
    } else {
        b.tabs[tab.id] = { ttid: NewTTTabId, parent: (b.windows[tab.windowId] ? b.windows[tab.windowId].active_group : 'tab_list'), index: tab.index, expand: '' };
    }
    b.tt_ids[NewTTTabId] = tab.id;
    return NewTTTabId;
}

function QuantumAppendWinTTId(windowId) {
    let NewTTWindowId = QuantumGenerateNewWindowID();
    if (b.windows[windowId] != undefined) {
        b.windows[windowId].ttid = NewTTWindowId;
    } else {
        b.windows[windowId] = { activeTabId: 0, ttid: NewTTWindowId, group_bar: opt.groups_toolbar_default, search_filter: 'url', active_shelf: '', active_group: 'tab_list', groups: { tab_list: { id: 'tab_list', index: 0, active_tab: 0, prev_active_tab: 0, name: labels.ungrouped_group, font: '' } }, folders: {} };
    }
}


function QuantumStartListeners() {
    // ---------------------------------------------     onClicked     ---------------------------------------------
    browser.browserAction.onClicked.addListener(function() {
        browser.sidebarAction.setPanel({ panel: (browser.extension.getURL('/sidebar.html')) });
        browser.sidebarAction.open();
    });
    // ---------------------------------------------     onCreated     ---------------------------------------------
    chrome.tabs.onCreated.addListener(function(tab) {
        if (b.windows[tab.windowId] == undefined) {
            QuantumAppendWinTTId(tab.windowId);
        }
        let prevActiveTabId = b.windows[tab.windowId].activeTabId;
//        let t = Promise.resolve(browser.sessions.getTabValue(tab.id, 'TTdata')).then(function(TabData) {
//            if (TabData != undefined) {
//                b.tabs[tab.id] = Object.assign({}, TabData);
//                let originalParent = b.tt_ids[TabData.parent] ? b.tt_ids[TabData.parent] : TabData.parent;
//                let AfterId = undefined;
//                let append = undefined;
//                if (originalParent) {
//                    let originalParentChildren = GetChildren(b.tabs, originalParent);
//                    if (TabData.index > 0 && TabData.index < originalParentChildren.length) {
//                        for (let i = TabData.index + 1; i < originalParentChildren.length; i++) { // shift next siblings indexes
//                            b.tabs[originalParentChildren[i]].index += 1;
//                        }
//                        AfterId = originalParentChildren[TabData.index];
//                    }
//                    if (TabData.index == 0) {
//                        append = false;
//                    }
//                    if (TabData.index > originalParentChildren.length) {
//                        append = true;
//                    }
//                }
//                chrome.runtime.sendMessage({ command: 'tab_created', windowId: tab.windowId, tabId: tab.id, tab: tab, ParentId: originalParent, InsertAfterId: AfterId, Append: append });
//            } else {
                QuantumAppendTabTTId(tab);
                chrome.tabs.get(tab.id, function(NewTab) { // get tab again as reported tab's url is empty! Also for some reason firefox sends tab with 'active == false' even if tab is active (THIS IS POSSIBLY A NEW BUG IN FF 60!)
                    if (NewTab) {
                        OnMessageTabCreated(NewTab, prevActiveTabId);
                    }
                });
//            }
//        });
    });
    // ---------------------------------------------     onAttached     ---------------------------------------------
    chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
        let oldId = tabId;
        chrome.tabs.get(oldId, function(tab) {
            ReplaceParents(oldId, tab.id);
            chrome.runtime.sendMessage({ command: 'tab_attached', windowId: attachInfo.newWindowId, tab: tab, tabId: tab.id, ParentId: b.tabs[tab.id].parent });
            b.schedule_save++;
        });
    });

    // ---------------------------------------------     onDetached     ---------------------------------------------
    chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
        chrome.runtime.sendMessage({ command: 'tab_detached', windowId: detachInfo.oldWindowId, tabId: tabId });
    });

    // ---------------------------------------------     onRemoved     ---------------------------------------------
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        // if (b.windows[removeInfo.windowId].activeTabId == tabId) {
        // chrome.runtime.sendMessage({command: 'switch_active_tab', windowId: removeInfo.windowId, tabId: tabId});
        // }
        let SiblingTabs = GetChildren(b.tabs, b.tabs[tabId].parent);
        let SiblingFolders = GetChildren(b.windows[removeInfo.windowId].folders, b.tabs[tabId].parent);
        UnshiftChildrenIndexes(SiblingTabs, b.tabs[tabId].index, SiblingFolders, removeInfo.windowId);
        if (b.EmptyTabs.indexOf(tabId) != -1) {
            b.EmptyTabs.splice(b.EmptyTabs.indexOf(tabId), 1);
        }
        setTimeout(function() {
            chrome.runtime.sendMessage({ command: 'tab_removed', windowId: removeInfo.windowId, tabId: tabId });
        }, 5);
        delete b.tabs[tabId];
        b.schedule_save++;
    });
    // ---------------------------------------------     onUpdated     ---------------------------------------------
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.pinned == true) {
            if (b.tabs[tabId]) {
                b.tabs[tabId].parent = 'pin_list';
                b.schedule_save++;
            }
        }
        if (changeInfo.pinned == false) {
            if (b.tabs[tabId]) {
                b.tabs[tabId].parent = 'tab_list';
                b.schedule_save++;
            }
        }

        if (opt.debug) pushlog('QuantumStart, onUpdated: changeInfo = ' + JSON.stringify(changeInfo));

        if (opt.move_tabs_on_url_change == 'always' || ((opt.move_tabs_on_url_change == 'from_empty' || opt.move_tabs_on_url_change == 'from_empty_b') && b.EmptyTabs.indexOf(tabId) != -1)) {
            chrome.tabs.get(tabId, function(tab2) {
                if (tab2.url != undefined) {
                    if (tab2.pinned == false) {
                        if (opt.move_tabs_on_url_change == 'always' ) {
                            date2 = new Date();
                            if (date1 == undefined || date1 - date2 > 3) {
                              if (opt.debug) pushlog('QuantumStart, onActivated: About to look for regex matches');
                                AppendTabToGroupOnRegexMatch(tabId, tab2.windowId, tab2.url);
                            }
                        }
                    }
                }
            });
            if (changeInfo.url != b.newTabUrl && b.EmptyTabs.indexOf(tabId) != -1) {
                b.EmptyTabs.splice(b.EmptyTabs.indexOf(tabId), 1);
            }
        }
        if (changeInfo.title != undefined && !tab.active) {
            chrome.runtime.sendMessage({ command: 'tab_attention', windowId: tab.windowId, tabId: tabId });
        }
        chrome.runtime.sendMessage({ command: 'tab_updated', windowId: tab.windowId, tab: tab, tabId: tabId, changeInfo: changeInfo });
    });

    // ---------------------------------------------     onReplaced     ---------------------------------------------
    chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
        chrome.tabs.get(addedTabId, function(tab) {
            if (addedTabId == removedTabId) {
                chrome.runtime.sendMessage({ command: 'tab_updated', windowId: tab.windowId, tab: tab, tabId: tab.id, changeInfo: { status: tab.status, url: tab.url, title: tab.title, audible: tab.audible, mutedInfo: tab.mutedInfo } });
            } else {
                if (b.tabs[removedTabId]) {
                    b.tabs[addedTabId] = b.tabs[removedTabId];
                }
                ReplaceParents(tabId, tab.id);
                chrome.runtime.sendMessage({ command: 'tab_removed', windowId: tab.windowId, tabId: removedTabId });
                chrome.runtime.sendMessage({ command: 'tab_attached', windowId: tab.windowId, tab: tab, tabId: addedTabId, ParentId: b.tabs[addedTabId].parent });
                // delete ttid[b.tabs[removedTabId].ttid];
                // delete b.tabs[removedTabId];
            }
            setTimeout(function() {
                QuantumAppendTabTTId(tab);
                b.schedule_save++;
            }, 100);

        });
    });
    // ---------------------------------------------     onActivated     ---------------------------------------------
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        if (b.windows[activeInfo.windowId]) {
            b.windows[activeInfo.windowId].activeTabId = activeInfo.tabId;
        }

        if (opt.debug) pushlog('QuantumStart, onActivated: activeInfo = ' + JSON.stringify(activeInfo));

        if (activeInfo.tabId != undefined) {
          chrome.tabs.get(activeinfo.tabId, function(tab) {
              if (tab.url != undefined) {
                  if (tab.pinned == false) {
                      if (opt.move_tabs_on_url_change == 'always' ) {
                          date2 = new Date();
                          if (date1 == undefined || date1 - date2 > 3) {
                            if (opt.debug) pushlog('QuantumStart, onActivated: About to look for regex matches');
                              AppendTabToGroupOnRegexMatch(tab.tabId, tab.windowId, tab.url);
                              date1 = new Date();
                          }
                      }
                  }
              }
          });
        }

        chrome.runtime.sendMessage({ command: 'tab_activated', windowId: activeInfo.windowId, tabId: activeInfo.tabId });
        b.schedule_save++;
    });
    // ---------------------------------------------     onCreated (for windows)    ---------------------------------------------
    chrome.windows.onCreated.addListener(function(window) {
        let win = Promise.resolve(browser.sessions.getWindowValue(window.id, 'TTdata')).then(function(WindowData) {
            if (WindowData != undefined) {
                b.windows[window.id] = Object.assign({}, WindowData);
            } else {
                QuantumAppendWinTTId(window.id);
            }
            b.schedule_save++;
        });
    });

    // ---------------------------------------------     onRemoved (for windows)     ---------------------------------------------
    chrome.windows.onRemoved.addListener(function(windowId) {
        delete b.windows[windowId];
        b.schedule_save++;
    });
}