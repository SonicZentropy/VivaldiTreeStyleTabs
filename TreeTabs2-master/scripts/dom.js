function DOM_SetEvents() {
  if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
  let PinList = document.getElementById('pin_list');
    if (!opt.switch_with_scroll) {
        PinList.onmousewheel = function(event) {
            let pinList = document.getElementById('pin_list');
            let direction = (event.wheelDelta > 0 || event.detail < 0) ? -1 : 1;
            let speed = 0.1;
            for (let t = 1; t < 40; t++) {
                setTimeout(function() {
                    if (t < 30) {
                        speed = speed + 0.1; // accelerate
                    } else {
                        speed = speed - 0.3; // decelerate
                    }
                    pinList.scrollLeft = pinList.scrollLeft + (direction * speed);
                }, t);
            }
        };
    }
    window.addEventListener('contextmenu', function(event) {
// always disable the default right-click menu, even when debug mode is enabled
        if (event.target.classList.contains('text_input') == false && opt.debug == false) {
//        if (event.target.classList.contains('text_input') == false) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
    }, false);
    document.getElementById('body').addEventListener('contextmenu', function(event) {
        if (event.target.classList.contains('text_input') == false && opt.debug == false) {
//        if (event.target.classList.contains('text_input') == false) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
    }, false);
    document.body.onresize = function(event) {
        DOM_RefreshGUI();
    };
    document.body.onmousedown = function(event) {
        if (event.which == 2) event.preventDefault();
        if (event.which == 1 && event.target.classList.contains('menu_item') == false) Menu_HideMenus();
        event.stopImmediatePropagation();
        if (event.which == 1) DOM_RemoveHeadersHoverClass();
    };
    document.getElementById('folder_edit_confirm').onmousedown = function(event) {
        if (event.which == 1) Folders_FolderRenameConfirm();
    };
    document.getElementById('folder_edit_discard').onmousedown = function(event) {
        if (event.which == 1) DOM_HideRenameDialogs();
    };
    document.getElementById('group_edit_confirm').onmousedown = function(event) {
        if (event.which == 1) Groups_GroupEditConfirm();
    };
    document.getElementById('group_edit_discard').onmousedown = function(event) {
        if (event.which == 1) DOM_HideRenameDialogs();
    };
    document.getElementById('folder_edit_name').onkeydown = function(event) {
        if (event.keyCode == 13) Folders_FolderRenameConfirm();
        if (event.which == 27) DOM_HideRenameDialogs();
    };
    document.getElementById('group_edit_name').onkeydown = function(event) {
        if (event.keyCode == 13) Groups_GroupEditConfirm();
        if (event.which == 27) DOM_HideRenameDialogs();
    };
    PinList.onclick = function(event) {
        if (event.which == 1 && event.target == this) {
            if (opt.pin_list_multi_row || (opt.pin_list_multi_row == false && event.clientY < (this.childNodes[0].getBoundingClientRect().height + this.getBoundingClientRect().top))) DOM_Deselect();
        }
    };
    PinList.onmousedown = function(event) {
        if (event.which == 1 && event.target == this) {
            if (opt.pin_list_multi_row || (opt.pin_list_multi_row == false && event.clientY < (this.childNodes[0].getBoundingClientRect().height + this.getBoundingClientRect().top))) Menu_HideMenus();
        }
        if (event.which == 2 && event.target == this) Groups_ActionClickGroup(this, opt.midclick_group);
        if (event.which == 3 && event.target == this) Menu_ShowFGlobalMenu(event);
    };
    PinList.ondragover = function(event) {
        if (event.target.id == 'pin_list' && tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder) && this.classList.contains('highlighted_drop_target') == false) {
            DOM_RemoveHighlight();
            this.classList.add('highlighted_drop_target');
        }
    };
    PinList.ondblclick = function(event) {
        if (event.target == this) Groups_ActionClickGroup(this, opt.dbclick_group);
    };
    document.getElementById('group_edit_font').onclick = function(event) {
        if (event.which == 1) {
            event.stopPropagation();
            let ColorPicker = document.getElementById('color_picker');
            ColorPicker.setAttribute('PickColor', this.id);
            ColorPicker.value = '#' + Utils_RGBtoHex(this.style.backgroundColor);
            ColorPicker.focus();
            ColorPicker.click();
        }
    };
    document.getElementById('color_picker').oninput = function(event) {
        document.getElementById(this.getAttribute('PickColor')).style.backgroundColor = this.value;
    };
    document.getElementById('group_list').ondragleave = function(event) {
        if (opt.open_tree_on_hover) {
            clearTimeout(tt.DragOverTimer);
            tt.DragOverId = '';
        }
    };
    document.body.onkeydown = function(event) {
        if (event.ctrlKey && event.which == 65) { // ctrl+a to select all
            if (document.querySelector('.pin>.tab_header_hover') != null) {
                let query = document.querySelectorAll('.pin');
                for (let s of query) {
                    s.classList.add('selected');
                }
            }
            if (document.querySelectorAll('#' + tt.active_group + ' .tab>.tab_header_hover, #' + tt.active_group + ' .folder>.folder_header_hover').length > 0) {
                let rootId = document.querySelectorAll('#' + tt.active_group + ' .tab>.tab_header_hover, #' + tt.active_group + ' .folder>.folder_header_hover')[0].parentNode.parentNode.parentNode.id;
                let query = document.querySelectorAll('#°' + rootId + '>.folder, #°' + rootId + '>.tab');
                for (let s of query) {
                    s.classList.add('selected');
                }
            }
        }
        if (event.ctrlKey && event.which == 73) { // ctrl+i to invert selection
            if (document.querySelector('.pin>.tab_header_hover') != null) {
                let query = document.querySelectorAll('.pin');
                for (let s of query) {
                    s.classList.toggle('selected');
                }
            }
            if (document.querySelectorAll('#' + tt.active_group + ' .tab>.tab_header_hover, #' + tt.active_group + ' .folder>.folder_header_hover').length > 0) {
                let rootId = document.querySelectorAll('#' + tt.active_group + ' .tab>.tab_header_hover, #' + tt.active_group + ' .folder>.folder_header_hover')[0].parentNode.parentNode.parentNode.id;
                let query = document.querySelectorAll('#°' + rootId + '>.folder, #°' + rootId + '>.tab');
                for (let s of query) {
                    s.classList.toggle('selected');
                }
            }
        }
        if (event.which == 27) DOM_Deselect(); // esc to unselect tabs and folders
        if (event.altKey && event.which == 71) Groups_GroupsToolbarToggle(); // alt+g to toggle group bar
        if (event.which == 192 || event.which == 70) { // new folder
            if (tt.pressed_keys.indexOf(event.which) == -1) tt.pressed_keys.push(event.which);
            if (tt.pressed_keys.indexOf(192) != -1 && tt.pressed_keys.indexOf(70) != -1) {
                let FolderId = Folders_AddNewFolder({});
                Folders_ShowRenameFolderDialog(FolderId);
            }
        }
        DOM_RefreshGUI();
    };

    document.body.onkeyup = function(event) {
        if (tt.pressed_keys.indexOf(event.which) != -1) tt.pressed_keys.splice(tt.pressed_keys.indexOf(event.which), 1);
    };
    document.body.ondragover = function(event) {
        event.preventDefault();
    };
    document.ondrop = function(event) {
        if (opt.debug) Utils_log('manager.js: ' + arguments.callee.name + ': dropped on window: ' + tt.CurrentWindowId);
        let Nodes = event.dataTransfer.getData('Nodes') ? JSON.parse(event.dataTransfer.getData('Nodes')) : [];
        let NodesTypes = event.dataTransfer.getData('NodesTypes') ? JSON.parse(event.dataTransfer.getData('NodesTypes')) : {DraggingGroup: false, DraggingPin: false, DraggingTab: false, DraggingFolder: false};
        let Group = event.dataTransfer.getData('Group') ? JSON.parse(event.dataTransfer.getData('Group')) : {};
        let SourceWindowId = event.dataTransfer.getData('SourceWindowId') ? JSON.parse(event.dataTransfer.getData('SourceWindowId')) : 0;
        let target = document.querySelector('.highlighted_drop_target');
        let where = target ? (target.classList.contains('before') ? 'before' : (target.classList.contains('after') ? 'after' : 'inside')) : '';
        let ActiveGroup = document.getElementById(tt.active_group);
        let Scroll = ActiveGroup.scrollTop;
        clearTimeout(tt.DragOverTimer);
        tt.DragOverId = '';
        tt.Dragging = false;
        chrome.runtime.sendMessage({command: 'drag_end'});
        event.preventDefault();
        if (SourceWindowId == tt.CurrentWindowId) {
            DOM_DropToTarget({NodesTypes: NodesTypes, Nodes: Nodes, TargetNode: target, where: where, Group: Group, Scroll: Scroll});
        } else {
            DOM_FreezeSelection();
            if (NodesTypes.DraggingGroup) {
                tt.groups[Group.id] = Object.assign({}, Group);
                Groups_AppendGroupToList(Group.id, Group.name, Group.font, true);
            }
            let TabsIds = [];
            for (let i = 0; i < Nodes.length; i++) {
                if (Nodes[i].NodeClass == 'folder') {
                    Folders_AddNewFolder({folderId: Nodes[i].id, ParentId: Nodes[i].parent, Name: Nodes[i].name, Index: Nodes[i].index, ExpandState: Nodes[i].expand});
                    chrome.runtime.sendMessage({command: 'remove_folder', folderId: Nodes[i].id});
                }
                if (Nodes[i].NodeClass == 'pin') {
                    chrome.tabs.update(parseInt(Nodes[i].id), {pinned: false});
                    TabsIds.push(parseInt(Nodes[i].id));
                }
                if (Nodes[i].NodeClass == 'tab') TabsIds.push(parseInt(Nodes[i].id));
            }
            chrome.tabs.move(TabsIds, {windowId: tt.CurrentWindowId, index: -1}, function(MovedTab) {
                let Stop = 500;
                let DropNodes = setInterval(function() {
                    Stop--;
                    let all_ok = true;
                    for (let i = 0; i < Nodes.length; i++) {
                        if (document.getElementById(Nodes[i].id) == null) all_ok = false;
                    }
                    DOM_DropToTarget({NodesTypes: NodesTypes, Nodes: Nodes, TargetNode: target, where: where, Group: Group, Scroll: Scroll});
                    if (NodesTypes.DraggingGroup) chrome.runtime.sendMessage({command: 'remove_group', groupId: Group.id});
                    if (all_ok || Stop < 0) {
                        setTimeout(function() {
                            clearInterval(DropNodes);
                        }, 300);
                    }
                }, 100);
            });
        }
    };
    document.ondragleave = function(event) {
        DOM_RemoveHighlight();
        if (opt.open_tree_on_hover) {
            clearTimeout(tt.DragOverTimer);
            tt.DragOverId = '';
        }
    };
    document.ondragend = function(event) {
        let Nodes = event.dataTransfer.getData('Nodes') ? JSON.parse(event.dataTransfer.getData('Nodes')) : [];
        let NodesTypes = event.dataTransfer.getData('NodesTypes') ? JSON.parse(event.dataTransfer.getData('NodesTypes')) : {DraggingGroup: false, DraggingPin: false, DraggingTab: false, DraggingFolder: false};
        let Group = event.dataTransfer.getData('Group') ? JSON.parse(event.dataTransfer.getData('Group')) : {};
        setTimeout(function() {
            if (tt.Dragging && ((browserId == 'F' && (event.screenX < event.view.mozInnerScreenX || event.screenX > (event.view.mozInnerScreenX + window.innerWidth) || event.screenY < event.view.mozInnerScreenY || event.screenY > (event.view.mozInnerScreenY + window.innerHeight))) || (browserId != 'F' && (event.pageX < 0 || event.pageX > window.outerWidth || event.pageY < 0 || event.pageY > window.outerHeight)))) Tabs_Detach(Nodes, NodesTypes, Group);
            DOM_CleanUpDragAndDrop();
            tt.Dragging = false;
            chrome.runtime.sendMessage({command: 'drag_end'});
        }, 300);
        if (opt.open_tree_on_hover) {
            clearTimeout(tt.DragOverTimer);
            tt.DragOverId = '';
        }
    };
}

function DOM_BindTabsSwitchingToMouseWheel(Id) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    document.getElementById(Id).onwheel = function(event) {
        event.preventDefault();
        let prev = event.deltaY < 0;
        if (prev) {
            Tabs_ActivatePrevTab(true);
        } else {
            Tabs_ActivateNextTab(true);
        }
    };
}

