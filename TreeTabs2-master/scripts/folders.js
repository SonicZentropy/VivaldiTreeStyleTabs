function Folders_AddNewFolder(p) { // folderId: string, ParentId: string, InsertAfterId: tabId or folderId, Name: string, Index: int, ExpandState: ("o","c"), AdditionalClass: string, SkipSetEvents: bool
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name + ' parms: ' + JSON.stringify(p));
    let newId = p.folderId ? p.folderId : Folders_GenerateNewFolderID();
    tt.folders[newId] = {id: newId, parent: (p.ParentId ? p.ParentId : ''), index: (p.Index ? p.Index : 0), name: (p.Name ? p.Name : labels.noname_group), expand: (p.ExpandState ? p.ExpandState : '')};
    Folders_AppendFolder({folderId: newId, Name: tt.folders[newId].name, InsertAfterId: p.InsertAfterId, ParentId: p.ParentId, ExpandState: p.ExpandState, SkipSetEvents: p.SkipSetEvents, AdditionalClass: p.AdditionalClass});
    Folders_SaveFolders();
    DOM_RefreshCounters();
    DOM_RefreshExpandStates();
    return newId;
}

function Folders_AppendFolder(p) { // folderId: string, ParentId: string, Name: string, ExpandState: ("o","c"), AdditionalClass: string, SetEvents: bool
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name + ' parms: ' + JSON.stringify(p));
    let ClassList = 'folder';
    if (p.ExpandState) ClassList += ' ' + p.ExpandState;
    if (p.AdditionalClass != undefined) ClassList += ' ' + p.AdditionalClass;
    if (document.getElementById(p.folderId) == null) {
        let DIV_folder = DOM_New('div', undefined, {id: p.folderId, className: ClassList});
        let DIV_header = DOM_New('div', DIV_folder, {id: ('folder_header_' + p.folderId), className: ((opt.always_show_close && !opt.never_show_close) ? 'folder_header close_show' : 'folder_header'), draggable: (!p.SkipSetEvents ? true : false)});
        let DIV_expand = DOM_New('div', DIV_header, {id: ('folder_expand_' + p.folderId), className: 'folder_icon'});
        let DIV_counter = DOM_New('div', DIV_header, {id: ('folder_counter_' + p.folderId), className: 'folder_counter'});
        DOM_New('div', DIV_counter, {id: ('folder_counter_number_' + p.folderId), className: 'counter_number'});
        DOM_New('div', DIV_header, {id: ('folder_title_' + p.folderId), className: 'folder_title', textContent: p.Name});
        let DIV_children = DOM_New('div', DIV_folder, {id: ('°' + p.folderId), className: 'children'});
        DOM_New('div', DIV_folder, {id: (p.folderId + '_drag_indicator'), className: 'drag_indicator'});
        let DIV_close_button = DOM_New('div', DIV_header, {id: ('close' + p.folderId), className: (opt.never_show_close ? 'close hidden' : 'close')});
        DOM_New('div', DIV_close_button, {id: ('close_img' + p.folderId), className: (opt.never_show_close ? 'close_img hidden' : 'close_img')});
        if (!p.SkipSetEvents) {
            DIV_children.ondblclick = function(event) {
                if (event.target == this) Groups_ActionClickGroup(this.parentNode, opt.dbclick_group);
            };
            DIV_children.onclick = function(event) {
                if (event.target == this && event.which == 1) DOM_Deselect();
            };
            DIV_children.onmousedown = function(event) {
                event.stopImmediatePropagation();
                if (event.target == this) {
                    if (event.which == 2 && event.target == this) Groups_ActionClickGroup(this.parentNode, opt.midclick_group);
                    if (event.which == 3) Menu_ShowFGlobalMenu(event);
                }
            };
            if (!opt.never_show_close) {
                DIV_close_button.onmousedown = function(event) {
                    event.stopImmediatePropagation();
                    if (event.which != 3) Folders_RemoveFolder(this.parentNode.parentNode.id);
                };
                DIV_close_button.onmouseenter = function(event) {
                    this.classList.add('close_hover');
                };
                DIV_close_button.onmouseleave = function(event) {
                    this.classList.remove('close_hover');
                };
            }
            DIV_header.onclick = function(event) {
                if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains('folder_header')) DOM_Deselect();
            };
            DIV_header.onmousedown = function(event) {
                event.stopImmediatePropagation();
                if (tt.DOMmenu.style.top != '-1000px') Menu_HideMenus();
                if (event.which == 1) DOM_Select(event, this.parentNode);
                if (event.which == 2) {
                    event.preventDefault();
                    Folders_ActionClickFolder(this.parentNode, opt.midclick_folder);
                }
                if (event.which == 3) Menu_ShowFolderMenu(this.parentNode, event); // SHOW FOLDER MENU
            };
            DIV_header.ondblclick = function(event) { // edit folder
                if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains('folder_header')) Folders_ActionClickFolder(this.parentNode, opt.dbclick_folder);
            };
            DIV_header.ondragstart = function(event) { // DRAG START
                event.stopPropagation();
                event.dataTransfer.setDragImage(document.getElementById('DragImage'), 0, 0);
                event.dataTransfer.setData('text', '');
                event.dataTransfer.setData('SourceWindowId', tt.CurrentWindowId);
                DOM_CleanUpDragAndDrop();
                tt.Dragging = true;
                tt.DraggingGroup = false;
                tt.DragTreeDepth = -1;
                let Nodes = [];
                if (this.parentNode.classList.contains('selected')) {
                    DOM_FreezeSelection(false);
                } else {
                    DOM_FreezeSelection(true);
                    DOM_SetClasses(this.parentNode, ['selected_temporarly', 'selected'], [], []);
                }
                DOM_RemoveHeadersHoverClass();
                let selected = document.querySelectorAll('.selected, .selected .tab, .selected .folder');
                for (let s of selected) {
                    s.classList.add('dragged_tree');
                    if (s.classList.contains('pin')) {
                        tt.DraggingPin = true;
                        Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains('selected'), temporary: s.classList.contains('selected_temporarly'), NodeClass: 'pin'});
                    }
                    if (s.classList.contains('tab')) {
                        tt.DraggingTab = true;
                        Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains('selected'), temporary: s.classList.contains('selected_temporarly'), NodeClass: 'tab'});
                    }
                    if (s.classList.contains('folder')) {
                        tt.DraggingFolder = true;
                        Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains('selected'), temporary: s.classList.contains('selected_temporarly'), NodeClass: 'folder', index: (tt.folders[s.id] ? tt.folders[s.id].index : 0), name: (tt.folders[s.id] ? tt.folders[s.id].name : labels.noname_group), expand: (tt.folders[s.id] ? tt.folders[s.id].expand : '')});
                    }
                }
                let DraggedFolderParents = DOM_GetParentsByClass(this.parentNode, 'folder');
                for (let s of DraggedFolderParents) {
                    s.classList.add('dragged_parents');
                }
                event.dataTransfer.setData('Nodes', JSON.stringify(Nodes));
                event.dataTransfer.setData('NodesTypes', JSON.stringify({DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder}));
                chrome.runtime.sendMessage({command: 'drag_start', DragTreeDepth: tt.DragTreeDepth, DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder});
            };
            DIV_header.ondragenter = function(event) {
                this.classList.remove('folder_header_hover');
            };
            DIV_header.ondragend = function(event) {
                if (opt.open_tree_on_hover) {
                    clearTimeout(tt.DragOverTimer);
                    tt.DragOverId = '';
                }
                setTimeout(function() {DOM_CleanUpDragAndDrop();}, 300);
                setTimeout(function() {chrome.runtime.sendMessage({command: 'drag_end'});}, 500);
            };
            DIV_header.onmouseover = function(event) {
                this.classList.add('folder_header_hover');
                if (opt.never_show_close == false && opt.always_show_close == false) this.classList.add('close_show');
            };
            DIV_header.onmouseleave = function(event) {
                this.classList.remove('folder_header_hover');
                if (opt.never_show_close == false && opt.always_show_close == false) this.classList.remove('close_show');
            };
            DIV_header.ondragleave = function(event) {
                DOM_RemoveHighlight();
            };
            DIV_header.ondragover = function(event) {
                if (tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder) && this.parentNode.classList.contains('dragged_tree') == false) {
                    if (this.parentNode.classList.contains('before') == false && event.layerY < this.clientHeight / 3) {
                        DOM_RemoveHighlight();
                        DOM_SetClasses(this.parentNode, ['before', 'highlighted_drop_target'], ['inside', 'after'], []);
                    }
                    if (this.parentNode.classList.contains('inside') == false && event.layerY > this.clientHeight / 3 && event.layerY <= 2 * (this.clientHeight / 3)) {
                        DOM_RemoveHighlight();
                        DOM_SetClasses(this.parentNode, ['inside', 'highlighted_drop_target'], ['before', 'after'], []);
                    }
                    if (this.parentNode.classList.contains('after') == false && this.parentNode.classList.contains('o') == false && event.layerY > 2 * (this.clientHeight / 3)) {
                        DOM_RemoveHighlight();
                        DOM_SetClasses(this.parentNode, ['after', 'highlighted_drop_target'], ['inside', 'before'], []);
                    }
                }
                if (opt.open_tree_on_hover && tt.DragOverId != this.id) {
                    if (this.parentNode.classList.contains('c') && this.parentNode.classList.contains('dragged_tree') == false) {
                        clearTimeout(tt.DragOverTimer);
                        tt.DragOverId = this.id;
                        let This = this;
                        tt.DragOverTimer = setTimeout(function() {
                            if (tt.DragOverId == This.id) DOM_SetClasses(This.parentNode, ['o'], ['c'], []);
                        }, 1500);
                    }
                }
            };
            DIV_expand.onmousedown = function(event) {
                event.stopPropagation();
                if (tt.DOMmenu.style.top != '-1000px') Menu_HideMenus();
                if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target == this) { // EXPAND/COLLAPSE FOLDER
                    event.stopPropagation();
                    DOM_EventExpandBox(this.parentNode.parentNode);
                    DOM_RefreshExpandStates();
                    DOM_RefreshCounters();
                }
            };
        }
        if (p.ParentId == 'pin_list' || p.ParentId == '' || p.ParentId == undefined || document.getElementById('°' + p.ParentId) == null) {
            document.getElementById('°' + tt.active_group).appendChild(DIV_folder);
        } else {
            document.getElementById('°' + p.ParentId).appendChild(DIV_folder);
        }
        if (p.InsertAfterId) {
            let After = document.getElementById(p.InsertAfterId);
            if (After != null) DOM_InsertAfterNode(DIV_folder, After);
        }
    }
}

