function Manager_OpenManagerWindow() {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
    DOM_HideRenameDialogs();
    chrome.storage.local.get(null, function(storage) {
        DOM_SetStyle(document.getElementById('manager_window'), {display: 'block', top: '', left: ''});
        let GroupList = document.getElementById('manager_window_groups_list');
        while (GroupList.hasChildNodes()) {
            GroupList.removeChild(GroupList.firstChild);
        }
        let SessionsList = document.getElementById('manager_window_sessions_list');
        while (SessionsList.hasChildNodes()) {
            SessionsList.removeChild(SessionsList.firstChild);
        }
        if (storage.hibernated_groups != undefined) {
            if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': adding hibernated groups to manager list');
            for (let hibernated_group of storage.hibernated_groups) {
                Manager_AddGroupToManagerList(hibernated_group);
            }
        }
        if (storage.saved_sessions != undefined) {
            if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': adding saved session to manager list');
            for (let saved_session of storage.saved_sessions) {
                Manager_AddSessionToManagerList(saved_session);
            }
        }
        Manager_ReAddSessionAutomaticToManagerList(storage);
    });
}

function Manager_AddGroupToManagerList(hibernated_group) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
    let HibernatedGroupRow = DOM_New('li', document.getElementById('manager_window_groups_list'), {className: 'hibernated_group_row'});
    let DeleteGroupIcon = DOM_New('div', HibernatedGroupRow, {className: 'manager_window_list_button delete_hibernated_group', title: chrome.i18n.getMessage('manager_window_delete_icon')});
    DeleteGroupIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let hib_group = this.parentNode;
            let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
            chrome.storage.local.get(null, function(storage) {
                let hibernated_groups = storage.hibernated_groups;
                hibernated_groups.splice(HibernategGroupIndex, 1);
                chrome.storage.local.set({hibernated_groups: hibernated_groups});
                hib_group.parentNode.removeChild(hib_group);
                DOM_RefreshGUI();
            });
        }
    };
    let ExportGroupIcon = DOM_New('div', HibernatedGroupRow, {className: 'manager_window_list_button export_hibernated_group', title: chrome.i18n.getMessage('manager_window_savetofile_icon')});
    ExportGroupIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
            chrome.storage.local.get(null, function(storage) {
                let filename = storage.hibernated_groups[HibernategGroupIndex].group.name == '' ? labels.noname_group : storage.hibernated_groups[HibernategGroupIndex].group.name;
                File_SaveFile(filename, 'tt_group', storage.hibernated_groups[HibernategGroupIndex]);
            });
        }
    };
    let LoadGroupIcon = DOM_New('div', HibernatedGroupRow, {className: 'manager_window_list_button load_hibernated_group', title: chrome.i18n.getMessage('manager_window_load_icon')});
    LoadGroupIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
            chrome.storage.local.get(null, function(storage) {
                Manager_RecreateGroup(storage.hibernated_groups[HibernategGroupIndex]);
            });
        }
    };
    let name = DOM_New('div', HibernatedGroupRow, {className: 'manager_window_group_name text_input', contentEditable: true, textContent: hibernated_group.group.name});
    name.onkeydown = function(event) {
        return event.which != 13;
    };
    name.oninput = function(event) {
        let hib_group_name = this.textContent;
        let hib_group = this.parentNode;
        let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
        chrome.storage.local.get(null, function(storage) {
            let hibernated_groups = storage.hibernated_groups;
            hibernated_groups[HibernategGroupIndex].group.name = hib_group_name;
            chrome.storage.local.set({hibernated_groups: hibernated_groups});
        });
    };
    DOM_New('div', HibernatedGroupRow, {className: 'manager_window_group_name', textContent: ' - (' + hibernated_group.tabs.length + ')'});
    DOM_RefreshGUI();
}

