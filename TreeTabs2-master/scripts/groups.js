function Groups_AppendGroupToList(groupId, group_name, font_color, SetEvents) {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name + ': groupId = ' + groupId + ': group_name = ' + group_name);
    if (document.getElementById(groupId) == null) {
        if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name + ': creating the group, part 1');
        let grp = DOM_New('div', document.getElementById('groups'), {id: groupId, className: 'group'}, {display: 'none'});
        DOM_New('div', grp, {id: ('°' + groupId), className: 'children'});
        if (SetEvents) {
            grp.onclick = function(event) {
                if (event.which == 1 && event.target == this && event.clientX < (this.childNodes[0].getBoundingClientRect().width + this.getBoundingClientRect().left)) DOM_Deselect();
            };
            grp.onmousedown = function(event) {
                event.stopImmediatePropagation();
                if (event.which == 1 && event.target == this && event.clientX < (this.childNodes[0].getBoundingClientRect().width + this.getBoundingClientRect().left)) {
                    Menu_HideMenus();
                    return false;
                }
                if (event.which == 2) {
                    event.preventDefault();
                    Groups_ActionClickGroup(this, opt.midclick_group);
                }
                if (event.which == 3 && event.target.id == this.id) Menu_ShowFGlobalMenu(event);
                if (browserId == 'V') {
                    chrome.windows.getCurrent({populate: false}, function(window) {
                        if (tt.CurrentWindowId != window.id && window.focused) location.reload();
                    });
                }
            };
            grp.ondragover = function(event) {
                    if (event.target.id == this.id && (tt.DraggingGroup || tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder)) {
                        DOM_RemoveHighlight();
                        this.classList.add('highlighted_drop_target');
                    }
                };
            grp.ondblclick = function(event) {
                if (event.target.id == this.id) Groups_ActionClickGroup(this, opt.dbclick_group);
            };
            if (opt.switch_with_scroll) DOM_BindTabsSwitchingToMouseWheel(groupId);
        }
    }
    if (document.getElementById('_' + groupId) == null) {
        if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name + ': creating the group, part 2: group_name = ' + group_name);

        let gbn = DOM_New('div', document.getElementById('group_list'), {id: ('_' + groupId), className: 'group_button', draggable: (SetEvents ? true : false)});

        DOM_New('span', gbn, {id: ('_gte' + groupId), className: 'group_title', textContent: group_name}, {color: (font_color != '' ? ('#' + font_color) : (window.getComputedStyle(document.getElementById('body'), null).getPropertyValue('--group_list_default_font_color')))});

        DOM_New('div', gbn, {id: ('di' + groupId), className: 'drag_indicator'});
        if (SetEvents) {
            gbn.onclick = function(event) {
                Groups_SetActiveGroup(this.id.substr(1), true, true);
            };
            gbn.onmousedown = function(event) {
                if (event.which == 3) Menu_ShowFGroupMenu(document.getElementById(this.id.substr(1)), event);
            };
            gbn.ondblclick = function(event) {
                if (event.which == 1 && this.id != '_tab_list') Groups_ShowGroupEditWindow((this.id).substr(1));
            };
            gbn.ondragstart = function(event) { // DRAG START
                event.stopPropagation();
                event.dataTransfer.setDragImage(document.getElementById('DragImage'), 0, 0);
                event.dataTransfer.setData('text', '');
                event.dataTransfer.setData('SourceWindowId', tt.CurrentWindowId);
                DOM_CleanUpDragAndDrop();
                tt.Dragging = true;
                tt.DraggingGroup = true;
                tt.DragTreeDepth = -1;
                let groupId = this.id.substr(1);
                let Group = Object.assign({}, tt.groups[groupId]);
                let Nodes = [];
                let query = document.querySelectorAll('#' + groupId + ' .tab, #' + groupId + ' .folder');
                for (let s of query) {
                    if (s.classList.contains('tab')) {
                        tt.DraggingTab = true;
                        Nodes.push({id: s.id, parent: s.parentNode.id, selected: false, temporary: false, NodeClass: 'tab'});
                    }
                    if (s.classList.contains('folder')) {
                        tt.DraggingFolder = true;
                        Nodes.push({id: s.id, parent: s.parentNode.id, selected: false, temporary: false, NodeClass: 'folder', index: (tt.folders[s.id] ? tt.folders[s.id].index : 0), name: (tt.folders[s.id] ? tt.folders[s.id].name : labels.noname_group), expand: (tt.folders[s.id] ? tt.folders[s.id].expand : '')});
                    }
                }
                event.dataTransfer.setData('Group', JSON.stringify(Group));
                event.dataTransfer.setData('Nodes', JSON.stringify(Nodes));
                event.dataTransfer.setData('NodesTypes', JSON.stringify({DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder}));
                chrome.runtime.sendMessage({command: 'drag_start', DragTreeDepth: tt.DragTreeDepth, DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder});
            };
            gbn.ondragover = function(event) {
                if (this.classList.contains('inside') == false && tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder)) {
                    DOM_RemoveHighlight();
                    DOM_SetClasses(this, ['inside', 'highlighted_drop_target'], ['before', 'after'], []);
                }
                if (this.classList.contains('before') == false && event.layerY < this.clientHeight / 2 && tt.DraggingGroup) {
                    DOM_RemoveHighlight();
                    DOM_SetClasses(this, ['before', 'highlighted_drop_target'], ['inside', 'after'], []);
                }
                if (this.classList.contains('after') == false && event.layerY > this.clientHeight / 2 && tt.DraggingGroup) {
                    DOM_RemoveHighlight();
                    DOM_SetClasses(this, ['after', 'highlighted_drop_target'], ['inside', 'before'], []);
                }
            };
            gbn.ondragenter = function(event) {
                if (opt.open_tree_on_hover) {
                    if (this.classList.contains('active') == false && (tt.DraggingGroup || tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder)) {
                        clearTimeout(tt.DragOverTimer);
                        let This = this;
                        tt.DragOverTimer = setTimeout(function() {Groups_SetActiveGroup(This.id.substr(1), false, false);}, 1500);
                    }
                }
            };
            DOM_RefreshGUI();
        }
    }
}