function Folders_GenerateNewFolderID() {
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name);
    let newID = '';
    while (newID == '') {
        newID = 'f_' + GenerateRandomID();
        if (document.getElementById(newID) != null) newID = '';
    }
    return newID;
}

function Folders_PreAppendFolders(folders) {
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name);
    for (let folderId in folders) {Folders_AppendFolder({folderId: folderId, Name: folders[folderId].name, ParentId: 'tab_list', ExpandState: folders[folderId].expand});}
}

function Folders_AppendFolders(folders) {
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name);
    for (let folderId in folders) {
        let f = document.getElementById(folderId);
        let parent = document.getElementById('°' + folders[folderId].parent);
        if (f != null && parent != null && folders[folderId].parent != f.parentNode.parentNode.id && parent.parentNode.classList.contains('pin') == false) parent.appendChild(f);
    }
}

function Folders_SaveFolders() {
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name);
    let query = document.querySelectorAll('.folder');
    for (let s of query) {
        tt.folders[s.id].parent = s.parentNode.parentNode.id;
        tt.folders[s.id].index = Array.from(s.parentNode.children).indexOf(s);
        tt.folders[s.id].expand = (s.classList.contains('c') ? 'c' : (s.classList.contains('o') ? 'o' : ''));
    }
    chrome.runtime.sendMessage({command: 'save_folders', folders: tt.folders, windowId: tt.CurrentWindowId});
}