function Manager_AddSessionToManagerList(saved_session) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
    let SavedSessionRow = DOM_New('li', document.getElementById('manager_window_sessions_list'), {className: 'saved_session_row'});
    let DeleteSessionIcon = DOM_New('div', SavedSessionRow, {className: 'manager_window_list_button delete_saved_session', title: chrome.i18n.getMessage('manager_window_delete_icon')});
    DeleteSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions;
                S_Sessions.splice(SessionIndex, 1);
                chrome.storage.local.set({saved_sessions: S_Sessions});
                saved_session.parentNode.removeChild(saved_session);
                DOM_RefreshGUI();
            });
        }
    };
    let ExportSessionIcon = DOM_New('div', SavedSessionRow, {className: 'manager_window_list_button export_saved_session', title: chrome.i18n.getMessage('manager_window_savetofile_icon')});
    ExportSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            console.log('ExportSessionIcon');
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let filename = storage.saved_sessions[SessionIndex].name == '' ? labels.noname_group : storage.saved_sessions[SessionIndex].name;
                File_SaveFile(filename, 'tt_session', storage.saved_sessions[SessionIndex].session);
            });
        }
    };
    let LoadSessionIcon = DOM_New('div', SavedSessionRow, {className: 'manager_window_list_button load_saved_session', title: chrome.i18n.getMessage('manager_window_load_icon')});
    LoadSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            console.log('LoadSessionIcon');
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions;
                Manager_RecreateSession(S_Sessions[SessionIndex].session);
            });
        }
    };
    let MergeSessionIcon = DOM_New('div', SavedSessionRow, {className: 'manager_window_list_button merge_saved_session', title: chrome.i18n.getMessage('manager_window_merge_icon')});
    MergeSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            console.log('MergeSessionIcon');
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions;
                Manager_ImportMergeTabs(S_Sessions[SessionIndex].session);
            });
        }
    };
    let name = DOM_New('div', SavedSessionRow, {className: 'manager_window_session_name', contentEditable: true, textContent: saved_session.name});
    name.onkeydown = function(event) {
        return event.which != 13;
    };
    name.oninput = function(event) {
        let session_name = this.textContent;
        let s = this.parentNode;
        let SessionIndex = Array.from(s.parentNode.children).indexOf(s);
        chrome.storage.local.get(null, function(storage) {
            let S_Sessions = storage.saved_sessions;
            S_Sessions[SessionIndex].name = session_name;
            chrome.storage.local.set({saved_sessions: S_Sessions});
        });
    };
    DOM_RefreshGUI();
}

function Manager_ReAddSessionAutomaticToManagerList(storage) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
    let SessionsAutomaticList = document.getElementById('manager_window_autosessions_list');
    while (SessionsAutomaticList.hasChildNodes()) {
        SessionsAutomaticList.removeChild(SessionsAutomaticList.firstChild);
    }
    if (storage.saved_sessions_automatic != undefined) {
        for (let saved_sessions_automatic of storage.saved_sessions_automatic) {
            Manager_AddSessionAutomaticToManagerList(saved_sessions_automatic);
        }
    }
    DOM_RefreshGUI();
}

function Manager_AddSessionAutomaticToManagerList(saved_session) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
    let SavedSessionRow = DOM_New('li', document.getElementById('manager_window_autosessions_list'), {className: 'saved_session_row'});
    let LoadSessionIcon = DOM_New('div', SavedSessionRow, {className: 'manager_window_list_button load_saved_session', title: chrome.i18n.getMessage('manager_window_load_icon')});
    LoadSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions_automatic;
                Manager_RecreateSession(S_Sessions[SessionIndex].session);
            });
        }
    };
    let MergeSessionIcon = DOM_New('div', SavedSessionRow, {className: 'manager_window_list_button merge_saved_session', title: chrome.i18n.getMessage('manager_window_merge_icon')});
    MergeSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions_automatic;
                Manager_ImportMergeTabs(S_Sessions[SessionIndex].session);
            });
        }
    };
    DOM_New('div', SavedSessionRow, {className: 'manager_window_session_name', textContent: saved_session.name});
    DOM_RefreshGUI();
}

