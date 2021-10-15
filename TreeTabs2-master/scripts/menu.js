class Menu_ttMenu {
    constructor(MenuItem) {
        let SeparatorDIV = DOM_New('div', tt.DOMmenu, {id: MenuItem[0], className: 'separator'});
        let MenuLI = DOM_New('li', tt.DOMmenu, {id: MenuItem[1], className: 'menu_item'});
        this.id = MenuLI.id;
        this.Menu = MenuLI;
        this.Separator = SeparatorDIV;

        if (this.id == 'menu_new_pin') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('pin')) {
                console.log(tt.menuItemNode);
                Tabs_OpenNewTab(true, tt.menuItemNode.id, undefined, undefined);
            } else {
                Tabs_OpenNewTab(true, undefined, undefined, (opt.append_orphan_tab === 'top' ? false : true));
            }
        }};}
        if (this.id == 'menu_new_tab') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('folder')) {
                Tabs_OpenNewTab(false, undefined, tt.menuItemNode.id, (opt.append_orphan_tab === 'top' ? false : true));
            } else {
                if (tt.menuItemNode.classList.contains('pin')) {
                    Tabs_OpenNewTab(true, tt.menuItemNode.id, undefined, undefined);
                } else {
                    if (tt.menuItemNode.classList.contains('tab')) {
                        Tabs_OpenNewTab(false, tt.menuItemNode.id, undefined, undefined);
                    } else {
                        Tabs_OpenNewTab(false, undefined, tt.active_group, (opt.append_orphan_tab === 'top' ? false : true));
                    }
                }
            }
        }};}
        if (this.id == 'menu_unpin_tab' || this.id == 'menu_pin_tab') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('selected')) {
                let query = document.querySelectorAll(".pin.selected, [id='" + tt.active_group + "'] .selected");
                for (let s of query) {
                    chrome.tabs.update(parseInt(s.id), {pinned: (tt.menuItemNode.classList.contains('tab'))});
                }
            } else {
                chrome.tabs.update(parseInt(tt.menuItemNode.id), {pinned: (tt.menuItemNode.classList.contains('tab'))});
            }
        }};}
        if (this.id == 'menu_duplicate_tab') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('selected')) {
                let query = document.querySelectorAll(".pin.selected, [id='" + tt.active_group + "'] .selected");
                for (let s of query) {
                    tt.tabs[s.id].DuplicateTab();
                }
            } else {
                tt.tabs[tt.menuItemNode.id].DuplicateTab();
            }
        }};}
        if (this.id == 'menu_detach_tab') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            DOM_FreezeSelection(false);
            let Nodes = [];
            let NodesTypes = {DraggingPin: false, DraggingTab: false, DraggingFolder: false};
            let query = [];
            if (tt.menuItemNode.classList.contains('selected')) {
                query = document.querySelectorAll('.selected, .selected .tab, .selected .folder');
            } else {
                query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .tab, [id='" + tt.menuItemNode.id + "'] .folder");
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
        }};}
        if (this.id == 'menu_reload_tab') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('selected')) {
                let query = document.querySelectorAll(".pin.selected, [id='" + tt.active_group + "'] .selected");
                for (let s of query) {
                    chrome.tabs.reload(parseInt(s.id));
                }
            } else {
                chrome.tabs.reload(parseInt(tt.menuItemNode.id));
            }
        }};}
        if (this.id == 'menu_unload') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('pin') || tt.menuItemNode.classList.contains('tab')) {
                if (tt.menuItemNode.classList.contains('selected')) {
                    let tabsArr = [];
                    let query = document.querySelectorAll(".pin.selected, [id='" + tt.active_group + "'] .selected");
                    for (let s of query) {
                        tabsArr.push(parseInt(s.id));
                        let children = document.querySelectorAll("[id='" + s.id + "'] .tab");
                        if (children.length > 0) {
                            for (let t of children) {
                                tabsArr.push(parseInt(t.id));
                            }
                        }
                    }
                    Tabs_DiscardTabs(tabsArr);
                } else {
                    Tabs_DiscardTabs([parseInt(tt.menuItemNode.id)]);
                }
            }
            if (tt.menuItemNode.classList.contains('folder')) {
                let tabsArr = [];
                let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab");
                for (let s of query) {
                    tabsArr.push(parseInt(s.id));
                }
                Tabs_DiscardTabs(tabsArr);
            }
        }};}
        if (this.id == 'menu_unload_tree') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('pin') || tt.menuItemNode.classList.contains('tab')) {
                if (tt.menuItemNode.classList.contains('selected')) {
                    let tabsArr = [];
                    let query = document.querySelectorAll(".pin.selected, [id='" + tt.active_group + "'] .selected");
                    for (let s of query) {
                        tabsArr.push(parseInt(s.id));
                        let children = document.querySelectorAll("[id='" + s.id + "'] .tab");
                        if (children.length > 0) {
                            for (let t of children) {
                                tabsArr.push(parseInt(t.id));
                            }
                        }
                    }
                    Tabs_DiscardTabs(tabsArr);
                } else {
                    let tabsArr = [];
                    tabsArr.push(parseInt(tt.menuItemNode.id));
                    let children = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab");
                    if (children.length > 0) {
                        for (let t of children) {
                            tabsArr.push(parseInt(t.id));
                        }
                    }
                    Tabs_DiscardTabs(tabsArr);
                }
            }
            if (tt.menuItemNode.classList.contains('folder')) {
                let tabsArr = [];
                let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab");
                for (let s of query) {
                    tabsArr.push(parseInt(s.id));
                }
                Tabs_DiscardTabs(tabsArr);
            }
        }};}
        if (this.id == 'menu_close') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('selected')) {
                let tabsArr = [];
                let query = document.querySelectorAll(".pin.selected, [id='" + tt.active_group + "'] .selected");
                for (let s of query) {
                    tabsArr.push(parseInt(s.id));
                }
                Tabs_CloseTabs(tabsArr);
            } else {
                Tabs_CloseTabs([parseInt(tt.menuItemNode.id)]);
            }
        }};}
        if (this.id == 'menu_mute_tab') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('pin') || tt.menuItemNode.classList.contains('tab')) {
                if (tt.menuItemNode.classList.contains('selected')) {
                    let query = document.querySelectorAll(".pin.selected, [id='" + tt.active_group + "'] .selected");
                    for (let s of query) {
                        chrome.tabs.update(parseInt(s.id), {muted: true});
                    }
                } else {
                    chrome.tabs.update(parseInt(tt.menuItemNode.id), {muted: true});
                }
            }
            if (tt.menuItemNode.classList.contains('folder')) {
                let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab");
                for (let s of query) {
                    chrome.tabs.update(parseInt(s.id), {muted: true});
                }
            }
        }};}
        if (this.id == 'menu_mute_tree') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .tab");
            for (let s of query) {
                chrome.tabs.update(parseInt(s.id), {muted: true});
            }
        }};}
        if (this.id == 'menu_unmute_tab') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('pin') || tt.menuItemNode.classList.contains('tab')) {
                if (tt.menuItemNode.classList.contains('selected')) {
                    let query = document.querySelectorAll(".pin.selected, [id='" + tt.active_group + "'] .selected");
                    for (let s of query) {
                        chrome.tabs.update(parseInt(s.id), {muted: false});
                    }
                } else {
                    chrome.tabs.update(parseInt(tt.menuItemNode.id), {muted: false});
                }
            }
            if (tt.menuItemNode.classList.contains('folder')) {
                let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab");
                for (let s of query) {
                    chrome.tabs.update(parseInt(s.id), {muted: false});
                }
            }
        }};}
        if (this.id == 'menu_unmute_tree') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .tab");
            for (let s of query) {
                chrome.tabs.update(parseInt(s.id), {muted: false});
            }
        }};}
        if (this.id == 'menu_mute_other') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('selected')) {
                let query = document.querySelectorAll(".pin:not(.selected), [id='" + tt.active_group + "'] .tab:not(.selected)");
                for (let s of query) {
                    chrome.tabs.update(parseInt(s.id), {muted: true});
                }
            } else {
                let query = document.querySelectorAll(".pin:not([id='" + tt.menuItemNode.id + "']), [id='" + tt.active_group + "'] .tab:not([id='" + tt.menuItemNode.id + "'])");
                for (let s of query) {
                    chrome.tabs.update(parseInt(s.id), {muted: true});
                }
            }
        }};}
        if (this.id == 'menu_unmute_other') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('selected')) {
                let query = document.querySelectorAll(".pin:not(.selected), [id='" + tt.active_group + "'] .tab:not(.selected)");
                for (let s of query) {
                    chrome.tabs.update(parseInt(s.id), {muted: false});
                }
            } else {
                let query = document.querySelectorAll(".pin:not([id='" + tt.menuItemNode.id + "']), [id='" + tt.active_group + "'] .tab:not([id='" + tt.menuItemNode.id + "'])");
                for (let s of query) {
                    chrome.tabs.update(parseInt(s.id), {muted: false});
                }
            }
        }};}
        if (this.id == 'menu_undo_close_tab') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            chrome.sessions.getRecentlyClosed(null, function(sessions) {
                if (sessions.length > 0) {
                    chrome.sessions.restore(null, function() {});
                }
            });
        }};}
        if (this.id == 'menu_new_folder') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('tab')) {
                let FolderId = Folders_AddNewFolder({ParentId: tt.menuItemNode.parentNode.parentNode.id, InsertAfterId: tt.menuItemNode.id});
                Folders_ShowRenameFolderDialog(FolderId);
            } else {
                if (tt.menuItemNode.classList.contains('folder')) {
                    let FolderId = Folders_AddNewFolder({ParentId: tt.menuItemNode.id});
                    Folders_ShowRenameFolderDialog(FolderId);
                } else {
                    let FolderId = Folders_AddNewFolder({});
                    Folders_ShowRenameFolderDialog(FolderId);
                }
            }
        }};}
        if (this.id == 'menu_expand_tree') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .folder.c, [id='" + tt.menuItemNode.id + "'] .tab.c");
            for (let s of query) {
                DOM_SetClasses(s, ['o'], ['c'], []);
            }
            tt.schedule_update_data++;
            Folders_SaveFolders();
        }};}
        if (this.id == 'menu_collapse_tree') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .folder.c, [id='" + tt.menuItemNode.id + "'] .tab.c");
            for (let s of query) {
                DOM_SetClasses(s, ['c'], ['o'], []);
            }
            tt.schedule_update_data++;
            Folders_SaveFolders();
        }};}
        if (this.id == 'menu_expand_all') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let query = document.querySelectorAll("[id='" + tt.active_group + "'] .folder.c, [id='" + tt.active_group + "'] .tab.c");
            for (let s of query) {
                DOM_SetClasses(s, ['o'], ['c'], []);
            }
            tt.schedule_update_data++;
            Folders_SaveFolders();
        }};}
        if (this.id == 'menu_collapse_all') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let query = document.querySelectorAll("[id='" + tt.active_group + "'] .folder.o, [id='" + tt.active_group + "'] .tab.o");
            for (let s of query) {
                DOM_SetClasses(s, ['c'], ['o'], []);
            }
            tt.schedule_update_data++;
            Folders_SaveFolders();
        }};}
        if (this.id == 'menu_close_tree') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let tabsArr = [];
            let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab, [id='" + tt.menuItemNode.id + "']");
            for (let s of query) {
                tabsArr.push(parseInt(s.id));
            }
            Tabs_CloseTabs(tabsArr);
        }};}
        if (this.id == 'menu_close_children') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let tabsArr = [];
            let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab");
            for (let s of query) {
                tabsArr.push(parseInt(s.id));
            }
            Tabs_CloseTabs(tabsArr);
        }};}
        if (this.id == 'menu_rename_folder') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            Folders_ShowRenameFolderDialog(tt.menuItemNode.id);
        }};}
        if (this.id == 'menu_delete_folder') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            if (tt.menuItemNode.classList.contains('selected')) {
                let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "']  .selected, [id='" + tt.menuItemNode.id + "']");
                for (let s of query) {
                    Folders_RemoveFolder(s.id);
                }
            } else {
                Folders_RemoveFolder(tt.menuItemNode.id);
            }
        }};}
        if (this.id == 'menu_close_other') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let tabsArr = [];
            let query = [];
            if (tt.menuItemNode.classList.contains('selected')) {
                if (tt.menuItemNode.classList.contains('pin')) query = document.querySelectorAll('.pin:not(.selected)');
                if (tt.menuItemNode.classList.contains('tab')) query = document.querySelectorAll("[id='" + tt.active_group + "'] .tab:not(.selected)");
                for (let s of query) {
                    let children = document.querySelectorAll("[id='" + s.id + "'] .selected");
                    if (children.length == 0 || opt.promote_children) tabsArr.push(parseInt(s.id));
                }
                Tabs_CloseTabs(tabsArr);
            } else {
                if (tt.menuItemNode.classList.contains('pin')) query = document.querySelectorAll(".pin:not([id='" + tt.menuItemNode.id + "'])");
                if (tt.menuItemNode.classList.contains('tab')) {
                    query = document.querySelectorAll("[id='°" + tt.active_group + "'] .tab:not([id='" + tt.menuItemNode.id + "'])");
                    document.getElementById('°' + tt.active_group).appendChild(tt.menuItemNode);
                }
                for (let s of query) {
                    tabsArr.push(parseInt(s.id));
                }
                Tabs_CloseTabs(tabsArr);
            }
        }};}
        if (this.id == 'menu_bookmark_tree') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            Bookmark(tt.menuItemNode);
        }};}
        if (this.id == 'menu_rename_group') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            Groups_ShowGroupEditWindow(tt.menuItemNode.id);
        }};}
        if (this.id == 'menu_delete_group') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            Groups_GroupRemove(tt.menuItemNode.id, false);
        }};}
        if (this.id == 'menu_delete_group_tabs_close') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            Groups_GroupRemove(tt.menuItemNode.id, true);
        }};}
        if (this.id == 'menu_groups_unload') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let tabsArr = [];
            let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab");
            for (let s of query) {
                tabsArr.push(parseInt(s.id));
            }
            Tabs_DiscardTabs(tabsArr);
        }};}
        if (this.id == 'menu_group_tabs_close') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let tabsArr = [];
            let query = document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab");
            for (let s of query) {
                tabsArr.push(parseInt(s.id));
            }
            Tabs_CloseTabs(tabsArr);
        }};}
        if (this.id == 'menu_manager_window') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            Manager_OpenManagerWindow();
        }};}
        if (this.id == 'menu_groups_hibernate') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            Manager_ExportGroup(tt.menuItemNode.id, false, true);
            setTimeout(function() {Groups_GroupRemove(tt.menuItemNode.id, true);}, 100);
        }};}
        if (this.id == 'menu_bookmark_group') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            Bookmark(tt.menuItemNode);
        }};}
        if (this.id == 'menu_new_group') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            let NewGroupId = Groups_AddNewGroup();
            Groups_ShowGroupEditWindow(NewGroupId);
        }};}
        if (this.id == 'menu_TreeTabs2_settings') { this.Menu.onmousedown = function(event) { if (event.which == 1) {
            chrome.tabs.create({'url': 'options/options.html'});
        }};}
    }
    MenuHide() {
        this.Menu.style.display = 'none';
    }
    MenuShow() {
        this.Menu.style.display = '';
    }
    SeparatorHide() {
        this.Separator.style.display = 'none';
    }
    SeparatorShow() {
        this.Separator.style.display = '';
    }
};