function Folders_RemoveFolder(FolderId) {
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name);
    let folder = document.getElementById(FolderId);
    if (folder != null) {
        if (opt.promote_children == true) {
            if (opt.promote_children_in_first_child == true && folder.childNodes[1].childNodes.length > 1) {
                DOM_PromoteChildrenToFirstChild(folder);
            } else {
                let Children = folder.childNodes[1];
                while (Children.lastChild) {
                    DOM_InsertAfterNode(Children.lastChild, folder);
                }
            }
        } else {
            let query = document.querySelectorAll('#' + FolderId + ' .tab');
            for (let s of query) {
                chrome.tabs.remove(parseInt(s.id), null);
            }
            query = document.querySelectorAll('#' + FolderId + ' .folder');
            for (let s of query) {
                delete tt.folders[s.id];
            }
        }
        folder.parentNode.removeChild(folder);
        delete tt.folders[FolderId];
        DOM_RefreshExpandStates();
        chrome.runtime.sendMessage({command: 'save_folders', folders: tt.folders, windowId: tt.CurrentWindowId});
    }
}

function Folders_ShowRenameFolderDialog(FolderId) { // Rename folder popup
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name);
    DOM_HideRenameDialogs();
    if (tt.folders[FolderId]) {
        let name = document.getElementById('folder_edit_name');
        name.value = tt.folders[FolderId].name;
        let folderEditDialog = document.getElementById('folder_edit');
        folderEditDialog.setAttribute('FolderId', FolderId);
        DOM_SetStyle(folderEditDialog, {display: 'block', left: '', top: document.getElementById('toolbar').getBoundingClientRect().height + document.getElementById('pin_list').getBoundingClientRect().height + 8 + 'px'});
        setTimeout(function() {document.getElementById('folder_edit_name').select();}, 5);
    }
}