function Manager_SetManagerEvents() {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
    document.getElementById('manager_window_close').onmousedown = function(event) {
        if (event.which == 1) DOM_HideRenameDialogs();
    };
    let query = document.querySelectorAll('.manager_window_toolbar_button');
    for (let s of query) {
        s.onmousedown = function(event) {
            if (event.which == 1) {
                let window_panels = document.querySelectorAll('.manager_window_panel');
                for (let s of window_panels) {
                    s.classList.remove('mw_pan_on');
                }
                document.getElementById((this.id).replace('button', 'panel')).classList.add('mw_pan_on');
                let panel_on = document.querySelectorAll('.mw_on');
                for (let s of panel_on) {
                    s.classList.remove('mw_on');
                }
                this.classList.add('mw_on');
                DOM_RefreshGUI();
            }
        };
    }
    document.getElementById('manager_window_button_import_group').onmousedown = function(event) {
        if (event.which == 1) {
            let inputFile = File_ShowOpenFileDialog('.tt_group');
            inputFile.onchange = function(event) {
                Manager_ImportGroup(false, true);
            };
        }
    };
    document.getElementById('manager_window_button_hibernate_group').onmousedown = function(event) {
        if (event.which == 1) {
            Manager_ExportGroup(tt.active_group, false, true);
            setTimeout(function() {Groups_GroupRemove(tt.active_group, true);}, 100);
            setTimeout(function() {Manager_OpenManagerWindow();}, 150);
        }
    };
    document.getElementById('manager_window_button_save_current_session').onmousedown = function(event) {
        if (event.which == 1) {
            let d = new Date();
            Utils_log('manager.js: ' + arguments.callee.name + ': manager_window_button_save_current_session (Save curret session has been clicked)');
            Manager_ExportSession((d.toLocaleString().replace(/\//g, '.').replace(/:/g, '꞉')), false, true, false);
        }
    };
    document.getElementById('manager_window_button_import_session').onmousedown = function(event) {
        if (event.which == 1) {
            let inputFile = File_ShowOpenFileDialog('.tt_session');
            inputFile.onchange = function(event) {
                Manager_ImportSession(false, true, false);
            };
        }
    };
    let autosessions_save_max_to_keep = document.getElementById('manager_window_autosessions_maximum_saves');
    autosessions_save_max_to_keep.value = opt.autosave_max_to_keep;
    autosessions_save_max_to_keep.oninput = function(event) {
        opt.autosave_max_to_keep = parseInt(this.value);
        Preferences_SavePreferences(opt);
    };
    let autosessions_save_timer = document.getElementById('manager_window_autosessions_save_timer');
    autosessions_save_timer.value = opt.autosave_interval;
    autosessions_save_timer.oninput = function(event) {
        opt.autosave_interval = parseInt(this.value);
        Preferences_SavePreferences(opt);
        clearInterval(tt.AutoSaveSession);
        Manager_StartAutoSaveSession();
    };
}

function Manager_ImportGroup(recreate_group, save_to_manager) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': recreate_group: ' + recreate_group + ', save_to_manager: ' + save_to_manager);
    let file = document.getElementById('file_import');
    let fr = new FileReader();
    if (file.files[0] == undefined) return;
    fr.readAsText(file.files[0]);
    fr.onload = function() {
        let data = fr.result;
        let group = JSON.parse(data);
        file.parentNode.removeChild(file);
        if (recreate_group) Manager_RecreateGroup(group);
        if (save_to_manager) Manager_AddGroupToStorage(group, true);
    };
}

function Manager_AddGroupToStorage(group, add_to_manager) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': add_to_manager: ' + add_to_manager);
    chrome.storage.local.get(null, function(storage) {
        if (storage['hibernated_groups'] == undefined) {
            let hibernated_groups = [];
            hibernated_groups.push(group);
            chrome.storage.local.set({hibernated_groups: hibernated_groups});
            if (add_to_manager) Manager_AddGroupToManagerList(group);
        } else {
            let hibernated_groups = storage['hibernated_groups'];
            hibernated_groups.push(group);
            chrome.storage.local.set({hibernated_groups: hibernated_groups});
            if (add_to_manager) Manager_AddGroupToManagerList(group);
        }
    });
}

function Manager_ImportSession(recreate_session, save_to_manager, merge_session) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': recreate_session = ' + recreate_session + ': save_to_manager = ' + save_to_manager + ': merge_session = ' + merge_session);
    let file = document.getElementById('file_import');
    let fr = new FileReader();
    if (file.files[0] == undefined) return;
    fr.readAsText(file.files[file.files.length - 1]);
    fr.onload = function() {
        let data = fr.result;
        file.parentNode.removeChild(file);

        Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage('status_bar_reading_session_data')});
        let LoadedSession = JSON.parse(data);

        if (recreate_session) {
          Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage('status_bar_recreating_session')});
          Manager_RecreateSession(LoadedSession);
        }

        if (merge_session) {
          Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage('status_bar_restoring_tabs')});
          Manager_ImportMergeTabs(LoadedSession);
        }

        if (save_to_manager) {
          Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage('status_bar_saving_session')});
          Manager_AddSessionToStorage(LoadedSession, (file.files[file.files.length - 1].name).replace('.tt_session', ''), true);
        }
    };
}

function Manager_AddSessionToStorage(session, name, add_to_manager) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': name: ' + name + ', add_to_manager: ' + add_to_manager);
    chrome.storage.local.get(null, function(storage) {
        if (storage.saved_sessions == undefined) {
            let saved_sessions = [];
            saved_sessions.push({name: name, session: session});
            chrome.storage.local.set({saved_sessions: saved_sessions});
            if (add_to_manager) Manager_AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
        } else {
            let saved_sessions = storage.saved_sessions;
            saved_sessions.push({name: name, session: session});
            chrome.storage.local.set({saved_sessions: saved_sessions});
            if (add_to_manager) Manager_AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
        }
    });
}

function Manager_AddAutosaveSessionToStorage(session, name) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': name ' + name);
    chrome.storage.local.get(null, function(storage) {
        if (storage.saved_sessions_automatic == undefined) {
            let s = [];
            s.push({name: name, session: session});
            chrome.storage.local.set({saved_sessions_automatic: s});
        } else {
            let s = storage.saved_sessions_automatic;
            s.unshift({name: name, session: session});
            if (s[opt.autosave_max_to_keep]) s.splice(opt.autosave_max_to_keep, (s.length - opt.autosave_max_to_keep));
            chrome.storage.local.set({saved_sessions_automatic: s});
        }
    });
}