function DOM_InsertDropToTarget(p) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    if (p.AppendToTarget) {
        if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name + ': p.Nodes.length = ' + p.Nodes.length);
        for (let i = 0; i < p.Nodes.length; i++) {
            let Node = document.getElementById(p.Nodes[i].id);
            if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name + ': Node = ' + JSON.stringify(Node));
            if (Node != null) {
                if (p.Nodes[i].selected) {
                    DOM_AppendToNode(Node, p.TargetNode);
                    Node.classList.add('selected');
                    if (p.Nodes[i].temporary) Node.classList.add('selected_temporarly');
                } else {
                    if (Node.parentNode.id != p.Nodes[i].parent) DOM_AppendToNode(Node, document.getElementById(p.Nodes[i].parent));
                }
            }
        }
    }
    if (p.BeforeTarget) {
        for (i = 0; i < p.Nodes.length; i++) {
            let Node = document.getElementById(p.Nodes[i].id);
            if (Node != null) {
                if (p.Nodes[i].selected) {
                    DOM_InsterBeforeNode(Node, p.TargetNode);
                    Node.classList.add('selected');
                    if (p.Nodes[i].temporary) Node.classList.add('selected_temporarly');
                } else {
                    if (Node.parentNode.id != p.Nodes[i].parent) DOM_AppendToNode(Node, document.getElementById(p.Nodes[i].parent));
                }
            }
        }
    }
    if (p.AfterTarget) {
        let i = p.after ? (p.Nodes.length - 1) : 0;
        for (i = p.Nodes.length - 1; i >= 0; i--) {
            let Node = document.getElementById(p.Nodes[i].id);
            if (Node != null) {
                if (p.Nodes[i].selected) {
                    DOM_InsertAfterNode(Node, p.TargetNode);
                    Node.classList.add('selected');
                    if (p.Nodes[i].temporary) Node.classList.add('selected_temporarly');
                } else {
                    if (Node.parentNode.id != p.Nodes[i].parent) DOM_AppendToNode(Node, document.getElementById(p.Nodes[i].parent));
                }
            }
        }
    }
}

