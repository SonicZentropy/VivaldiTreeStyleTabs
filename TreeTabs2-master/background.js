// BACKGROUND VARIABLES

let b = {
    debug: [],
    bg_running: false,
    schedule_save: 0,
    windows: {},
    tabs: {},
    tt_ids: {},
    EmptyTabs: [],
    newTabUrl: browserId == 'F' ? 'about:newtab' : 'chrome://startpage/',
    safe_mode: false
};

// BACKGROUND FUNCTIONS

async function pushlog(log) {
  let myDate = new Date();
  await b.debug.push(myDate.toLocaleString('en-US', { timeZone: 'America/Detroit' }) + ' - ' + log);
  if (b.debug.length > 1000) await b.debug.splice(0, 1);
  await console.log(myDate.toLocaleString('en-US', { timeZone: 'America/Detroit' }) + ' - ' + log);
  b.schedule_save++;
}

async function clearlog() {
  b.debug = [];
  if (b.debug.length > 1) await b.debug.splice(0, 1000);
  chrome.storage.local.set({debug_log: {}});
}

function ReplaceParents(oldTabId, newTabId) {
    for (let tabId in b.tabs) {
        if (b.tabs[tabId].parent == oldTabId) b.tabs[tabId].parent = newTabId;
    }
}

async function DiscardTab(tabId) {
    let DiscardTimeout = 0;
    let Discard = setInterval(function() {
        chrome.tabs.get(tabId, function(tab) {
            if ((tab.favIconUrl != undefined && tab.favIconUrl != '' && tab.title != undefined && tab.title != '') || tab.status == 'complete' || tab.audible) {
                chrome.tabs.discard(tab.id);
                clearInterval(Discard);
            }
            if (DiscardTimeout > 300) clearInterval(Discard);
        });
        DiscardTimeout++;
    }, 2000);
}

async function DiscardWindow(windowId) {
    let DiscardTimeout = 0;
    let DiscardedTabs = 0;
    let Discard = setInterval(function() {
        chrome.windows.get(windowId, { populate: true }, function(w) {
            for (let i = 0; i < w.tabs.length; i++) {
                if (w.tabs[i].discarded == false && w.tabs[i].active == false) {
                    if ((w.tabs[i].favIconUrl != undefined && w.tabs[i].favIconUrl != '' && w.tabs[i].title != undefined && w.tabs[i].title != '') || w.tabs[i].status == 'complete' || tab.audible) {
                        chrome.tabs.discard(w.tabs[i].id);
                        DiscardedTabs++;
                    }
                }
            }
            if (DiscardedTabs == w.tabs.length) clearInterval(Discard);
        });
        if (DiscardTimeout > 300) clearInterval(Discard);
        DiscardTimeout++;
    }, 5000);
}

function GetTabGroupId(tabId, windowId) {
    let groupId = 'tab_list';
    if (tabId == undefined || windowId == undefined || b.windows[windowId] == undefined || b.tabs[tabId] == undefined) return groupId;
    let parent = b.tabs[tabId].parent;
    while (parent) {
        if (isNaN(parent) == false && b.tabs[parent]) {
            parent = b.tabs[parent].parent;
        } else {
            if (parent.match('tab_list|g_|f_') == null && b.tabs[parent]) {
                parent = b.tabs[parent].parent;
            } else {
                if (parent.match('f_') != null && b.windows[windowId].folders[parent]) {
                    parent = b.windows[windowId].folders[parent].parent;
                } else {
                    if (parent.match('pin_list|tab_list|g_') != null) {
                        groupId = parent;
                        parent = false;
                    } else {
                        parent = false;
                    }
                }
            }
        }
    }
    return groupId;
}

function GetTabParents(tabId, windowId) {
    let Parents = [];
    if (tabId == undefined) return Parents;
    if (b.tabs[tabId] == undefined) return Parents;
    let parent = b.tabs[tabId].parent;
    let escape = 9999;
    while (escape > 0 && (b.tabs[parent] != undefined || b.windows[windowId].folders[parent])) {
        if (b.tabs[parent]) {
            Parents.push(parent);
            parent = b.tabs[parent].parent;
        } else {
            if (b.windows[windowId].folders[parent]) {
                Parents.push(parent);
                parent = b.windows[windowId].folders[parent].parent;
            }
        }
        escape--;
    }
    return Parents;
}