function Groups_AddNewGroup(Name, FontColor) {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name + ': name = ' + Name);
    let newId = Groups_GenerateNewGroupID();
    tt.groups[newId] = {id: newId, index: 0, active_tab: 0, prev_active_tab: 0, name: (Name ? Name : labels.noname_group), font: (FontColor ? FontColor : '')};
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name + ': groupId: ' + newId + ', Name: ' + Name + ', FontColor: ' + FontColor);
    Groups_AppendGroupToList(newId, tt.groups[newId].name, tt.groups[newId].font, true);
    Groups_UpdateBgGroupsOrder();
    return newId;
}

function Groups_SaveGroups() {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    chrome.runtime.sendMessage({command: 'save_groups', groups: tt.groups, windowId: tt.CurrentWindowId});
}

function Groups_AppendGroups(groups) {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    Groups_AppendGroupToList('tab_list', labels.ungrouped_group, '', true);
    for (var group in groups) {
        if (groups[group].id) {
            Groups_AppendGroupToList(groups[group].id, groups[group].name, groups[group].font, true);
        }
        if (document.querySelectorAll('.group').length == Object.keys(groups).length) {
            Groups_RearrangeGroupsButtons();
            setTimeout(function() {Groups_RearrangeGroupsLists();}, 50);
        }
    }
}

function Groups_RearrangeGroupsButtons(first_loop) {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    let query = document.querySelectorAll('.group_button');
    for (let s of query) {
        let groupId = (s.id).substr(1);
        if (tt.groups[groupId]) {
            if (s.parentNode.childNodes[tt.groups[groupId].index] != undefined) {
                let Ind = Array.from(s.parentNode.children).indexOf(s);
                if (Ind > tt.groups[groupId].index) {
                    DOM_InsterBeforeNode(s, s.parentNode.childNodes[tt.groups[groupId].index]);
                } else {
                    DOM_InsertAfterNode(s, s.parentNode.childNodes[tt.groups[groupId].index]);
                }
                let newInd = Array.from(s.parentNode.children).indexOf(s);
                if (newInd != tt.groups[groupId].index && first_loop) Groups_RearrangeGroupsButtons(false);
            }
        }
    }
}