function DOM_New(type, parent, parameters, style) {
//    if (opt.debug) Utils_log("dom.js: " + arguments.callee.name + ": type =" + type);
    let NewElement = document.createElement(type);
    for (param in parameters) {
        NewElement[param] = parameters[param];
    }
    for (param in style) {
        NewElement.style[param] = style[param];
    }
    if (parent) parent.appendChild(NewElement);
    return NewElement;
}

async function DOM_SetStyle(node, style) {
    for (param in style) {
        node.style[param] = style[param];
    }
}

function DOM_SetClasses(node, add, remove, toggle) {
    // this gets called way too often to include in the logs
    let Ind = 0;
    for (Ind = 0; Ind < add.length; Ind++) {
        node.classList.add(add[Ind]);
    }
    for (Ind = 0; Ind < remove.length; Ind++) {
        node.classList.remove(remove[Ind]);
    }
    for (Ind = 0; Ind < toggle.length; Ind++) {
        node.classList.toggle(toggle[Ind]);
    }
}

function DOM_DropToTarget(p) { // Class: ("group", "tab", "folder"), DraggedTabNode: TabId, TargetNode: query node, TabsIdsSelected: arr of selected tabIds, TabsIds: arr of tabIds, TabsIdsParents: arr of parent tabIds, Folders: object with folders objects, FoldersSelected: arr of selected folders ids, Group: groupId, Scroll: bool
      if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name + ': constructor(p) = ' + JSON.stringify(p));
      if (p.TargetNode != null) {
        let pinTabs = false;
        if (p.NodesTypes.DraggingPin || p.NodesTypes.DraggingTab || p.NodesTypes.DraggingFolder) {
            if (p.TargetNode.classList.contains('pin') || p.TargetNode.classList.contains('tab') || p.TargetNode.classList.contains('folder')) {
                if (p.TargetNode.classList.contains('pin')) pinTabs = true;
                if (p.where == 'inside') DOM_InsertDropToTarget({TargetNode: p.TargetNode.childNodes[1], AppendToTarget: true, Nodes: p.Nodes}); // PINS NEVER HAVE INSIDE, SO WILL BE IGNORED
                if (p.where == 'before') DOM_InsertDropToTarget({TargetNode: p.TargetNode, BeforeTarget: true, Nodes: p.Nodes});
                if (p.where == 'after') DOM_InsertDropToTarget({TargetNode: p.TargetNode, AfterTarget: true, Nodes: p.Nodes});
            }
            if (p.TargetNode.id == 'pin_list') {
                DOM_InsertDropToTarget({TargetNode: p.TargetNode, AppendToTarget: true, Nodes: p.Nodes});
                pinTabs = true;
            }
            if (p.TargetNode.classList.contains('group')) DOM_InsertDropToTarget({TargetNode: p.TargetNode.childNodes[0], AppendToTarget: true, Nodes: p.Nodes});
            if (p.TargetNode.classList.contains('group_button')) {
                let group = document.getElementById('°' + p.TargetNode.id.substr(1));
                DOM_InsertDropToTarget({TargetNode: group, Nodes: p.Nodes, AppendToTarget: true});
            }
            setTimeout(function() {Folders_SaveFolders();}, 600);
        }
        if (p.NodesTypes.DraggingGroup) {
            if (p.where == 'before') DOM_InsterBeforeNode(document.getElementById('_' + p.Group.id), p.TargetNode);
            if (p.where == 'after') DOM_InsertAfterNode(document.getElementById('_' + p.Group.id), p.TargetNode);
            Groups_UpdateBgGroupsOrder();
            Groups_RearrangeGroupsLists();
        }
        for (i = 0; i < p.Nodes.length; i++) {
            if (p.Nodes[i].NodeClass == 'pin' || p.Nodes[i].NodeClass == 'tab') {
                if (tt.tabs[p.Nodes[i].id]) {
                    if (tt.tabs[p.Nodes[i].id].Node.classList.contains('pin') != pinTabs) {
                        tt.tabs[p.Nodes[i].id].SetTabClass(pinTabs);
                        tt.tabs[p.Nodes[i].id].pinned = pinTabs;
                        chrome.tabs.update(parseInt(p.Nodes[i].id), {pinned: pinTabs});
                    }
                }
            }
        }
        if (opt.syncro_tabbar_tabs_order) {
            let tabIds = Array.prototype.map.call(document.querySelectorAll('.pin, .tab'), function(s) {return parseInt(s.id);});
            for (i = 0; i < p.Nodes.length; i++) {
                if (p.Nodes[i].NodeClass == 'pin' || p.Nodes[i].NodeClass == 'tab') chrome.tabs.move(parseInt(p.Nodes[i].id), {index: tabIds.indexOf(parseInt(p.Nodes[i].id))});
            }
            setTimeout(function() {tt.schedule_rearrange_tabs++;}, 500);
        }
    }
    Groups_KeepOnlyOneActiveTabInGroup();
    DOM_RefreshExpandStates();
    DOM_RefreshCounters();
    setTimeout(function() {
        DOM_RemoveHighlight();
    }, 100);
    setTimeout(function() {
        if (opt.syncro_tabbar_groups_tabs_order) tt.schedule_rearrange_tabs++;
        // DOM_RefreshExpandStates();
        // DOM_RefreshCounters();
        tt.schedule_update_data++;
        DOM_RefreshGUI();
        DOM_CleanUpDragAndDrop();
    }, 500);
}