function GetChildren(TTObj, parentId) { // TTObj is b.tabs or b.windows[winId].folders
    let Children = [];
    for (let Id in TTObj) {
        if (TTObj[Id].parent == parentId) Children.push(Id);
    }
    return Children;
}

function ShiftChildrenIndexes(TabsIdsArray, OpenerIndex, folderIdsArray, windowId) {
    for (let tabId of TabsIdsArray) { // shift indexes of siblings tabs
        if (b.tabs[tabId].index > OpenerIndex) b.tabs[tabId].index += 1;
    }
    for (let folderId of folderIdsArray) { // shift indexes of siblings folders
        if (b.windows[windowId].folders[folderId].index > OpenerIndex) b.windows[windowId].folders[folderId].index += 1;
    }
}

function UnshiftChildrenIndexes(TabsIdsArray, ClosedIndex, folderIdsArray, windowId) {
    for (let tabId of TabsIdsArray) { // shift indexes of siblings tabs
        if (b.tabs[tabId].index > ClosedIndex) b.tabs[tabId].index -= 1;
    }
    for (let folderId of folderIdsArray) { // shift indexes of siblings folders
        if (b.windows[windowId].folders[folderId].index > ClosedIndex) b.windows[windowId].folders[folderId].index -= 1;
    }
}

async function AppendTabToGroupOnRegexMatch(tabId, windowId, url) {
    if (b.debug) pushlog('background.js: ' + arguments.callee.name + ': tabId = ' + tabId + ': URL = ' + url);
    let TabGroupId = GetTabGroupId(tabId, windowId);
    for (let i = 0; i < opt.tab_group_regexes.length; i++) {
        let regexPair = opt.tab_group_regexes[i];
        if (url.match(regexPair[0])) {
            let groupId = FindGroupIdByName(regexPair[1], b.windows[windowId].groups);
            let groupName = regexPair[1];
            if (b.debug) pushlog('background.js: ' + arguments.callee.name + ': tabId = ' + tabId + ': groupId = ' + groupId + ': URL matches');
            if (groupId === null) {
                if (b.debug) pushlog('background.js: ' + arguments.callee.name + ': about to create new group for regex');
                let newGroupID = '';
                while (newGroupID == '') {
                    newGroupID = 'g_' + GenerateRandomID();
                    for (let wId in b.windows) {
                        for (let gId in b.windows[wId].groups) {
                            if (gId == newGroupID) newGroupID = '';
                        }
                    }
                }
                if (b.debug) pushlog('background.js: ' + arguments.callee.name + ': creating new group with groupName = ' + groupName);
                    chrome.runtime.sendMessage({ command: 'append_group', groupName: groupName, font_color: '' });
                let groupId = FindGroupIdByName(groupName, b.windows[windowId].groups);
            }
            if (b.debug) pushlog('background.js: ' + arguments.callee.name + ': URL matches: TabGroupId = ' + TabGroupId + ': groupId = ' + groupId);
            if (TabGroupId != groupId && groupId != null) {
                b.tabs[tabId].parent = groupId;
                setTimeout(function() {
                    chrome.runtime.sendMessage({ command: 'append_tab_to_group', tabId: tabId, groupId: groupId });
                    Groups_SaveGroups();
                }, 100);
            }
            break;
        }
    }
    return b.tabs[tabId].parent;
}

function FindGroupIdByName(name, groups) {
    for (let groupId in groups) {
        if (!groups.hasOwnProperty(groupId)) continue;
        if (groups[groupId].name === name) return groupId;
    }
    return null;
}


