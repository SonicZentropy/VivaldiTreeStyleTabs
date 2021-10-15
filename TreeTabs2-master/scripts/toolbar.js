function Toolbar_RestoreToolbarSearchFilter() { // RESTORE LAST USED SEARCH TYPE (URL OR TITLE) IN TOOLBAR SEARCH
    chrome.runtime.sendMessage({command: 'get_search_filter', windowId: tt.CurrentWindowId}, function(response) {
        if (response == 'url') {
            DOM_SetClasses(document.getElementById('button_filter_type'), ['url'], ['title'], []);
        } else {
            DOM_SetClasses(document.getElementById('button_filter_type'), ['title'], ['url'], []);
        }
    });
}

function Toolbar_RestoreToolbarShelf() { // RESTORE LAST ACTIVE SHELF (SEARCH, TOOLS, GROUPS, SESSION OR FOLDER) IN TOOLBAR
    chrome.runtime.sendMessage({command: 'get_active_shelf', windowId: tt.CurrentWindowId}, function(response) {
        let filterBox = document.getElementById('filter_box');
        filterBox.setAttribute('placeholder', labels.searchbox);
        filterBox.style.opacity = '1';

        let query = document.querySelectorAll('.on');
        for (let s of query) {
            s.classList.remove('on');
        }
        query = document.querySelectorAll('.toolbar_shelf');
        for (let s of query) {
            s.classList.add('hidden');
        }
        if (response == 'search' && document.getElementById('button_search') != null) {
            document.getElementById('toolbar_search').classList.remove('hidden');
            document.getElementById('button_search').classList.add('on');
        }
        if (response == 'tools' && document.getElementById('button_tools') != null) {
            document.getElementById('toolbar_shelf_tools').classList.remove('hidden');
            document.getElementById('button_tools').classList.add('on');
        }
        if (response == 'groups' && document.getElementById('button_groups') != null) {
            document.getElementById('toolbar_shelf_groups').classList.remove('hidden');
            document.getElementById('button_groups').classList.add('on');
        }
        if (response == 'backup' && document.getElementById('button_backup') != null) {
            document.getElementById('toolbar_shelf_backup').classList.remove('hidden');
            document.getElementById('button_backup').classList.add('on');
        }
        if (response == 'folders' && document.getElementById('button_folders') != null) {
            document.getElementById('toolbar_shelf_folders').classList.remove('hidden');
            document.getElementById('button_folders').classList.add('on');
        }
        if (browserId != 'F') {
            chrome.storage.local.get(null, function(storage) {
                let bak1 = storage['windows_BAK1'] ? storage['windows_BAK1'] : [];
                let bak2 = storage['windows_BAK2'] ? storage['windows_BAK2'] : [];
                let bak3 = storage['windows_BAK3'] ? storage['windows_BAK3'] : [];
                if (bak1.length && document.getElementById('#button_load_bak1') != null) {
                    document.getElementById('button_load_bak1').classList.remove('disabled');
                } else {
                    document.getElementById('button_load_bak1').classList.add('disabled');
                }
                if (bak2.length && document.getElementById('#button_load_bak2') != null) {
                    document.getElementById('button_load_bak2').classList.remove('disabled');
                } else {
                    document.getElementById('button_load_bak2').classList.add('disabled');
                }
                if (bak3.length && document.getElementById('#button_load_bak3') != null) {
                    document.getElementById('button_load_bak3').classList.remove('disabled');
                } else {
                    document.getElementById('button_load_bak3').classList.add('disabled');
                }
            });
        }
        DOM_RefreshGUI();
    });
}