function Groups_RearrangeGroupsLists() {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    let activegroup = document.getElementById(tt.active_group);
    let scroll = activegroup.scrollTop;
    let groups = document.getElementById('groups');
    let query = document.querySelectorAll('.group_button');
    for (let s of query) {
        let group = document.getElementById((s.id).substr(1));
        if (group != null) groups.appendChild(group);
    }
    activegroup.scrollTop = scroll;
}

function Groups_UpdateBgGroupsOrder() {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    let query = document.querySelectorAll('.group_button');
    for (let s of query) {
        if (tt.groups[(s.id).substr(1)]) tt.groups[(s.id).substr(1)].index = Array.from(s.parentNode.children).indexOf(s);
    }
    Groups_SaveGroups();
    tt.schedule_update_data++;
}

function Groups_GenerateNewGroupID() {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    let newID = '';
    while (newID == '') {
        newID = 'g_' + GenerateRandomID();
        if (document.getElementById(newID) != null) newID = '';
    }
    return newID;
}

function Groups_GroupRemove(groupId, close_tabs) {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name + ': close_tabs:' + close_tabs + ': remove group, delete tabs if close_tabs is true');
    if (close_tabs) {
        let tabIds = Array.prototype.map.call(document.querySelectorAll('#' + groupId + ' .tab'), function(s) {return parseInt(s.id);});
        Tabs_CloseTabs(tabIds);
        let query = document.querySelectorAll('#' + groupId + ' .folder');
        for (let s of query) {
            Folders_RemoveFolder(s.id);
        }
    } else {
        let TabList = document.getElementById('°tab_list');
        let GroupList = document.getElementById('°' + groupId);
        if (TabList != null && GroupList != null) {
            while (GroupList.firstChild) {
                TabList.appendChild(GroupList.firstChild);
            }
        }
        DOM_RefreshExpandStates();
        DOM_RefreshCounters();
    }
    if (groupId != 'tab_list') {
        delete tt.groups[groupId];
        let active_tab_is_pin = document.querySelector('.pin.active_tab');
        if (groupId == tt.active_group && active_tab_is_pin == null) {
            if (document.getElementById('_' + groupId).previousSibling) {
                Groups_SetActiveGroup((document.getElementById('_' + groupId).previousSibling.id).substr(1), true, true);
            } else {
                if (document.getElementById('_' + groupId).nextSibling) {
                    Groups_SetActiveGroup((document.getElementById('_' + groupId).nextSibling.id).substr(1), true, true);
                } else {
                    Groups_SetActiveGroup('tab_list', true, true);
                }
            }
        }
        let group = document.getElementById(groupId);
        if (group != null) group.parentNode.removeChild(group);
        let groupButton = document.getElementById('_' + groupId);
        if (groupButton != null) groupButton.parentNode.removeChild(groupButton);
    }
    Groups_SaveGroups();
    tt.schedule_update_data++;
}

function Groups_KeepOnlyOneActiveTabInGroup() {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    let active_tabs = document.querySelectorAll('#' + tt.active_group + ' .active_tab');
    if (active_tabs.length > 1) {
        chrome.tabs.query({currentWindow: true, active: true}, function(activeTab) {
            Tabs_SetActiveTab(activeTab[0].id, false);
        });
    }
}