function Manager_StartAutoSaveSession() {
    if (opt.debug) Utils_log('manager.js: Manager_StartAutoSaveSession: opt.autosave_interval = ' + opt.autosave_interval + ': opt.autosave_max_to_keep = ' + opt.autosave_max_to_keep);
    if (opt.autosave_interval > 0 && opt.autosave_max_to_keep > 0) {

        if (opt.debug) {
          chrome.windows.getAll({ windowTypes: ['normal'] }, function(currWindows) {
              Utils_log('manager.js: Manager_StartAutoSaveSession: current window count = ' + currWindows.length);
          });
        }

        tt.AutoSaveSession = setInterval(function() {
          let d = new Date();
          let newName = d.toLocaleString().replace(/\//g, '.').replace(/:/g, '꞉');
          Manager_ExportSession(newName, false, false, true);
          Manager_ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage('status_bar_autosave') + newName, hideTimeout: 5000});
          if (document.getElementById('manager_window').style.top != '-500px') chrome.storage.local.get(null, function(storage) {Manager_ReAddSessionAutomaticToManagerList(storage);});
        }, opt.autosave_interval * 60000);
    }
}

function Manager_ShowStatusBar(p) { // show, spinner, message
    let status_bar = document.getElementById('status_bar');
    let busy_spinner = document.getElementById('busy_spinner');
    let status_message = document.getElementById('status_message');
    if (p.show) {
        status_bar.style.display = 'block';
        status_message.textContent = p.message;
        if (p.spinner) {
            busy_spinner.style.opacity = '1';
        } else {
            busy_spinner.style.opacity = '0';
        }
    } else {
        busy_spinner.style.opacity = '0';
        status_message.textContent = '';
        status_bar.style.display = 'none';
    }
    if (p.hideTimeout) {
        setTimeout(function() {
            busy_spinner.style.opacity = '0';
            status_message.textContent = '';
            status_bar.style.display = 'none';
        }, p.hideTimeout);
    }
}