// LISTENERS
function StartBackgroundListeners() {
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.command == 'is_bg_ready') {
            sendResponse(b.bg_running);
            return;
        }
        if (message.command == 'is_bg_safe_mode') {
            sendResponse(b.safe_mode);
            return;
        }
        if (message.command == 'reload') {
            window.location.reload();
            return;
        }
        if (message.command == 'reload_options') {
            opt = Object.assign({}, message.opt);
            return;
        }
        if (message.command == 'get_windows') {
            sendResponse(b.windows);
            return;
        }
        if (message.command == 'get_folders') {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].folders);
            }
            return;
        }
        if (message.command == 'save_folders') {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].folders = Object.assign({}, message.folders);
                b.schedule_save++;
            }
            return;
        }
        if (message.command == 'get_groups') {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].groups);
            }
            return;
        }
        if (message.command == 'save_groups') {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].groups = Object.assign({}, message.groups);
                b.schedule_save++;
            }
            return;
        }
        if (message.command == 'set_active_group') {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].active_group = message.active_group;
                b.schedule_save++;
            }
            return;
        }
        if (message.command == 'get_active_group') {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].active_group);
            }
            return;
        }
        if (message.command == 'set_search_filter') {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].search_filter = message.search_filter;
                b.schedule_save++;
            }
            return;
        }
        if (message.command == 'get_search_filter') {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].search_filter);
            }
            return;
        }
        if (message.command == 'set_active_shelf') {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].active_shelf = message.active_shelf;
                b.schedule_save++;
            }
            return;
        }
        if (message.command == 'get_active_shelf') {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].active_shelf);
            }
            return;
        }
        if (message.command == 'set_group_bar') {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].group_bar = message.group_bar;
                b.schedule_save++;
            }
            return;
        }
        if (message.command == 'get_group_bar') {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].group_bar);
            }
            return;
        }
        if (message.command == 'get_browser_tabs') {
            sendResponse(b.tabs);
            return;
        }
        if (message.command == 'update_tab') {
            if (b.tabs[message.tabId]) {
                if (message.tab.index) {
                    b.tabs[message.tabId].index = message.tab.index;
                }
                if (message.tab.expand) {
                    b.tabs[message.tabId].expand = message.tab.expand;
                }
                if (message.tab.parent) {
                    b.tabs[message.tabId].parent = message.tab.parent;
                }
                b.schedule_save++;
            }
            return;
        }
        if (message.command == 'update_all_tabs') {
            for (let pin of message.pins) {
                if (b.tabs[pin.id]) {
                    b.tabs[pin.id].parent = 'pin_list';
                    b.tabs[pin.id].expand = '';
                    b.tabs[pin.id].index = pin.index;
                }
            }
            for (let tab of message.tabs) {
                if (b.tabs[tab.id]) {
                    b.tabs[tab.id].parent = tab.parent;
                    b.tabs[tab.id].expand = tab.expand;
                    b.tabs[tab.id].index = tab.index;
                }
            }
            b.schedule_save++;
            return;
        }
        if (message.command == 'all_tabs_exist') {
            let yes = true;
            for (let Win in message.windows) {
                for (let Tab in message.windows[Win].tabs) {
                    if (b.tabs[message.windows[Win].tabs[Tab].id] == undefined) {
                        yes = false;
                    }
                }
            }
            sendResponse(yes);
            return;
        }
        if (message.command == 'does_tabs_match') {
            let match = true;
            for (let Win in message.windows) {
                for (let Tab in message.windows[Win].tabs) {
                    if (b.tabs[message.windows[Win].tabs[Tab].id] != undefined) {
                        if (message.windows[Win].tabs[Tab].parent !== b.tabs[message.windows[Win].tabs[Tab].id].parent) {
                            match = false;
                        }
                    }
                }
            }
            sendResponse(match);
            return;
        }
        if (message.command == 'discard_tab') {
            DiscardTab(message.tabId);
            return;
        }
        if (message.command == 'discard_window') {
            DiscardWindow(message.windowId);
            return;
        }
        if (message.command == 'remove_tab_from_empty_tabs') {
            setTimeout(function() {
                if (b.EmptyTabs.indexOf(message.tabId) != -1) {
                    b.EmptyTabs.splice(b.EmptyTabs.indexOf(message.tabId), 1);
                }
            }, 100);
            return;
        }
        if (message.command == 'debug') {
            pushlog(message.log);
            return;
        }
        if (message.command == 'clearlog') {
            clearlog();
            return;
        }
    });


    // WebChromeClient.onConsoleMessage(ConsoleMessage consoleMessage)
}