function DOM_PreppendToNode(Node, PreppendToNode) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    if (Node != null && PreppendToNode != null) {
        if (PreppendToNode.childNodes.length > 0) {
           PreppendToNode.parentNode.insertBefore(Node, PreppendToNode.childNodes[0]);
        } else {
            PreppendToNode.appendChild(Node);
        }
    }
}

function DOM_AppendToNode(Node, AppendToNode) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    if (Node != null && AppendToNode != null) AppendToNode.appendChild(Node);
}

function DOM_InsterBeforeNode(Node, BeforeNode) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    if (Node != null && BeforeNode != null) BeforeNode.parentNode.insertBefore(Node, BeforeNode);
}

function DOM_InsertAfterNode(Node, AfterNode) {
    if (Node != null && AfterNode != null) {
        if (AfterNode.nextSibling != null) {
            AfterNode.parentNode.insertBefore(Node, AfterNode.nextSibling);
        } else {
            AfterNode.parentNode.appendChild(Node);
        }
    }
}

function DOM_PromoteChildrenToFirstChild(Node) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let NewParent = Node.childNodes[1].firstChild.childNodes[1];
    Node.childNodes[1].parentNode.parentNode.insertBefore(Node.childNodes[1].firstChild, Node.childNodes[1].parentNode);
    while (Node.childNodes[1].firstChild) {
        NewParent.appendChild(Node.childNodes[1].firstChild);
    }
}