function Manager_ImportMergeTabs(LoadedWindows) {
  Utils_log('manager.js: ' + arguments.callee.name);
  Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage('status_bar_loaded_tree_structure')});
    chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(CurrentWindows) {
        let New = {};
        for (let CurrentWindow of CurrentWindows) {
            for (let LoadedWindow of LoadedWindows) {
                if (New[LoadedWindow.id] == undefined) { // No window added yet
                    let tabsMatch = 0;
                    let LoadedTabs = {};
                    for (let CurrentTab of CurrentWindow.tabs) {
                        for (let LoadedTab of LoadedWindow.tabs) {
                            if (LoadedTabs[LoadedTab.id] == undefined && CurrentTab.url == LoadedTab.url) {
                                LoadedTabs[LoadedTab.id] = Object.assign({}, LoadedTab);
                                LoadedTabs[LoadedTab.id].oldId = LoadedTabs[LoadedTab.id].id; // store previous id for parents
                                LoadedTabs[LoadedTab.id].id = CurrentTab.id; // replace to a new id
                                tabsMatch++;
                            }
                        }
                    }
                    if (tabsMatch > CurrentWindow.tabs.length * 0.6) { // matched more than half of tabs
                        for (let CurrentTab of CurrentWindow.tabs) {
                            for (let LoadedTab of LoadedWindow.tabs) {
                                if (LoadedTabs[LoadedTab.id] == undefined) { // add rest of missing tabs without new id as oldId, so they can be recognized as missing
                                    LoadedTabs[LoadedTab.id] = Object.assign({}, LoadedTab);
                                }
                            }
                        }
                        New[LoadedWindow.id] = Object.assign({}, LoadedWindow);
                        New[LoadedWindow.id].oldId = New[LoadedWindow.id].id;
                        New[LoadedWindow.id].id = CurrentWindow.id;
                        New[LoadedWindow.id].tabs = Object.assign({}, LoadedTabs);
                    }
                }
            }
        }
        for (let LoadedWindow of LoadedWindows) { // CONVERT ARRAY TABS TO OBJECTS, FOR MISSING WINDOWS
            if (New[LoadedWindow.id] == undefined) {
                New[LoadedWindow.id] = Object.assign({}, LoadedWindow);
                let NewTabs = {};
                for (let Tab of LoadedWindow.tabs) {
                    NewTabs[Tab.id] = Object.assign({}, Tab);
                }
                New[LoadedWindow.id].tabs = Object.assign({}, NewTabs);
            }
        }
        for (let windowId in New) { // Loaded Windows
            if (New[windowId].oldId == undefined) { // missing window, lets make one
                let FirstTabId = Object.keys(New[windowId].tabs)[0];
                let window_params;
                if (browserId == 'F') {
                    if ((New[windowId].tabs[FirstTabId].url).startsWith('about')) {
                       window_params = {};
                    } else {
                        window_params = {url: New[windowId].tabs[FirstTabId].url};
                    }
                } else {
                    window_params = {url: New[windowId].tabs[FirstTabId].url};
                }
                chrome.windows.create(window_params, function(new_window) {
                    chrome.runtime.sendMessage({command: 'save_groups', windowId: new_window.id, groups: New[windowId].groups});
                    chrome.runtime.sendMessage({command: 'save_folders', windowId: new_window.id, folders: New[windowId].folders});

                    New[windowId].oldId = New[windowId].id;
                    New[windowId].id = new_window.id;

                    if (new_window.tabs[0]) {
                        New[windowId].tabs[FirstTabId].oldId = New[windowId].tabs[FirstTabId].id;
                        New[windowId].tabs[FirstTabId].id = new_window.tabs[0].id;
                        if (New[windowId].tabs[FirstTabId].parent == 'pin_list') chrome.tabs.update(new_window.tabs[0].id, {pinned: true});
                    }
                    for (let Tab in New[windowId].tabs) {
                        if (Tab != FirstTabId) { // skip first tab that was made with window
                            let params;
                            if (browserId == 'F') {
                                if ((New[windowId].tabs[Tab].url).startsWith('about')) {
                                    params = {active: false, windowId: new_window.id};
                                } else {
                                    params = {active: false, windowId: new_window.id, url: New[windowId].tabs[Tab].url, discarded: true, title: New[windowId].tabs[Tab].title};
                                }
                            } else {
                                params = {active: false, windowId: new_window.id, url: New[windowId].tabs[Tab].url};
                            }
                            chrome.tabs.create(params, function(new_tab) {
                                if (new_tab) {
                                    New[windowId].tabs[Tab].oldId = New[windowId].tabs[Tab].id;
                                    New[windowId].tabs[Tab].id = new_tab.id;
                                    if (New[windowId].tabs[Tab].parent == 'pin_list') chrome.tabs.update(new_tab.id, {pinned: true});
                                }
                            });
                        }
                    }
                });
            } else {
                chrome.runtime.sendMessage({command: 'get_folders', windowId: New[windowId].id}, function(f) {
                    chrome.runtime.sendMessage({command: 'get_groups', windowId: New[windowId].id}, function(g) {
                        if (Object.keys(g).length > 0) {
                            for (var group in g) {
                                if (group != '' && group != 'undefined' && New[windowId].groups[g[group].id] == undefined) New[windowId].groups[g[group].id] = Object.assign({}, g[group]);
                            }
                        }
                        if (Object.keys(f).length > 0) {
                            for (var folder in f) {
                                if (folder != '' && folder != 'undefined' && New[windowId].folders[f[folder].id] == undefined) New[windowId].folders[f[folder].id] = Object.assign({}, f[folder]);
                            }
                        }
                        chrome.runtime.sendMessage({command: 'save_groups', windowId: New[windowId].id, groups: New[windowId].groups});
                        chrome.runtime.sendMessage({command: 'save_folders', windowId: New[windowId].id, folders: New[windowId].folders});
                        chrome.runtime.sendMessage({command: 'remote_update', groups: New[windowId].groups, folders: New[windowId].folders, tabs: {}, windowId: New[windowId].id});
                        for (let Tab in New[windowId].tabs) {
                            if (New[windowId].tabs[Tab].oldId == undefined) {
                                let params;
                                if (browserId == 'F') {
                                    if ((New[windowId].tabs[Tab].url).startsWith('about')) {
                                        params = {active: false, windowId: New[windowId].id};
                                    } else {
                                        params = {active: false, windowId: New[windowId].id, url: New[windowId].tabs[Tab].url, discarded: true, title: New[windowId].tabs[Tab].title};
                                    }
                                } else {
                                    params = {active: false, windowId: New[windowId].id, url: New[windowId].tabs[Tab].url};
                                }
                                chrome.tabs.create(params, function(new_tab) {
                                    if (new_tab) {
                                        New[windowId].tabs[Tab].oldId = New[windowId].tabs[Tab].id;
                                        New[windowId].tabs[Tab].id = new_tab.id;
                                        if (New[windowId].tabs[Tab].parent == 'pin_list') chrome.tabs.update(new_tab.id, {pinned: true});
                                    }
                                });
                            }
                        }
                    });
                });
            }
        }
        let STOP = 0;
        let WaitForFinish = setInterval(function() {
            if (STOP > 60) clearInterval(WaitForFinish); STOP++; // stop after 5 minutes
            chrome.runtime.sendMessage({command: 'all_tabs_exist', windows: New}, function(exist) {
                if (exist == true) {
                    chrome.runtime.sendMessage({command: 'does_tabs_match', windows: New}, function(match) {
                        if (match == false) {
                            for (let windowId in New) {
                                for (let Tab in New[windowId].tabs) {
                                    if (New[windowId].tabs[New[windowId].tabs[Tab].parent]) {
                                        New[windowId].tabs[Tab].parent = New[windowId].tabs[New[windowId].tabs[Tab].parent].id;
                                    }
                                }
                                for (let Tab in New[windowId].tabs) {
                                    chrome.runtime.sendMessage({command: 'update_tab', tabId: New[windowId].tabs[Tab].id, tab: {index: New[windowId].tabs[Tab].index, expand: New[windowId].tabs[Tab].expand, parent: New[windowId].tabs[Tab].parent}});
                                    if (browserId != 'O' && browserId != 'F') setTimeout(function() {chrome.runtime.sendMessage({command: 'discard_tab', tabId: New[windowId].tabs[Tab].id});}, 5000);
                                }
                                if (New[windowId].id == tt.CurrentWindowId) {
                                    Manager_RecreateTreeStructure(New[windowId].groups, New[windowId].folders, New[windowId].tabs);
                                } else {
                                    chrome.runtime.sendMessage({command: 'remote_update', groups: New[windowId].groups, folders: New[windowId].folders, tabs: New[windowId].tabs, windowId: New[windowId].id});
                                }
                                STOP = 61;
                            }
                        }
                    });
                }
            });
        }, 3000);
    });
}