function Groups_SetActiveGroup(groupId, switch_to_active_in_group, scroll_to_active) {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name + ': groupId: ' + groupId + ', switch_to_active_in_group: ' + switch_to_active_in_group + ', scroll_to_active: ' + scroll_to_active);
    let group = document.getElementById(groupId);
    if (group != null) {
        tt.active_group = groupId;
        let query = document.querySelectorAll('.group_button');
        for (let s of query) {
            s.classList.remove('active_group');
        }
        document.getElementById('_' + groupId).classList.add('active_group');
        query = document.querySelectorAll('.group');
        for (let s of query) {
            s.style.display = 'none';
        }
        group.style.display = '';
        DOM_RefreshGUI();
        DOM_HideRenameDialogs();
        let activeTab = document.querySelector('#' + groupId + ' .active_tab');
        if (activeTab != null) {
            if (switch_to_active_in_group) chrome.tabs.update(parseInt(activeTab.id), {active: true});
            if (scroll_to_active && tt.tabs[activeTab.id]) tt.tabs[activeTab.id].ScrollToTab();
            Groups_KeepOnlyOneActiveTabInGroup();
        }
        if (groupId == 'tab_list') {
            let query = document.querySelectorAll('#button_remove_group, #button_edit_group');
            for (let s of query) {
                s.classList.add('disabled');
            }
        } else {
            let query = document.querySelectorAll('#button_remove_group, #button_edit_group');
            for (let s of query) {
                s.classList.remove('disabled');
            }
        }
        chrome.runtime.sendMessage({command: 'set_active_group', active_group: groupId, windowId: tt.CurrentWindowId});
        DOM_RefreshExpandStates();
        DOM_RefreshCounters();
        if (browserId == 'F' && opt.hide_other_groups_tabs_firefox) {
            let HideTabIds = Array.prototype.map.call(document.querySelectorAll(".group:not([id='" + groupId + "']) .tab"), function(s) {
                return parseInt(s.id);
            });
            let ShowTabIds = Array.prototype.map.call(document.querySelectorAll('#' + groupId + ' .tab'), function(s) {
                return parseInt(s.id);
            });
            browser.tabs.hide(HideTabIds);
            browser.tabs.show(ShowTabIds);
        }
    }
}

function Groups_SetActiveTabInGroup(groupId, tabId) {
    if (document.querySelector('#' + groupId + " [id='" + tabId + "']") != null && tt.groups[groupId] != undefined) {
        if (groupId != tt.active_group) Groups_SetActiveGroup(groupId, false, true);
        if (tt.groups[groupId]) {
            tt.groups[groupId].prev_active_tab = tt.groups[groupId].active_tab;
            tt.groups[groupId].active_tab = parseInt(tabId);
        }
        Groups_SaveGroups();
        tt.schedule_update_data++;
    }
}

function Groups_ShowGroupEditWindow(groupId) { // Edit group popup
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    DOM_HideRenameDialogs();
    if (tt.groups[groupId]) {
        let name = document.getElementById('group_edit_name');
        name.value = tt.groups[groupId].name;
        let groupEditDialog = document.getElementById('group_edit');
        groupEditDialog.setAttribute('groupId', groupId);
        DOM_SetStyle(groupEditDialog, {display: 'block', left: '', top: document.getElementById('toolbar').getBoundingClientRect().height + document.getElementById('pin_list').getBoundingClientRect().height + 8 + 'px'});
        let DefaultGroupButtonFontColor = window.getComputedStyle(document.getElementById('body'), null).getPropertyValue('--group_list_default_font_color');
        let GroupEditFont = document.getElementById('group_edit_font');
        GroupEditFont.style.backgroundColor = (tt.groups[groupId].font == '' ? DefaultGroupButtonFontColor : '#' + tt.groups[groupId].font);
        setTimeout(function() {document.getElementById('group_edit_name').select();}, 5);
    }
}