function DOM_GetAllParents(Node) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let Parents = [];
    let ParentNode = Node.parentNode;
    while (ParentNode.parentNode != null) {
        Parents.push(ParentNode.parentNode);
        ParentNode = ParentNode.parentNode;
    }
    return Parents;
}

function DOM_GetParentsByClass(Node, Class) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let Parents = [];
    let ParentNode = Node;
    if (ParentNode == null) return Parents;
    while (ParentNode.parentNode != null) {
        if (ParentNode.parentNode.classList != undefined && ParentNode.parentNode.classList.contains(Class)) Parents.push(ParentNode.parentNode);
        ParentNode = ParentNode.parentNode;
    }
    return Parents;
}

function DOM_GetParentsBy2Classes(Node, ClassA, ClassB) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let Parents = [];
    let ParentNode = Node;
    while (ParentNode.parentNode != null) {
        if (ParentNode.parentNode.classList != undefined && ParentNode.parentNode.classList.contains(ClassA) && ParentNode.parentNode.classList.contains(ClassB)) Parents.push(ParentNode.parentNode);
        ParentNode = ParentNode.parentNode;
    }
    return Parents;
}

function DOM_HideRenameDialogs() {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let query = document.querySelectorAll('.edit_dialog');
    for (let s of query) {
        DOM_SetStyle(s, {display: 'none', top: '-500px', left: '-500px'});
    }
}