function Manager_RecreateSession(LoadedWindows) {
  if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
  for (let LoadedWindow of LoadedWindows) {
        let NewTabs = {};
        let window_params;
        if (browserId == 'F') {
            if ((LoadedWindow.tabs[0].url).startsWith('about')) {
               window_params = {};
            } else {
                window_params = {url: LoadedWindow.tabs[0].url};
            }
        } else {
            window_params = {url: LoadedWindow.tabs[0].url};
        }
        chrome.windows.create(window_params, function(new_window) {
            chrome.runtime.sendMessage({command: 'save_groups', windowId: new_window.id, groups: LoadedWindow.groups});
            chrome.runtime.sendMessage({command: 'save_folders', windowId: new_window.id, folders: LoadedWindow.folders});
            NewTabs[LoadedWindow.tabs[0].id] = {id: new_window.tabs[0].id, expand: LoadedWindow.tabs[0].expand, favicon: LoadedWindow.tabs[0].favicon, index: LoadedWindow.tabs[0].index, parent: LoadedWindow.tabs[0].parent, title: LoadedWindow.tabs[0].title};
            for (let Tab of LoadedWindow.tabs) {
                if (Tab.id != LoadedWindow.tabs[0].id) { // skip first tab
                    let params;
                    if (browserId == 'F') {
                        if ((Tab.url).startsWith('about')) {
                            params = {active: false, windowId: new_window.id};
                        } else {
                            params = {active: false, windowId: new_window.id, url: Tab.url, discarded: true, title: Tab.title};
                        }
                    } else {
                        params = {active: false, windowId: new_window.id, url: Tab.url};
                    }
                    chrome.tabs.create(params, function(new_tab) {
                        NewTabs[Tab.id] = {id: 0, favicon: Tab.favicon, index: Tab.index, parent: Tab.parent, title: Tab.title, expand: Tab.expand};
                        if (new_tab) {
                            NewTabs[Tab.id].id = new_tab.id;
                        }
                    });
                }
            }
            let STOP = 0;
            let WaitForFinish = setInterval(function() {
                if (STOP > 60) clearInterval(WaitForFinish); STOP++; // stop after 5 minutes
                if (Object.keys(NewTabs).length == LoadedWindow.tabs.length) {
                    setTimeout(function() {
                        for (let Tab in NewTabs) {
                            if (NewTabs[NewTabs[Tab].parent] != undefined) NewTabs[Tab].parent = NewTabs[NewTabs[Tab].parent].id;
                            if (NewTabs[Tab].parent == 'pin_list') chrome.tabs.update(NewTabs[Tab].id, {pinned: true});
                            if (browserId != 'O' && browserId != 'F') setTimeout(function() {chrome.runtime.sendMessage({command: 'discard_tab', tabId: NewTabs[Tab].id});}, 5000);
                        }
                        for (let Tab in NewTabs) {
                            chrome.runtime.sendMessage({command: 'update_tab', tabId: parseInt(NewTabs[Tab].id), tab: {index: NewTabs[Tab].index, expand: NewTabs[Tab].expand, parent: NewTabs[Tab].parent}});
                        }
                        chrome.runtime.sendMessage({command: 'sidebar_started', windowId: new_window.id}, function(response) {
                            if (response) {
                                chrome.runtime.sendMessage({command: 'remote_update', groups: LoadedWindow.groups, folders: LoadedWindow.folders, tabs: NewTabs, windowId: new_window.id}, function(response) {
                                    // if (response)
                                });
                            }
                        });
                        STOP = 61;
                    }, 5000);
                }
            }, 5000);
        });
    }
}