function Folders_FolderRenameConfirm() { // when pressed OK in folder popup
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name);
    let name = document.getElementById('folder_edit_name');
    let FolderId = document.getElementById('folder_edit').getAttribute('FolderId');
    tt.folders[FolderId].name = name.value;
    document.getElementById('folder_title_'+ FolderId).textContent = name.value;
    DOM_HideRenameDialogs();
    chrome.runtime.sendMessage({command: 'save_folders', folders: tt.folders, windowId: tt.CurrentWindowId});
    DOM_RefreshCounters();
}

function Folders_ActionClickFolder(FolderNode, bgOption) {
    if (opt.debug) Utils_log('folders.js: ' + arguments.callee.name + ': folderId ' + FolderNode.id + ', bgOption: ' + bgOption);
    if (bgOption == 'rename_folder') Folders_ShowRenameFolderDialog(FolderNode.id);
    if (bgOption == 'new_folder') {
        let FolderId = Folders_AddNewFolder({ParentId: FolderNode.id});
        Folders_ShowRenameFolderDialog(FolderId);
    }
    if (bgOption == 'new_tab') Tabs_OpenNewTab(false, undefined, FolderNode.id, (opt.append_child_tab === 'bottom' ? true : false));
    if (bgOption == 'expand_collapse') DOM_EventExpandBox(FolderNode);
    if (bgOption == 'close_folder') Folders_RemoveFolder(FolderNode.id);
    if (bgOption == 'unload_folder') {
        let tabsArr = [];
        let query = document.querySelectorAll('#' + FolderNode.id + ' .tab');
        for (let s of query) {
            tabsArr.push(parseInt(s.id));
        }
        Tabs_DiscardTabs(tabsArr);
    }
}