function DOM_EventExpandBox(Node) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    if (Node.classList.contains('o')) {
        Node.classList.remove('o'); Node.classList.add('c');
        if (Node.classList.contains('tab')) chrome.runtime.sendMessage({command: 'update_tab', tabId: parseInt(Node.id), tab: {expand: 'c'}});
        if (Node.classList.contains('folder')) Folders_SaveFolders();
    } else {
        if (Node.classList.contains('c')) {
            if (opt.collapse_other_trees) {
                let thisTreeTabs2 = DOM_GetParentsByClass(Node.childNodes[0], 'tab'); // start from tab's first child, instead of tab, important to include clicked tab as well
                let thisTreeFolders = DOM_GetParentsByClass(Node.childNodes[0], 'folder');
                let query = document.querySelectorAll('#' + tt.active_group + ' .o.tab');
                for (let s of query) {
                    DOM_SetClasses(s, ['c'], ['o'], []);
                    chrome.runtime.sendMessage({command: 'update_tab', tabId: parseInt(s.id), tab: {expand: 'c'}});
                }
                query = document.querySelectorAll('#' + tt.active_group + ' .o.folder');
                for (let s of query) {
                    DOM_SetClasses(s, ['c'], ['o'], []);
                }
                for (let s of thisTreeTabs2) {
                    DOM_SetClasses(s, ['o'], ['c'], []);
                    chrome.runtime.sendMessage({command: 'update_tab', tabId: parseInt(s.id), tab: {expand: 'o'}});
                }
                for (let s of thisTreeFolders) {
                    DOM_SetClasses(s, ['o'], ['c'], []);
                }
                Folders_SaveFolders();
                if (Node.classList.contains('tab') && tt.tabs[Node.id]) tt.tabs[Node.id].ScrollToTab();
            } else {
                DOM_SetClasses(Node, ['o'], ['c'], []);
                if (Node.classList.contains('tab')) chrome.runtime.sendMessage({command: 'update_tab', tabId: parseInt(Node.id), tab: {expand: 'o'}});
                if (Node.classList.contains('folder')) Folders_SaveFolders();
            }
        }
    }
}

function DOM_Select(event, TabNode) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    if (event.shiftKey) { // SET SELECTION WITH SHIFT
        let LastSelected = document.querySelector('#' + tt.active_group + ' .selected.selected_last');
        if (LastSelected == null) LastSelected = document.querySelector('.pin.active_tab, #' + tt.active_group + ' .tab.active_tab');
        if (LastSelected != null && TabNode.parentNode.id == LastSelected.parentNode.id) {
            if (!event.ctrlKey) {
                let query = document.querySelectorAll('.pin.selected, #' + tt.active_group + ' .selected');
                for (let s of query) {
                    DOM_SetClasses(s, [], ['selected_frozen', 'selected_temporarly', 'selected', 'selected_last'], []);
                }
            }
            let ChildrenArray = Array.from(TabNode.parentNode.children);
            let activeTabIndex = ChildrenArray.indexOf(LastSelected);
            let thisTabIndex = ChildrenArray.indexOf(TabNode);
            let fromIndex = thisTabIndex >= activeTabIndex ? activeTabIndex : thisTabIndex;
            let toIndex = thisTabIndex >= activeTabIndex ? thisTabIndex : activeTabIndex;
            for (let i = fromIndex; i <= toIndex; i++) {
                LastSelected.parentNode.childNodes[i].classList.add('selected');
                if (i == toIndex && event.ctrlKey) LastSelected.parentNode.childNodes[i].classList.add('selected_last');
            }
        }
    }
    if (event.ctrlKey && !event.shiftKey) { // TOGGLE SELECTION WITH CTRL
        TabNode.classList.toggle('selected');
        if (TabNode.classList.contains('selected')) {
            let query = document.querySelectorAll('.selected_last');
            for (let s of query) {
                s.classList.remove('selected_last');
            }
            TabNode.classList.add('selected_last');
        } else {
            TabNode.classList.remove('selected_last');
        }
    }
}

function DOM_Deselect() {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let query = document.querySelectorAll('#pin_list .selected');
    for (let s of query) {
        s.classList.remove('selected');
    }
    query = document.querySelectorAll('#' + tt.active_group + ' .selected');
    for (let s of query) {
        s.classList.remove('selected');
    }
}