function Manager_RecreateGroup(LoadedGroup) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
   let NewGroupId = Groups_AddNewGroup(LoadedGroup.group.name, LoadedGroup.group.font);
    let NewFolders = {};
    // let RefTabs = {};
    let NewTabs = {};

    // restore folders
    if (Object.keys(LoadedGroup.folders).length > 0) {
        for (var folder in LoadedGroup.folders) {
            let newId = Folders_AddNewFolder({ParentId: NewGroupId, Name: LoadedGroup.folders[folder].name, ExpandState: LoadedGroup.folders[folder].expand});
            LoadedGroup.folders[folder].newId = newId;
            NewFolders[newId] = {id: newId, parent: LoadedGroup.folders[folder].parent, index: LoadedGroup.folders[folder].index, name: LoadedGroup.folders[folder].name, expand: LoadedGroup.folders[folder].expand};
        }
        for (var new_folder in NewFolders) {
            if ((NewFolders[new_folder].parent).startsWith('f_') && LoadedGroup.folders[NewFolders[new_folder].parent]) {
                NewFolders[new_folder].parent = LoadedGroup.folders[NewFolders[new_folder].parent].newId;
            } else {
                if ((LoadedGroup.folders[folder].parent).startsWith('g_') || LoadedGroup.folders[folder].parent == 'tab_list') {
                    NewFolders[new_folder].parent = NewGroupId;
                }
            }
        }
    }

    // restore tabs
    if (LoadedGroup.tabs.length > 0) {
        for (let Tab of LoadedGroup.tabs) {
            let params;
            if (browserId == 'F') {
                if ((Tab.url).startsWith('about')) {
                    params = {active: false, windowId: tt.CurrentWindowId};
                } else {
                    params = {active: false, windowId: tt.CurrentWindowId, url: Tab.url, discarded: true, title: Tab.title};
                }
            } else {
                params = {active: false, windowId: tt.CurrentWindowId, url: Tab.url};
            }
            chrome.tabs.create(params, function(new_tab) {
                    NewTabs[Tab.id] = {id: new_tab.id, favicon: Tab.favicon, index: Tab.index, parent: Tab.parent, title: Tab.title, expand: Tab.expand};
                if (new_tab) {
                    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': new_tab.id = ' + new_tab.id);
                    NewTabs[Tab.id].id = new_tab.id;
                    if (browserId != 'O') setTimeout(function() {chrome.runtime.sendMessage({command: 'discard_tab', tabId: new_tab.id});}, 5000);
                    // LastTabId = new_tab.id;
                }
                // else {
                    // RefTabs[Tab.id] = "failed: "+Tab.id;
                // }
            });
        }
    }

    // define parents
    let STOP = 0;
    let WaitForFinish = setInterval(function() {
        if (STOP > 300) clearInterval(WaitForFinish); STOP++;// just stop after 5 minutes
        if (document.getElementById('°' + NewGroupId) != null) {
            if (Object.keys(LoadedGroup.folders).length > 0 && LoadedGroup.tabs.length == 0) {
                Manager_RecreateTreeStructure({}, NewFolders, {});
                STOP = 301;
            }
            if (LoadedGroup.tabs.length > 0 && Object.keys(NewTabs).length == LoadedGroup.tabs.length /* && document.getElementById(LastTabId) != null */) {
                 setTimeout(function() {
                   for (let tabId in NewTabs) {
                        if (NewTabs[NewTabs[tabId].parent] != undefined) {
                            NewTabs[tabId].parent = NewTabs[NewTabs[tabId].parent].id;
                        } else {
                            if ((NewTabs[tabId].parent).startsWith('f_') && LoadedGroup.folders[NewTabs[tabId].parent]) {
                                NewTabs[tabId].parent = LoadedGroup.folders[NewTabs[tabId].parent].newId;
                            } else {
                                if ((NewTabs[tabId].parent).startsWith('g_') || NewTabs[tabId].parent == 'tab_list') {
                                    NewTabs[tabId].parent = NewGroupId;
                                }
                            }
                        }
                        if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': NewTabs[tabId].parent = ' + NewTabs[tabId].parent);
                    }
                    Manager_RecreateTreeStructure({}, NewFolders, NewTabs);
                    STOP = 301;
                }, 5000);
            }
        }
    }, 1000);
}

function Manager_RecreateTreeStructure(groups, folders, tabs) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
    Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage('status_bar_quick_check_recreate_structure'), hideTimeout: 3000});
    if (groups && Object.keys(groups).length > 0) {
        for (var group in groups) {
            tt.groups[groups[group].id] = {id: groups[group].id, index: groups[group].index, active_tab: groups[group].active_tab, prev_active_tab: groups[group].prev_active_tab, name: groups[group].name};
        }
        Groups_AppendGroups(tt.groups);
        Groups_UpdateBgGroupsOrder();
    }
    if (folders && Object.keys(folders).length > 0) {
        for (var folder in folders) {
            tt.folders[folders[folder].id] = {id: folders[folder].id, parent: folders[folder].parent, index: folders[folder].index, name: folders[folder].name, expand: folders[folder].expand};
        }
        Folders_PreAppendFolders(tt.folders);
        Folders_AppendFolders(tt.folders);
    }
    if (tabs && Object.keys(tabs).length > 0) {
        for (let tab in tabs) {
            if (tabs[tab].parent == 'pin_list') {
                chrome.tabs.update(tabs[tab].id, {pinned: true});
            } else {
                if (tabs[tab].parent != '') {
                    let tb = document.getElementById(tabs[tab].id);
                    let tbp = document.getElementById('°' + tabs[tab].parent);
                    if (tb != null && tbp != null && tb != undefined && tbp != undefined) {
                        tbp.appendChild(tb);
                        if (tabs[tab].expand != '') tb.classList.add(tabs[tab].expand);
                        if (tb.classList.contains('pin')) chrome.tabs.update(tabs[tab].id, {pinned: false});
                    }
                }
            }
        }
    }
    setTimeout(function() {
        DOM_RefreshExpandStates();
        DOM_RefreshCounters();
        setTimeout(function() {
            Tabs_RearrangeTree(tabs, folders, true);
        }, 1000);
        tt.schedule_update_data++;
        Folders_SaveFolders();
        DOM_RefreshGUI();
    }, 3000);
}