function Menu_HideMenus() {
    for (let MenuItem of DefaultMenu.all_entries) {
        tt.menu[MenuItem[1]].MenuHide();
        tt.menu[MenuItem[1]].SeparatorHide();
    }
    DOM_SetStyle(tt.menu[DefaultMenu.all_entries[0][1]].Menu.parentNode, {display: 'none', top: '-1000px', left: '-1000px'});
}

function Menu_ShowMenu(MenuItems, event) {
    for (i = 0; i < DefaultMenu.all_entries.length; i++) {
        if (MenuItems[i][1]) {
            tt.menu[DefaultMenu.all_entries[i][1]].MenuShow();
        } else {
            tt.menu[DefaultMenu.all_entries[i][1]].MenuHide();
        }
        if (MenuItems[i][0]) {
            tt.menu[DefaultMenu.all_entries[i][1]].SeparatorShow();
        } else {
            tt.menu[DefaultMenu.all_entries[i][1]].SeparatorHide();
        }
    }
    setTimeout(function() {
        tt.DOMmenu.style.display = 'block';
        let x = event.pageX >= (document.body.clientWidth - tt.DOMmenu.getBoundingClientRect().width - 5) ? (document.body.clientWidth - tt.DOMmenu.getBoundingClientRect().width - 5) : (event.pageX - 5);
        let y = event.pageY >= (document.body.clientHeight - tt.DOMmenu.getBoundingClientRect().height - 20) ? (document.body.clientHeight - tt.DOMmenu.getBoundingClientRect().height - 20) : (event.pageY - 20);
        DOM_SetStyle(tt.DOMmenu, {top: y + 'px', left: x + 'px'});
    }, 10);
}