function Groups_GroupEditConfirm() { // when pressed OK in group popup
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    let groupId = document.getElementById('group_edit').getAttribute('groupId');
    if (tt.groups[groupId]) {
        let GroupEditName = document.getElementById('group_edit_name');
        tt.groups[groupId].name = GroupEditName.value;
        let GroupEditFont = document.getElementById('group_edit_font');
        let DefaultGroupButtonFontColor = window.getComputedStyle(document.getElementById('body'), null).getPropertyValue('--group_list_default_font_color');
        let ThisGroupButtonFontColor = Utils_RGBtoHex(GroupEditFont.style.backgroundColor);
        if ('#' + ThisGroupButtonFontColor != DefaultGroupButtonFontColor) {
            tt.groups[groupId].font = ThisGroupButtonFontColor;
            document.getElementById('_gte' + groupId).style.color = '#' + ThisGroupButtonFontColor;
        }
        DOM_HideRenameDialogs();
        DOM_RefreshGUI();
        Groups_SaveGroups();
        tt.schedule_update_data++;
    }
}

function Groups_RestoreStateOfGroupsToolbar() {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    chrome.runtime.sendMessage({command: 'get_group_bar', windowId: tt.CurrentWindowId}, function(response) {
        let toolbarGroups = document.getElementById('toolbar_groups');
        if (response == true) {
            DOM_SetStyle(toolbarGroups, {display: 'inline-block', width: '19px', borderRight: '1px solid var(--group_list_borders)'});
            toolbarGroups.classList.remove('hidden');
        } else {
            DOM_SetStyle(toolbarGroups, {display: 'none', width: '0px', borderRight: 'none'});
            toolbarGroups.classList.add('hidden');
        }
    });
}

function Groups_GroupsToolbarToggle() {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    let toolbarGroups = document.getElementById('toolbar_groups');
    toolbarGroups.classList.toggle('hidden');
    if (toolbarGroups.classList.contains('hidden')) {
        DOM_SetStyle(toolbarGroups, {display: 'none', width: '0px', borderRight: 'none'});
        chrome.runtime.sendMessage({command: 'set_group_bar', group_bar: false, windowId: tt.CurrentWindowId});
    } else {
        DOM_SetStyle(toolbarGroups, {display: 'inline-block', width: '19px', borderRight: '1px solid var(--group_list_borders)'});
        chrome.runtime.sendMessage({command: 'set_group_bar', group_bar: true, windowId: tt.CurrentWindowId});
    }
    DOM_RefreshGUI();
}

function Groups_ActionClickGroup(Node, bgOption) {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name + ': bgOption = ' + bgOption);
    if (bgOption == 'new_tab') {
        if (Node.id == 'pin_list') Tabs_OpenNewTab(true, undefined, undefined, true);
        if (Node.classList.contains('group')) Tabs_OpenNewTab(false, undefined, Node.id, true);
    }
    if (bgOption == 'activate_previous_active') {
        chrome.tabs.update(parseInt(tt.groups[tt.active_group].prev_active_tab), {active: true});
    }
    if (bgOption == 'undo_close_tab') {
        chrome.sessions.getRecentlyClosed(null, function(sessions) {
            if (sessions.length > 0) chrome.sessions.restore(null, function(restored) {});
        });
    }
}

function Groups_SetActiveTabInEachGroup() {
    if (opt.debug) Utils_log('groups.js: ' + arguments.callee.name);
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        if (tabs.length) {
            Tabs_SetActiveTab(tabs[0].id);
            chrome.runtime.sendMessage({command: 'get_active_group', windowId: tt.CurrentWindowId}, function(response) {
                if (response) {
                    Groups_SetActiveGroup(response, false, true);
                    for (var group in tt.groups) {
                        let ActiveInGroup = document.querySelector('#' + group + " [id='" + tt.groups[group].active_tab + "']");
                        if (ActiveInGroup != null) ActiveInGroup.classList.add('active_tab');
                    }
                    if (tabs[0].pinned) {
                        let ActiveTabinActiveGroup = document.querySelectorAll('#' + tt.active_group + ' .active_tab');
                        if (ActiveTabinActiveGroup != null) {
                            for (let s of ActiveTabinActiveGroup) {
                                s.classList.remove('active_tab');
                            }
                        }
                    }
                } else {
                    Groups_SetActiveGroup('tab_list', false, true);
                }
            });
        }
    });
}