function Manager_ExportGroup(groupId, filename, save_to_manager) {
    if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name);
   let GroupToSave = {group: tt.groups[groupId], folders: {}, tabs: [], favicons: []};
    let query = document.querySelectorAll('#' + groupId + ' .folder');
    for (let s of query) {
        if (tt.folders[s.id]) GroupToSave.folders[s.id] = tt.folders[s.id];
    }
    let Tabs = document.querySelectorAll('#' + groupId + ' .tab');
    if (Tabs.length > 0) {
        for (let s of Tabs) {
            chrome.tabs.get(parseInt(s.id), function(tab) {
                let favicon = tab.favIconUrl;
                let favicon_index = GroupToSave.favicons.indexOf(favicon);
                if (favicon_index == -1) {
                    GroupToSave.favicons.push(favicon);
                    favicon_index = GroupToSave.favicons.indexOf(favicon);
                }
                (GroupToSave.tabs).push({
                      id: tab.id,
                      parent: s.parentNode.parentNode.id,
                      index: Array.from(s.parentNode.children).indexOf(s),
                      expand: (s.classList.contains('c') ? 'c' : (s.classList.contains('o') ? 'o' : '')),
                      url: tab.url,
                      title: tab.title,
                      favicon: favicon_index
                });
                if (GroupToSave.tabs.length == Tabs.length) {
                    if (filename) File_SaveFile(filename, 'tt_group', GroupToSave);
                    if (save_to_manager) Manager_AddGroupToStorage(GroupToSave, true);
                     if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ', filename: ' + filename + ', groupId: ' + groupId + ', save_to_manager: ' + save_to_manager);
                }
            });
        }
    } else {
        if (filename) File_SaveFile(filename, 'tt_group', GroupToSave);
        if (save_to_manager) Manager_AddGroupToStorage(GroupToSave, true);
        // if (opt.debug) Utils_log("f: ExportGroup, filename: " + filename + ", groupId: " + groupId + ", save_to_manager: " + save_to_manager);
    }
}

function Manager_ExportSession(name, save_to_file, save_to_manager, save_to_autosave_manager) {
    chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(AllWindows) {
        chrome.runtime.sendMessage({command: 'get_browser_tabs'}, function(t) {
            let tabs = Object.assign({}, t);
            chrome.runtime.sendMessage({command: 'get_windows'}, function(w) {
                let windows = Object.assign({}, w);
                if (opt.debug) Utils_log('manager.js: Manager_ExportSession: name = ' + name + ': save_to_file = ' + save_to_file + ': save_to_manager = ' + save_to_manager + ': save_to_autosave_manager = ' + save_to_autosave_manager + ': AllWindows.length = ' + AllWindows.length + ': w.length = ' + w.length);
                let ExportWindows = [];
                for (let window of AllWindows) {
                    if (window.tabs.length > 0) {
                        windows[window.id]['id'] = window.id;
                        windows[window.id]['tabs'] = [];
                        windows[window.id]['favicons'] = [];
                        window.tabs.forEach(function(tab) {
                            let favicon = tab.favIconUrl;
                            let favicon_index = windows[window.id].favicons.indexOf(favicon);
                            if (favicon_index == -1) {
                                windows[window.id].favicons.push(favicon);
                                favicon_index = windows[window.id].favicons.length;
                            }
                            windows[window.id]['tabs'].push({id: tab.id, url: tab.url, parent: tabs[tab.id].parent, index: tabs[tab.id].index, expand: tabs[tab.id].expand, title: tab.title, favicon: favicon_index});
                            if (windows[window.id].tabs.length == window.tabs.length) {
                                ExportWindows.push(windows[window.id]);
                                   if (ExportWindows.length == AllWindows.length) {
                                   if (opt.debug) Utils_log('manager.js: Manager_ExportSession: about to save the results: AllWindows.length = ' + AllWindows.length + ': w.length = ' + w.length);
                                    setTimeout(function() {
                                        if (save_to_file) File_SaveFile(name, 'tt_session', ExportWindows);
                                        if (save_to_manager) Manager_AddSessionToStorage(ExportWindows, name, true);
                                        if (save_to_autosave_manager) Manager_AddAutosaveSessionToStorage(ExportWindows, name);
                                    }, 500);
                                }
                            }
                        });
                    }
                }
            });
        });
    });
}