function DOM_FreezeSelection(all) {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    if (all) {
        let query = document.querySelectorAll('.selected');
        for (let s of query) {
            DOM_SetClasses(s, ['selected_frozen'], ['selected', 'selected_last'], []);
        }
    } else {
        let query = document.querySelectorAll('.group:not(#' + tt.active_group + ') .selected');
        for (let s of query) {
            DOM_SetClasses(s, ['selected_frozen'], ['selected', 'selected_last'], []);
        }
    }
}

function DOM_CleanUpDragAndDrop() {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name + ': unfreezing and removing temporary classes...');
    let query = document.querySelectorAll('.selected_frozen');
    for (let s of query) {
        DOM_SetClasses(s, ['selected'], ['selected_frozen'], []);
    }
    query = document.querySelectorAll('.selected_temporarly');
    for (let s of query) {
        DOM_SetClasses(s, [], ['selected', 'selected_frozen'], []);
    }
    query = document.querySelectorAll('.tab_header_hover');
    for (let s of query) {
        s.classList.remove('tab_header_hover');
    }
    query = document.querySelectorAll('.folder_header_hover');
    for (let s of query) {
        s.classList.remove('folder_header_hover');
    }
    query = document.querySelectorAll('.dragged_tree');
    for (let s of query) {
        s.classList.remove('dragged_tree');
    }
    query = document.querySelectorAll('.dragged_parents');
    for (let s of query) {
        s.classList.remove('dragged_parents');
    }
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name + ': removing DraggingParams...');
    tt.DragTreeDepth = 0;
    tt.DraggingGroup = false;
    tt.DraggingTab = false;
    tt.DraggingFolder = false;
    tt.DraggingPin = false;
    tt.DragOverId = '';
}

function DOM_RemoveHighlight() {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let query = document.querySelectorAll('.highlighted_drop_target');
    for (let s of query) {
        DOM_SetClasses(s, [], ['before', 'after', 'inside', 'highlighted_drop_target'], []);
    }
}

function DOM_RemoveHeadersHoverClass() {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let query = document.querySelectorAll('.folder_header_hover, .tab_header_hover');
    for (let s of query) {
        DOM_SetClasses(s, [], ['folder_header_hover', 'tab_header_hover'], []);
    }
}

function DOM_Loadi18n() {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let query = document.querySelectorAll('.button, .manager_window_toolbar_button');
    for (let s of query) {
        s.title = chrome.i18n.getMessage(s.id);
    }
    query = document.querySelectorAll('.menu_item, .edit_dialog_button, #manager_window_header_title, .manager_window_label');
    for (let s of query) {
        s.textContent = chrome.i18n.getMessage(s.id);
    }
}

async function DOM_RefreshExpandStates() {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name + ': refresh open closed trees states');
    let query = document.querySelectorAll('#' + tt.active_group + ' .folder, #' + tt.active_group + ' .tab');
    for (let s of query) {
        if (s.childNodes[1].children.length == 0) {
            s.classList.remove('o'); s.classList.remove('c');
        } else {
            if (s.classList.contains('o') == false && s.classList.contains('c') == false) s.classList.add('o');
        }
    }
    query = document.querySelectorAll('.pin');
    for (let s of query) {
        s.classList.remove('o'); s.classList.remove('c');
    }
}

async function DOM_RefreshCounters() {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    if (opt.show_counter_tabs || opt.show_counter_tabs_hints) {
        let query = document.querySelectorAll('#' + tt.active_group + ' .o.tab, #' + tt.active_group + ' .c.tab');
        for (let s of query) {
            if (opt.show_counter_tabs) s.childNodes[0].childNodes[1].childNodes[0].textContent = document.querySelectorAll("[id='" + s.id + "'] .tab").length;
            if (opt.show_counter_tabs_hints) {
                let title = s.childNodes[0].getAttribute('tabTitle');
                s.childNodes[0].title = (document.querySelectorAll("[id='" + s.id + "'] .tab").length + ' • ') + title;
            }
        }
        query = document.querySelectorAll('#' + tt.active_group + ' .folder');
        for (let s of query) {
            if (opt.show_counter_tabs && tt.folders[s.id]) s.childNodes[0].childNodes[1].childNodes[0].textContent = document.querySelectorAll("[id='" + s.id + "'] .tab").length;
            if (opt.show_counter_tabs_hints && tt.folders[s.id]) s.childNodes[0].title = (document.querySelectorAll("[id='" + s.id + "'] .tab").length + ' • ') + tt.folders[s.id].name;
        }
    }
}