function Menu_ShowTabMenu(TabNode, event) {
    tt.menuItemNode = TabNode;
    if (TabNode.classList.contains('pin')) {
        Menu_ShowMenu(DefaultMenu.pin, event);
        if (opt.allow_pin_close) tt.menu['menu_close'].MenuShow();
    }
    if (TabNode.classList.contains('tab')) {
        Menu_ShowMenu(DefaultMenu.tab, event);
        if (TabNode.classList.contains('o')) {
            tt.menu['menu_collapse_tree'].SeparatorShow();
            tt.menu['menu_collapse_tree'].MenuShow();
        }
        if (TabNode.classList.contains('c')) {
            tt.menu['menu_expand_tree'].SeparatorShow();
            tt.menu['menu_expand_tree'].MenuShow();
        }
        if (TabNode.classList.contains('c') || TabNode.classList.contains('o')) {
            tt.menu['menu_close_tree'].MenuShow();
            tt.menu['menu_close_children'].MenuShow();
            tt.menu['menu_mute_tree'].SeparatorShow();
            tt.menu['menu_mute_tree'].MenuShow();
            tt.menu['menu_unmute_tree'].MenuShow();
            tt.menu['menu_unload_tree'].MenuShow();
        }
    }
    if (TabNode.classList.contains('muted')) {
        tt.menu['menu_unmute_tab'].MenuShow();
    } else {
        tt.menu['menu_mute_tab'].MenuShow();
    }
    if (!TabNode.classList.contains('discarded')) tt.menu['menu_unload'].MenuShow();
}