function Toolbar_ShelfToggle(mousebutton, button, toolbarId, SendMessage, SidebarRefreshGUI, OptionsRefreshGUI) { // FUNCTION TO TOGGLE SHELFS AND SAVE IT
    if (mousebutton == 1) {
        if (button.classList.contains('on')) {
            let query = document.querySelectorAll('.on');
            for (let s of query) {
                s.classList.remove('on');
            }
            query = document.querySelectorAll('.toolbar_shelf');
            for (let s of query) {
                s.classList.add('hidden');
            }
            chrome.runtime.sendMessage({command: 'set_active_shelf', active_shelf: '', windowId: tt.CurrentWindowId});
        } else {
            let query = document.querySelectorAll('.toolbar_shelf:not(#' + toolbarId + ')');
            for (let s of query) {
                s.classList.add('hidden');
            }
            document.getElementById(toolbarId).classList.remove('hidden');
            chrome.runtime.sendMessage({command: 'set_active_shelf', active_shelf: SendMessage, windowId: tt.CurrentWindowId});
            query = document.querySelectorAll('.on:not(#' + button.id + ')');
            for (let s of query) {
                s.classList.remove('on');
            }
            button.classList.add('on');
        }
        if (SidebarRefreshGUI) DOM_RefreshGUI();
        if (OptionsRefreshGUI) RefreshGUI();
    }
}

function Toolbar_RemoveToolbar() {
    let toolbar = document.getElementById('toolbar');
    while (toolbar.hasChildNodes()) {
        toolbar.removeChild(toolbar.firstChild);
    }
}

function Toolbar_RecreateToolbar(NewToolbar) {
    let toolbar = document.getElementById('toolbar');
    for (var shelf in NewToolbar) {
        let NewShelf = DOM_New('div', toolbar, {id: shelf, className: 'toolbar_shelf'});
        for (let button of NewToolbar[shelf]) {
            let Newbutton = DOM_New('div', NewShelf, {id: button, className: 'button'});
            DOM_New('div', Newbutton, {className: 'button_img'});
        }
    }
    let toolbar_main = document.getElementById('toolbar_main');
    let SearchShelf = document.getElementById('toolbar_search');
    if (toolbar_main != null && SearchShelf != null) {
        toolbar_main.classList.remove('toolbar_shelf');
        let SearchBox = DOM_New('div', SearchShelf, {id: 'toolbar_search_input_box'});
        DOM_New('input', SearchBox, {id: 'filter_box', className: 'text_input', type: 'text', placeholder: labels.searchbox});
        DOM_New('div', SearchBox, {id: 'button_filter_clear', type: 'reset'}, {opacity: '0', position: 'absolute'});
        let SearchButtons = DOM_New('div', SearchShelf, {id: 'toolbar_search_buttons'});
        DOM_AppendToNode(document.getElementById('button_filter_type'), SearchButtons);
        DOM_AppendToNode(document.getElementById('filter_search_go_prev'), SearchButtons);
        DOM_AppendToNode(document.getElementById('filter_search_go_next'), SearchButtons);
        DOM_Loadi18n();
    }
}

function Toolbar_RecreateToolbarUnusedButtons(buttonsIds) { // OPTIONS PAGE
    let unused_buttons = document.getElementById('toolbar_unused_buttons');
    for (let button of buttonsIds) {
        let Newbutton = DOM_New('div', unused_buttons, {id: button, className: 'button'});
        DOM_New('div', Newbutton, {className: 'button_img'});
    }
}

function Toolbar_SaveToolbar() { // OPTIONS PAGE
    let unused_buttons = [];
    let toolbar = {};
    let unused_buttons_div = document.querySelectorAll('#toolbar_unused_buttons .button');
    for (let b of unused_buttons_div) {
        unused_buttons.push(b.id);
    }
    let toolbar_div = document.getElementById('toolbar');
    for (let toolbar_shelf of toolbar_div.childNodes) {
        toolbar[toolbar_shelf.id] = [];
        let query = document.querySelectorAll('#' + toolbar_shelf.id + ' .button');
        for (let button of query) {
            toolbar[toolbar_shelf.id].push(button.id);
        }
    }
    chrome.storage.local.set({toolbar: toolbar});
    chrome.storage.local.set({unused_buttons: unused_buttons});
    setTimeout(function() {chrome.runtime.sendMessage({command: 'reload_toolbar', toolbar: toolbar, opt: opt});}, 50);
}