async function DOM_RefreshGUI() {
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    let toolbar = document.getElementById('toolbar');
    let toolbarHeight = 27;
    if (toolbar.children.length > 0) {
        DOM_SetStyle(toolbar, {height: '', width: '', display: '', border: '', padding: ''});
        if (document.querySelector('.on.button') != null) {
            toolbar.style.height = '53px';
            toolbarHeight = 54;
        } else {
            toolbar.style.height = '26px';
        }
    } else {
        DOM_SetStyle(toolbar, {height: '0px', width: '0px', display: 'none', border: 'none', padding: '0'});
        toolbar.style.height = '0px';
        toolbarHeight = 0;
    }
    let group_list = document.getElementById('group_list');
    group_list.style.width = document.body.clientWidth + 50 + 'px';
    let pin_list = document.getElementById('pin_list');
    if (pin_list.children.length > 0) {
        DOM_SetStyle(pin_list, {top: toolbarHeight + 'px', height: '', width: '', display: '', border: '', padding: ''});
    } else {
        DOM_SetStyle(pin_list, {top: '0px', height: '0px', width: '0px', display: 'none', border: 'none', padding: '0'});
    }
    let pin_listHeight = pin_list.getBoundingClientRect().height;
    let toolbar_groups = document.getElementById('toolbar_groups');
    DOM_SetStyle(toolbar_groups, {top: toolbarHeight + pin_listHeight + 'px', height: document.body.clientHeight - toolbarHeight - pin_listHeight + 'px'});
    let toolbar_groupsWidth = toolbar_groups.getBoundingClientRect().width;
    if (opt.show_counter_groups) {
        let query = document.querySelectorAll('.group');
        for (let s of query) {
            let groupLabel = document.getElementById('_gte' + s.id);
            if (groupLabel) groupLabel.textContent = (tt.groups[s.id] ? tt.groups[s.id].name : labels.noname_group) + ' (' + document.querySelectorAll('#' + s.id + ' .tab').length + ')';
        }
    } else {
        let query = document.querySelectorAll('.group');
        for (let s of query) {
            let groupLabel = document.getElementById('_gte' + s.id);
            if (groupLabel) groupLabel.textContent = tt.groups[s.id] ? tt.groups[s.id].name : labels.noname_group;
        }
    }
    let query = document.querySelectorAll('.group_button');
    for (let s of query) {
        s.style.height = s.firstChild.getBoundingClientRect().height + 'px';
    }
    let groups = document.getElementById('groups');
    let groupsHeight = document.body.clientHeight - toolbarHeight - pin_listHeight;
    let groupsWidth = document.body.clientWidth - toolbar_groupsWidth - 1;
    DOM_SetStyle(groups, {top: toolbarHeight + pin_listHeight + 'px', left: toolbar_groupsWidth + 'px', height: groupsHeight + 'px', width: groupsWidth + 'px'});
    let PanelList = document.querySelector('.mw_pan_on>.manager_window_list');
    let PanelListHeight = 3 + PanelList.children.length * 18;
    let ManagerWindowPanelButtons = document.querySelector('.mw_pan_on>.manager_window_panel_buttons');
    let ManagerWindowPanelButtonsHeight = ManagerWindowPanelButtons.clientHeight;
    let MaxAllowedHeight = document.body.clientHeight - 140;
    if (PanelListHeight + ManagerWindowPanelButtonsHeight < MaxAllowedHeight) {
        PanelList.style.height = PanelListHeight + 'px';
    } else {
        PanelList.style.height = MaxAllowedHeight - ManagerWindowPanelButtonsHeight + 'px';
    }
    let ManagerWindow = document.getElementById('manager_window');
    ManagerWindow.style.height = PanelList.clientHeight + ManagerWindowPanelButtonsHeight + 56 + 'px';
}

function DOM_AutoRefreshMediaIcons() { // if changeInfo.audible listener does not work, this is my own implementation, hopefully this will not affect performance too much
    if (opt.debug) Utils_log('dom.js: ' + arguments.callee.name);
    setInterval(function() {
        chrome.tabs.query({currentWindow: true, audible: true, discarded: false}, function(tabs) {
            let query = document.querySelectorAll('.audible, .muted');
            for (let s of query) {
                s.classList.remove('audible'); s.classList.remove('muted');
            }
            for (let tab of tabs) {
                if (tab.audible) document.getElementById(tab.id).classList.add('audible');
                if (tab.mutedInfo.muted) document.getElementById(tab.id).classList.add('muted');
            }
        });
    }, 2000);
}