// NEW TAB
function OnMessageTabCreated(NewTab, activeTabId) {
    let ParentId;
    let AfterId;
    let append;

    if (b.windows[NewTab.windowId] && NewTab.active) {
        b.windows[NewTab.windowId].groups[b.windows[NewTab.windowId].active_group].active_tab = NewTab.id;
    }

    if (NewTab.url == b.newTabUrl) {
        b.EmptyTabs.push(NewTab.id);
    }

    if (NewTab.pinned) {
        let PinTabs = GetChildren(b.tabs, 'pin_list');
        b.tabs[NewTab.id].parent = 'pin_list';
        if (opt.append_pinned_tab == 'after') {
            if (NewTab.openerTabId && b.tabs[NewTab.openerTabId]) { // has opener tab case
                ShiftChildrenIndexes(PinTabs, b.tabs[NewTab.openerTabId].index, [], NewTab.windowId);
                b.tabs[NewTab.id].index = NewTab.index;
                AfterId = NewTab.openerTabId;
            } else {
                if (b.tabs[activeTabId]) { // after active case
                    ShiftChildrenIndexes(PinTabs, b.tabs[activeTabId].index, [], NewTab.windowId);
                    AfterId = activeTabId;
                }
            }
        }
        if (opt.append_pinned_tab == 'first') { // as first
            ShiftChildrenIndexes(PinTabs, -1, [], NewTab.windowId);
            b.tabs[NewTab.id].index = 0;
            append = false;
        }
        if (opt.append_pinned_tab == 'last') { // as last
            b.tabs[NewTab.id].index = PinTabs.length;
            append = true;
        }
    } else {

        if (opt.append_orphan_tab == 'as_child' && opt.orphaned_tabs_to_ungrouped == false) {
            NewTab.openerTabId = activeTabId;
        }
        if (NewTab.openerTabId) { // child case
            let OpenerSiblingTabs = GetChildren(b.tabs, b.tabs[NewTab.openerTabId].parent);
            let OpenerSiblingFolders = GetChildren(b.windows[NewTab.windowId].folders, b.tabs[NewTab.openerTabId].parent);
            if (opt.append_child_tab == 'after') { // place tabs flat without automatic tree
                b.tabs[NewTab.id].parent = b.tabs[NewTab.openerTabId].parent;
                ShiftChildrenIndexes(OpenerSiblingTabs, b.tabs[NewTab.openerTabId].index, OpenerSiblingFolders, NewTab.windowId);
                b.tabs[NewTab.id].index = b.tabs[NewTab.openerTabId].index + 1;
                AfterId = NewTab.openerTabId;
            } else {
                if (opt.max_tree_depth == 0) { // place tabs flat if limit is set to 0
                    b.tabs[NewTab.id].parent = b.tabs[NewTab.openerTabId].parent;
                    if (opt.append_child_tab_after_limit == 'after') { // max tree depth, place tab after parent
                        ShiftChildrenIndexes(OpenerSiblingTabs, b.tabs[NewTab.openerTabId].index, OpenerSiblingFolders, NewTab.windowId);
                        b.tabs[NewTab.id].index = b.tabs[NewTab.openerTabId].index + 1;
                        AfterId = NewTab.openerTabId;
                    }

                    if (opt.append_child_tab_after_limit == 'top' && opt.append_child_tab != 'after') { // max tree depth, place tab on top (above parent)
                        ShiftChildrenIndexes(OpenerSiblingTabs, -1, OpenerSiblingFolders, NewTab.windowId);
                        b.tabs[NewTab.id].index = 0;
                        ParentId = b.tabs[NewTab.id].parent;
                        append = false;
                    }
                    if (opt.append_child_tab_after_limit == 'bottom' && opt.append_child_tab != 'after') { // max tree depth, place tab on bottom (below parent)
                        b.tabs[NewTab.id].index = OpenerSiblingTabs.length + OpenerSiblingFolders.length;
                        ParentId = b.tabs[NewTab.id].parent;
                        append = true;
                    }

                } else {

                    let Parents = GetTabParents(NewTab.openerTabId, NewTab.windowId);
                    let OpenerChildren = GetChildren(b.tabs, NewTab.openerTabId);
                    if (opt.max_tree_depth < 0 || (opt.max_tree_depth > 0 && Parents.length < opt.max_tree_depth)) { // append to tree on top and bottom
                        b.tabs[NewTab.id].parent = NewTab.openerTabId;
                        if (opt.append_child_tab == 'top') { // place child tab at the top (reverse hierarchy)
                            ShiftChildrenIndexes(OpenerSiblingTabs, -1, OpenerSiblingFolders, NewTab.windowId);
                            b.tabs[NewTab.id].index = 0;
                            ParentId = b.tabs[NewTab.id].parent;
                        }

                        if (opt.append_child_tab == 'bottom') { // place child tab at the bottom
                            b.tabs[NewTab.id].index = OpenerSiblingTabs.length + OpenerSiblingFolders.length;
                            ParentId = b.tabs[NewTab.id].parent;
                            append = true;
                        }

                    } else {

                        if (opt.max_tree_depth > 0 && Parents.length >= opt.max_tree_depth) { // if reached depth limit of the tree
                            b.tabs[NewTab.id].parent = b.tabs[NewTab.openerTabId].parent;
                            if (opt.append_child_tab_after_limit == 'after') { // tab will append after opener
                                ShiftChildrenIndexes(OpenerSiblingTabs, b.tabs[NewTab.openerTabId].index, OpenerSiblingFolders, NewTab.windowId);
                                b.tabs[NewTab.id].index = b.tabs[NewTab.openerTabId].index + 1;
                                AfterId = NewTab.openerTabId;
                            }
                            if (opt.append_child_tab_after_limit == 'top') { // tab will append on top
                                ShiftChildrenIndexes(OpenerSiblingTabs, -1, OpenerSiblingFolders, NewTab.windowId);
                                b.tabs[NewTab.id].index = 0;
                                ParentId = b.tabs[NewTab.id].parent;
                            }
                            if (opt.append_child_tab_after_limit == 'bottom') { // tab will append on bottom
                                b.tabs[NewTab.id].index = OpenerSiblingTabs.length + OpenerSiblingFolders.length;
                                ParentId = b.tabs[NewTab.id].parent;
                                append = true;
                            }
                        }
                    }
                }
            }

        } else { // ORPHAN TAB

            if (opt.orphaned_tabs_to_ungrouped == true) { // if set to append orphan tabs to ungrouped group
                let TabListTabs = GetChildren(b.tabs, 'tab_list');
                let TabListFolders = GetChildren(b.windows[NewTab.windowId].folders, 'tab_list');
                b.tabs[NewTab.id].index = TabListTabs.length + TabListFolders.length;
                ParentId = 'tab_list';
                append = true;
            } else {


                if (opt.append_orphan_tab == 'after_active' || opt.append_orphan_tab == 'active_parent_top' || opt.append_orphan_tab == 'active_parent_bottom') {
                    if (b.windows[NewTab.windowId] && b.windows[NewTab.windowId].activeTabId) {
                        if (b.tabs[activeTabId]) {
                            let ActiveTabSiblings = GetChildren(b.tabs, b.tabs[activeTabId].parent);
                            let ActiveTabSiblingFolders = GetChildren(b.windows[NewTab.windowId].folders, b.tabs[activeTabId].parent);
                            b.tabs[NewTab.id].parent = b.tabs[activeTabId].parent;
                            if (opt.append_orphan_tab == 'after_active') {
                                ShiftChildrenIndexes(ActiveTabSiblings, b.tabs[activeTabId].index, ActiveTabSiblingFolders, NewTab.windowId);
                                b.tabs[NewTab.id].index = b.tabs[activeTabId].index + 1;
                                AfterId = activeTabId;
                            }
                            if (opt.append_orphan_tab == 'active_parent_top') {
                                ShiftChildrenIndexes(ActiveTabSiblings, -1, ActiveTabSiblingFolders, NewTab.windowId);
                                b.tabs[NewTab.id].index = 0;
                                ParentId = b.tabs[NewTab.id].parent;
                            }
                            if (opt.append_orphan_tab == 'active_parent_bottom') {
                                b.tabs[NewTab.id].index = ActiveTabSiblings.length + ActiveTabSiblingFolders.length;
                                ParentId = b.tabs[NewTab.id].parent;
                                append = true;
                            }

                        } else { // FAIL, no active tab!
                            let ActiveGroupTabs = GetChildren(b.tabs, b.windows[NewTab.windowId].active_group);
                            let ActiveGroupFolders = GetChildren(b.windows[NewTab.windowId].folders, b.windows[NewTab.windowId].active_group);
                            b.tabs[NewTab.id].parent = b.windows[NewTab.windowId].active_group;
                            b.tabs[NewTab.id].index = ActiveGroupTabs.length + ActiveGroupFolders.length;
                            ParentId = b.windows[NewTab.windowId].active_group;
                        }
                    } else {
                        b.tabs[NewTab.id].parent = 'tab_list';
                        b.tabs[NewTab.id].index = NewTab.index;
                        ParentId = 'tab_list';
                    }
                }

                if (opt.append_orphan_tab == 'top') {
                    let ActiveGroupTabs = GetChildren(b.tabs, b.windows[NewTab.windowId].active_group);
                    let ActiveGroupFolders = GetChildren(b.windows[NewTab.windowId].folders, b.tabs[activeTabId].parent);
                    b.tabs[NewTab.id].parent = b.windows[NewTab.windowId].active_group;
                    ShiftChildrenIndexes(ActiveGroupTabs, -1, ActiveGroupFolders, NewTab.windowId);
                    b.tabs[NewTab.id].index = 0;
                    ParentId = b.windows[NewTab.windowId].active_group;
                }

                if (opt.append_orphan_tab == 'bottom') {
                    let ActiveGroupTabs = GetChildren(b.tabs, b.windows[NewTab.windowId].active_group);
                    let ActiveGroupFolders = b.tabs[activeTabId] ? GetChildren(b.windows[NewTab.windowId].folders, b.tabs[activeTabId].parent) : [];
                    b.tabs[NewTab.id].parent = b.windows[NewTab.windowId].active_group;
                    b.tabs[NewTab.id].index = ActiveGroupTabs.length + ActiveGroupFolders.length;
                    ParentId = b.windows[NewTab.windowId].active_group;
                    append = true;
                }
            }
        }

        if (opt.move_tabs_on_url_change === 'all_new' && NewTab.pinned == false) {
            setTimeout(function() {
                chrome.tabs.get(NewTab.id, function(CheckTabsUrl) {
                    AppendTabToGroupOnRegexMatch(CheckTabsUrl.id, CheckTabsUrl.windowId, CheckTabsUrl.url);
                });
            }, 100);
        }
    }
    setTimeout(function() {
        b.schedule_save++;
    }, 500);

    chrome.runtime.sendMessage({ command: 'tab_created', windowId: NewTab.windowId, tabId: NewTab.id, tab: NewTab, ParentId: ParentId, InsertAfterId: AfterId, Append: append });
}

function SafeModeCheck() {
    setInterval(function() {
        if (b.safe_mode) {
            if (browserId == 'F') {
                chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(w) {
                    for (win of w) {
                        Promise.resolve(browser.sessions.getWindowValue(win.id, 'TTdata')).then(function(WindowData) {
                            if (WindowData != undefined) {
                                chrome.runtime.sendMessage({command: 'reload_sidebar'});
                                window.location.reload();
                            }
                        });
                    }
                });
            }
        }
    }, 2000);
}


// START BACKGROUND SCRIPT
document.addEventListener('DOMContentLoaded', function() {
    StartBackgroundListeners();

    if (browserId == 'F') {
        QuantumStart();
    }
    if (browserId == 'O') {
        OperaStart();
    }
    if (browserId == 'V') {
        VivaldiStart();
    }

});