// ASSIGN MOUSE EVENTS FOR TOOLBAR BUTTONS, (Buttons AND BindToolbarShelfToggleButtons), PARAMETERS DECIDE IF BUTTONS ARE CLICKABLE
// IN OPTIONS PAGE - TOOLBAR BUTTONS SAMPLES, MUST NOT CALL FUNCTIONS ON CLICKS, BUT STILL SHELFS BUTTONS MUST TOGGLE AND MOREOVER ON CLICK AND NOT ON MOUSEDOWN THIS IS WHERE ToolbarShelfToggleClickType="Click" IS NECESSARY
function Toolbar_SetToolbarEvents(CleanPreviousBindings, BindButtons, BindToolbarShelfToggleButtons, ToolbarShelfToggleClickType, SidebarRefreshGUI, OptionsRefreshGUI) {

    let ClearSearch = document.getElementById('button_filter_clear');
    let FilterBox = document.getElementById('filter_box');

    if (ClearSearch != null && FilterBox != null) {
        if (CleanPreviousBindings) {
            FilterBox.removeEventListener('oninput', function() {});
            ClearSearch.removeEventListener('onmousedown', function() {});
        }
        if (BindButtons) {
            // FILTER ON INPUT
            FilterBox.oninput = function(event) {
                Tabs_FindTab(this.value);
            };
            // CLEAR FILTER BUTTON
            ClearSearch.onmousedown = function(event) {
                if (event.which == 1) {
                    this.style.opacity = '0';
                    this.setAttribute('title', '');
                    Tabs_FindTab('');
                }
            };
        }
    }

    let query = document.querySelectorAll('.button');
    for (let s of query) {
        if (CleanPreviousBindings) {
            s.removeEventListener('onmousedown', function() {});
            s.removeEventListener('onclick', function() {});
            s.removeEventListener('click', function() {});
        }
        if (BindToolbarShelfToggleButtons) {
            if (s.id == 'button_search') {
                s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                    if (event.which == 1) Toolbar_ShelfToggle(event.which, this, 'toolbar_search', 'search', SidebarRefreshGUI, OptionsRefreshGUI);
                });
            }
            if (s.id == 'button_tools') {
                s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                    if (event.which == 1) Toolbar_ShelfToggle(event.which, this, 'toolbar_shelf_tools', 'tools', SidebarRefreshGUI, OptionsRefreshGUI);
                });
            }
            if (s.id == 'button_groups') {
                s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                    if (event.which == 1) Toolbar_ShelfToggle(event.which, this, 'toolbar_shelf_groups', 'groups', SidebarRefreshGUI, OptionsRefreshGUI);
                });
            }
            if (s.id == 'button_backup') {
                s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                    if (event.which == 1) Toolbar_ShelfToggle(event.which, this, 'toolbar_shelf_backup', 'backup', SidebarRefreshGUI, OptionsRefreshGUI);
                });
            }
            if (s.id == 'button_folders') {
                s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                    if (event.which == 1) Toolbar_ShelfToggle(event.which, this, 'toolbar_shelf_folders', 'folders', SidebarRefreshGUI, OptionsRefreshGUI);
                });
            }
        }
        if (BindButtons) {
            if (s.id == 'button_new') { // NEW TAB
                s.onclick = function(event) {
                    if (event.which == 1) {
                        if (opt.append_tab_from_toolbar === 'as_regular_orphan') {
                            if (opt.append_orphan_tab === 'top' || opt.append_orphan_tab === 'bottom') Tabs_OpenNewTab(false, undefined, tt.active_group, (opt.append_orphan_tab === 'bottom' ? true : false));
                            if (opt.append_orphan_tab === 'after_active') {
                                let activeTab = document.querySelector('#' + tt.active_group + ' .active_tab');
                                if (activeTab != null) {
                                    Tabs_OpenNewTab(false, activeTab.id, undefined, undefined);
                                } else {
                                    activeTab = document.querySelector('.pin.active_tab');
                                    if (activeTab != null) {
                                        Tabs_OpenNewTab(true, activeTab.id, undefined, undefined);
                                    } else {
                                        Tabs_OpenNewTab(false, undefined, tt.active_group, true);
                                    }
                                }
                            }
                            if (opt.append_orphan_tab === 'active_parent_top' || opt.append_orphan_tab === 'active_parent_bottom') {
                                let activeTab = document.querySelector('#' + tt.active_group + ' .active_tab') != null ? document.querySelector('#' + tt.active_group + ' .active_tab') : document.querySelector('.pin.active_tab') != null ? document.querySelector('.pin.active_tab') : null;
                                if (activeTab != null) {
                                    Tabs_OpenNewTab(false, undefined, activeTab.parentNode.parentNode.id, (opt.append_orphan_tab === 'active_parent_bottom' ? true : false));
                                } else {
                                    Tabs_OpenNewTab(false, undefined, tt.active_group, true);
                                }
                            }
                        }
                        if (opt.append_tab_from_toolbar === 'as_regular_child' || (opt.append_tab_from_toolbar === 'as_regular_orphan' && opt.append_orphan_tab === 'as_child')) {
                            if (opt.append_child_tab === 'top' || opt.append_child_tab === 'bottom') {
                                let activeTab = document.querySelector('#' + tt.active_group + ' .active_tab');
                                if (activeTab != null) {
                                    Tabs_OpenNewTab(false, undefined, activeTab.id, ((opt.append_child_tab === 'bottom' || opt.append_child_tab === 'after') ? true : false));
                                } else {
                                    activeTab = document.querySelector('.pin.active_tab');
                                    if (activeTab != null) {
                                        Tabs_OpenNewTab(true, activeTab.id, undefined, undefined);
                                    } else {
                                        Tabs_OpenNewTab(false, undefined, tt.active_group, true);
                                    }
                                }
                            }
                            if (opt.append_child_tab === 'after') {
                                let activeTab = document.querySelector('#' + tt.active_group + ' .active_tab') != null ? document.querySelector('#' + tt.active_group + ' .active_tab') : document.querySelector('.pin.active_tab') != null ? document.querySelector('.pin.active_tab') : null;
                                if (activeTab != null) {
                                    Tabs_OpenNewTab(false, activeTab.id, undefined, undefined);
                                } else {
                                    Tabs_OpenNewTab(false, undefined, tt.active_group, true);
                                }
                            }
                        }
                        if (opt.append_tab_from_toolbar === 'group_root') Tabs_OpenNewTab(false, undefined, tt.active_group, true);
                    }
                };
                s.onmousedown = function(event) {
                    if (event.which == 2) { // DUPLICATE TAB
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (duplicate tab has been clicked)');
                        event.preventDefault();
                        let activeTab = document.querySelector('#' + tt.active_group + ' .active_tab') != null ? document.querySelector('#' + tt.active_group + ' .active_tab') : document.querySelector('.pin.active_tab') != null ? document.querySelector('.pin.active_tab') : null;
                        if (activeTab != null && tt.tabs[activeTab.id]) tt.tabs[activeTab.id].DuplicateTab();
                    }
                    if (event.which == 3) { // SCROLL TO TAB
                        chrome.tabs.query({currentWindow: true, active: true}, function(activeTab) {
                            if (activeTab[0].pinned && opt.pin_list_multi_row == false && tt.tabs[activeTab[0].id]) tt.tabs[activeTab[0].id].ScrollToTab();
                            if (activeTab[0].pinned == false) {
                                let Tab = document.getElementById(activeTab[0].id);
                                let groupId = DOM_GetParentsByClass(Tab, 'group')[0].id;
                                Groups_SetActiveGroup(groupId, true, true);
                            }
                        });
                    }
                };
            }
            if (s.id == 'button_pin') { // PIN TAB
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (pin tab has been clicked)');
                        let Tabs = document.querySelectorAll('.pin.active_tab, .pin.selected, #' + tt.active_group + ' .active_tab, #' + tt.active_group + ' .selected');
                        for (let s of Tabs) {
                            chrome.tabs.update(parseInt(s.id), {pinned: Tabs[0].classList.contains('tab')});
                        }
                    }
                };
            }
            if (s.id == 'button_options') { // VERTICAL TABS OPTIONS
                s.onmousedown = function(event) {
                    if (event.which == 1) chrome.tabs.create({url: 'options/options.html'});
                };
            }
            if (s.id == 'button_undo') { // UNDO CLOSE
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (undo close has been clicked)');
                        chrome.sessions.getRecentlyClosed(null, function(sessions) {
                            if (sessions.length > 0) chrome.sessions.restore(null, function(restored) {});
                        });
                    }
                };
            }
            if (s.id == 'button_detach' || s.id == 'button_move') { // MOVE TAB TO NEW WINDOW (DETACH), move is legacy name of detach button
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        DOM_FreezeSelection(false);
                        let Nodes = [];
                        let NodesTypes = {DraggingPin: false, DraggingTab: false, DraggingFolder: false};
                        let query = [];
                        if (document.querySelectorAll('.selected').length > 0) {
                           query = document.querySelectorAll('.selected, .selected .tab, .selected .folder');
                        } else {
                            query = document.querySelectorAll('.active_tab');
                        }
                        for (let s of query) {
                            if (s.classList.contains('pin')) {
                                NodesTypes.DraggingPin = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains('selected'), temporary: s.classList.contains('selected_temporarly'), NodeClass: 'pin'});
                            }
                            if (s.classList.contains('tab')) {
                                NodesTypes.DraggingTab = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains('selected'), temporary: s.classList.contains('selected_temporarly'), NodeClass: 'tab'});
                            }
                            if (s.classList.contains('folder')) {
                                NodesTypes.DraggingFolder = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains('selected'), temporary: s.classList.contains('selected_temporarly'), NodeClass: 'folder', index: (tt.folders[s.id] ? tt.folders[s.id].index : 0), name: (tt.folders[s.id] ? tt.folders[s.id].name : labels.noname_group), expand: (tt.folders[s.id] ? tt.folders[s.id].expand : '')});
                            }
                        }
                        Tabs_Detach(Nodes, NodesTypes, {});
                    }
                };
            }
            if (s.id == 'filter_search_go_prev') { // GO TO PREVIOUS SEARCH RESULT
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        let filtered = document.querySelectorAll('#' + tt.active_group + ' .tab.filtered');
                        if (filtered.length > 0) {

                            let query = document.querySelectorAll('.highlighted_search');
                            for (let s of query) {
                                s.classList.remove('highlighted_search');
                            }
                            if (tt.SearchIndex == 0) {
                                tt.SearchIndex = filtered.length - 1;
                            } else {
                                tt.SearchIndex--;
                            }
                            filtered[tt.SearchIndex].classList.add('highlighted_search');
                            if (tt.tabs[filtered[tt.SearchIndex].id]) tt.tabs[filtered[tt.SearchIndex].id].ScrollToTab();
                        }
                    }
                };
            }
            if (s.id == 'filter_search_go_next') { // GO TO NEXT SEARCH RESULT
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        let filtered = document.querySelectorAll('#' + tt.active_group + ' .tab.filtered');
                        if (filtered.length > 0) {

                            let query = document.querySelectorAll('.highlighted_search');
                            for (let s of query) {
                                s.classList.remove('highlighted_search');
                            }
                            if (tt.SearchIndex == filtered.length - 1) {
                                tt.SearchIndex = 0;
                            } else {
                                tt.SearchIndex++;
                            }
                            filtered[tt.SearchIndex].classList.add('highlighted_search');
                            if (tt.tabs[filtered[tt.SearchIndex].id]) tt.tabs[filtered[tt.SearchIndex].id].ScrollToTab();
                        }
                    }
                };
            }
            if (s.id == 'button_groups_toolbar_hide') {  // SHOW/HIDE GROUPS TOOLBAR
                s.onmousedown = function(event) {
                    if (event.which == 1) Groups_GroupsToolbarToggle();
                };
            }
            if (s.id == 'button_manager_window') { // SHOW GROUP MANAGER
                s.onmousedown = function(event) {
                    if (event.which == 1 && document.getElementById('manager_window').style.top == '-500px') {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (show group manager has been clicked)');
                        Manager_OpenManagerWindow();
                    } else {
                        DOM_HideRenameDialogs();
                    }
                };
            }
            if (s.id == 'button_new_group') { // NEW GROUP
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        let NewGroupId = Groups_AddNewGroup();
                        Groups_ShowGroupEditWindow(NewGroupId);
                    }
                };
            }
            if (s.id == 'button_remove_group') { // REMOVE GROUP
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        if (tt.active_group != 'tab_list') Groups_GroupRemove(tt.active_group, event.shiftKey);
                    }
                };
            }
            if (s.id == 'button_edit_group') { // EDIT GROUP
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        if (tt.active_group != 'tab_list') Groups_ShowGroupEditWindow(tt.active_group);
                    }
                };
            }
            if (s.id == 'button_export_group') { // EXPORT GROUP
                s.onmousedown = function(event) {
                    if (event.which == 1) Manager_ExportGroup(tt.active_group, tt.groups[tt.active_group].name, false);
                };
            }
            if (s.id == 'button_import_group') { // IMPORT GROUP
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        let inputFile = File_ShowOpenFileDialog('.tt_group');
                        inputFile.onchange = function(event) {
                            Manager_ImportGroup(true, false);
                        };
                    }
                };
            }
            if (s.id == 'button_new_folder') { // NEW FOLDER
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (new folder has been clicked)');
                        let FolderId = Folders_AddNewFolder({});
                        Folders_ShowRenameFolderDialog(FolderId);
                    }
                };
            }
            if (s.id == 'button_edit_folder') { // RENAME FOLDER
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (rename folder has been clicked)');
                        if (document.querySelectorAll('#' + tt.active_group + ' .selected').length > 0) Folders_ShowRenameFolderDialog(document.querySelectorAll('#' + tt.active_group + ' .selected')[0].id);
                    }
                };
            }
            if (s.id == 'button_remove_folder') { // REMOVE FOLDERS
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (remove folder has been clicked)');
                        let query = document.querySelectorAll('#' + tt.active_group + ' .selected');
                        for (let s of query) {
                            Folders_RemoveFolder(s.id);
                        }
                    }
                };
            }
            if (s.id == 'button_unload' || s.id == 'button_discard') { // DISCARD TABS
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (discard/unload tabs has been clicked)');
                        if (document.querySelectorAll('.pin.selected:not(.active_tab), #' + tt.active_group + ' .selected:not(.active_tab)').length > 0) {
                            Tabs_DiscardTabs(
                                Array.prototype.map.call(document.querySelectorAll('.pin:not(.active_tab), #' + tt.active_group + ' .selected:not(.active_tab)'), function(s) {
                                    return parseInt(s.id);
                                })
                            );
                        } else {
                            Tabs_DiscardTabs(
                                Array.prototype.map.call(document.querySelectorAll('.pin:not(.active_tab), .tab:not(.active_tab)'), function(s) {
                                    return parseInt(s.id);
                                })
                            );
                        }
                    }
                };
            }
            if (s.id == 'button_import_bak') { // IMPORT BACKUP
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (import backup has been clicked)');
                        let inputFile = File_ShowOpenFileDialog('.tt_session');
                        inputFile.onchange = function(event) {
                            Manager_ImportSession(true, false, false);
                        };
                    }
                };
            }
            if (s.id == 'button_export_bak') { // EXPORT BACKUP
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (export backup has been clicked)');
                        let d = new Date();
                        Manager_ExportSession((d.toLocaleString().replace(/\//g, '.').replace(/:/g, '꞉')), true, false, false);
                    }
                };
            }
            if (s.id == 'button_import_merge_bak') { // MERGE BACKUP
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        Utils_log('toolbar.js: ' + arguments.callee.name + ' ' + s.id + ' (merge backup has been clicked)');
                        let inputFile = File_ShowOpenFileDialog('.tt_session');
                        inputFile.onchange = function(event) {
                            Manager_ImportSession(false, false, true);
                            // Manager_ImportMergeTabs();
                        };
                    }
                };
            }
            if (s.id == 'button_filter_type') { // CHANGE FILTERING TYPE
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        if (this.classList.contains('url')) {
                            DOM_SetClasses(this, ['title'], ['url'], []);
                            chrome.runtime.sendMessage({command: 'set_search_filter', search_filter: 'title', windowId: tt.CurrentWindowId});
                        } else {
                            DOM_SetClasses(this, ['url'], ['title'], []);
                            chrome.runtime.sendMessage({command: 'set_search_filter', search_filter: 'url', windowId: tt.CurrentWindowId});
                        }
                        Tabs_FindTab(document.getElementById('filter_box').value);
                    }
                };
            }
            if (s.id == 'button_reboot') { // EMERGENCY RELOAD
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        chrome.runtime.sendMessage({command: 'reload'});
                        chrome.runtime.sendMessage({command: 'reload_sidebar'});
                        location.reload();
                    }
                };
            }
            if (browserId != 'F') {
                if (s.id == 'button_bookmarks') { // BOOKMARKS
                    s.onmousedown = function(event) {
                        if (event.which == 1) chrome.tabs.create({url: 'chrome://bookmarks/'});
                    };
                }
                if (s.id == 'button_downloads') { // DOWNLOADS
                    s.onmousedown = function(event) {
                        if (event.which == 1) chrome.tabs.create({url: 'chrome://downloads/'});
                    };
                }
                if (s.id == 'button_history') { // HISTORY
                    s.onmousedown = function(event) {
                        if (event.which == 1) chrome.tabs.create({url: 'chrome://history/'});
                    };
                }
                if (s.id == 'button_extensions') { // EXTENSIONS
                    s.onmousedown = function(event) {
                        if (event.which == 1) chrome.tabs.create({url: 'chrome://extensions'});
                    };
                }
                if (s.id == 'button_settings') { // SETTINGS
                    s.onmousedown = function(event) {
                        if (event.which == 1) chrome.tabs.create({url: 'chrome://settings/'});
                    };
                }
                if (s.id == 'button_load_bak1' || s.id == 'button_load_bak2' || s.id == 'button_load_bak3') { // LOAD BACKUPS
                    s.onmousedown = function(event) {
                        if (event.which == 1 && this.classList.contains('disabled') == false) {
                            let BakN = (this.id).substr(15);
                            chrome.storage.local.get(null, function(storage) {
                                if (Object.keys(storage['windows_BAK' + BakN]).length > 0) chrome.storage.local.set({'windows': storage['windows_BAK' + BakN]});
                                if (Object.keys(storage['tabs_BAK' + BakN]).length > 0) {
                                    chrome.storage.local.set({'tabs': storage['tabs_BAK' + BakN]});
                                    alert('Loaded backup');
                                }
                                chrome.runtime.sendMessage({command: 'reload'});
                                chrome.runtime.sendMessage({command: 'reload_sidebar'});
                                location.reload();
                            });
                        }
                    };
                }
            }
        }
    }
}