function Menu_ShowFolderMenu(FolderNode, event) {
    tt.menuItemNode = FolderNode;
    Menu_ShowMenu(DefaultMenu.folder, event);
    if (FolderNode.classList.contains('o')) tt.menu['menu_collapse_tree'].MenuShow();
    if (FolderNode.classList.contains('c')) tt.menu['menu_expand_tree'].MenuShow();
    if (document.querySelectorAll("[id='" + FolderNode.id + "'] .tab").length == 0) {
        tt.menu['menu_detach_tab'].SeparatorShow();
        tt.menu['menu_detach_tab'].MenuShow();
    }
}

function Menu_ShowFGlobalMenu(event) {
    tt.menuItemNode = event.target;
    Menu_ShowMenu(DefaultMenu.global, event);
}

function Menu_ShowFGroupMenu(GroupNode, event) {
    tt.menuItemNode = GroupNode;
    Menu_ShowMenu(DefaultMenu.group, event);
    if (tt.menuItemNode.id == 'tab_list') {
        tt.menu['menu_groups_hibernate'].MenuHide();
        tt.menu['menu_rename_group'].MenuHide();
        tt.menu['menu_delete_group'].MenuHide();
        tt.menu['menu_delete_group_tabs_close'].MenuHide();
    }
}

function Menu_CreateMenu() {
    tt.DOMmenu = document.getElementById('main_menu');
     tt.DOMmenu.onmousedown = function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
     };
    tt.DOMmenu.onclick = function(event) {
        Menu_HideMenus();
    };
    for (let MenuItem of DefaultMenu.all_entries) {
        tt.menu[MenuItem[1]] = new Menu_ttMenu(MenuItem);
    }
}
