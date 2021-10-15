class Tabs_ttTab {
    constructor(p) {
        // (p) has too much data to include in the normal logs, so it is set to the 2nd level debug (debug2)
        if (opt.debug2) Utils_log('tabs.js: class Tabs_ttTab: constructor(p)' + JSON.stringify(p));
        this.id = p.tab.id;
        this.pinned = p.tab.pinned;
        if (document.getElementById(p.tab.id) != null && tt.tabs[p.tab.id]) {
            tt.tabs[p.tab.id].GetFaviconAndTitle(p.addCounter);
            return;
        }
        let ClassList = p.tab.pinned ? 'pin' : 'tab';
        if (p.tab.discarded) ClassList += ' discarded';
        if (p.tab.attention) ClassList += ' attention';
        if (p.AdditionalClass) ClassList += ' ' + p.AdditionalClass;
        if (p.ExpandState) ClassList += ' ' + p.ExpandState;
        let DIV_Tab = DOM_New('div', undefined, {id: p.tab.id, className: ClassList});
        let DIV_header = DOM_New('div', DIV_Tab, {id: ('tab_header_' + p.tab.id), className: (opt.always_show_close && !opt.never_show_close) ? 'tab_header close_show' : 'tab_header', draggable: (!p.SkipSetEvents ? true : false)});
        let DIV_expand = DOM_New('div', DIV_header, {id: ('exp_' + p.tab.id), className: 'expand'});
        let DIV_counter = DOM_New('div', DIV_header, {id: ('tab_counter_' + p.tab.id), className: 'tab_counter'});
        DOM_New('div', DIV_counter, {id: ('counter_number_' + p.tab.id), className: 'counter_number'});
        let DIV_title = DOM_New('div', DIV_header, {id: ('tab_title_' + p.tab.id), className: 'tab_title'});
        let DIV_close_button = DOM_New('div', DIV_header, {id: ('close_' + p.tab.id), className: (opt.never_show_close ? 'close hidden' : 'close')});
        DOM_New('div', DIV_close_button, {id: ('close_img_' + p.tab.id), className: (opt.never_show_close ? 'close_img hidden' : 'close_img')});
        let DIV_audio_indicator = DOM_New('div', DIV_header, {id: ('tab_mediaicon_' + p.tab.id), className: 'tab_mediaicon'});
        let DIV_children = DOM_New('div', DIV_Tab, {id: ('°' + p.tab.id), className: 'children'});
        DOM_New('div', DIV_Tab, {id: ('drag_indicator_' + p.tab.id), className: 'drag_indicator'});
        if (!p.SkipSetEvents) {
            DIV_children.onclick = function(event) {
                if (event.target == this && event.which == 1) DOM_Deselect();
            };
            DIV_children.onmousedown = function(event) {
                if (event.target == this) {
                   if (event.which == 2 && event.target == this && opt.midclick_tab !== 'close_tab') {
                        event.stopImmediatePropagation();
                        Tabs_ActionClickTab(this.parentNode, opt.midclick_tab);
                    }
                    if (event.which == 3) Menu_ShowFGlobalMenu(event);
                }
            };
            DIV_children.ondblclick = function(event) {
                if (event.target == this) Tabs_ActionClickTab(this.parentNode, opt.dbclick_tab);
            };
            DIV_expand.onmousedown = function(event) {
                if (tt.DOMmenu.style.top != '-1000px') Menu_HideMenus();
                if (event.which == 1 && !event.shiftKey && !event.ctrlKey) DOM_EventExpandBox(this.parentNode.parentNode);
            };
            DIV_expand.onmouseenter = function(event) {
                this.classList.add('hover');
            };
            DIV_expand.onmouseleave = function(event) {
                this.classList.remove('hover');
            };
            if (!opt.never_show_close) {
                DIV_close_button.onmousedown = function(event) {
                    event.stopImmediatePropagation();
                    if (event.which != 3) Tabs_CloseTabs([parseInt(this.parentNode.parentNode.id)]);
                };
                DIV_close_button.onmouseenter = function(event) {
                    this.classList.add('close_hover');
                };
                DIV_close_button.onmouseleave = function(event) {
                    this.classList.remove('close_hover');
                };
            }
            DIV_header.ondblclick = function(event) {
                if (event.target.classList && event.target.classList.contains('tab_header')) Tabs_ActionClickTab(this.parentNode, opt.dbclick_tab);
            };
            DIV_header.onmousedown = function(event) {
                if (browserId == 'V') {
                    chrome.windows.getCurrent({populate: false}, function(window) {
                        if (tt.CurrentWindowId != window.id && window.focused) location.reload();
                    });
                }
                event.stopImmediatePropagation();
                if (event.which == 1) {
                    if (tt.DOMmenu.style.top != '-1000px') {
                        Menu_HideMenus();
                    } else {
                        if (event.shiftKey || event.ctrlKey) {
                            DOM_Select(event, this.parentNode);
                        }
                    }
                }
                if (event.which == 2) {
                    event.preventDefault();
                    Tabs_ActionClickTab(this.parentNode, opt.midclick_tab);
                }
                if (event.which == 3) Menu_ShowTabMenu(this.parentNode, event);
            };
            DIV_header.onclick = function(event) {
                if (!event.shiftKey && !event.ctrlKey) {
                    DOM_Deselect();
                    if (event.target.classList.contains('tab_header')) {
                        chrome.tabs.update(parseInt(this.parentNode.id), {active: true});
                    }
                }
            };
            DIV_header.onmouseover = function(event) {
                this.classList.add('tab_header_hover');
                if (opt.never_show_close == false && opt.always_show_close == false) this.classList.add('close_show');
            };
            DIV_header.onmouseleave = function(event) {
                this.classList.remove('tab_header_hover');
                if (opt.never_show_close == false && opt.always_show_close == false) this.classList.remove('close_show');
            };
            DIV_header.ondragstart = function(event) { // DRAG START
                tt.Dragging = true;
                tt.DraggingGroup = false;
                event.stopPropagation();
                event.dataTransfer.setDragImage(document.getElementById('DragImage'), 0, 0);
                event.dataTransfer.setData('text', '');
                event.dataTransfer.setData('SourceWindowId', tt.CurrentWindowId);
                DOM_CleanUpDragAndDrop();
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
                if (opt.max_tree_drag_drop && opt.max_tree_depth >= 0) {
                    let dragged_tree = document.querySelectorAll('.dragged_tree .tab, .dragged_tree .folder');
                    for (let s of dragged_tree) {
                        let parents = DOM_GetParentsByClass(s.parentNode, 'dragged_tree');
                        if (parents.length > tt.DragTreeDepth) tt.DragTreeDepth = parents.length;
                    }
                } else {
                    tt.DragTreeDepth = -1;
                }
                let Parents = DOM_GetAllParents(this.parentNode);
                for (let s of Parents) {
                    if (s.classList && (s.classList.contains('tab') || s.classList.contains('folder'))) s.classList.add('dragged_parents');
                }
                event.dataTransfer.setData('Nodes', JSON.stringify(Nodes));
                event.dataTransfer.setData('NodesTypes', JSON.stringify({DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder}));
                chrome.runtime.sendMessage({command: 'drag_start', DragTreeDepth: tt.DragTreeDepth, DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder});
            };
            DIV_header.ondragenter = function(event) {
                this.classList.remove('tab_header_hover');
            };
            DIV_header.ondragleave = function(event) {
                DOM_RemoveHighlight();
            };
            DIV_header.ondragover = function(event) {
                if (tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder) && this.parentNode.classList.contains('dragged_tree') == false) {
                    if (this.parentNode.classList.contains('pin')) {
                        if (this.parentNode.classList.contains('before') == false && event.layerX < this.clientWidth / 2) {
                            DOM_RemoveHighlight();
                            DOM_SetClasses(this.parentNode, ['before', 'highlighted_drop_target'], ['after'], []);
                        }
                        if (this.parentNode.classList.contains('after') == false && event.layerX >= this.clientWidth / 2) {
                            DOM_RemoveHighlight();
                            DOM_SetClasses(this.parentNode, ['after', 'highlighted_drop_target'], ['before'], []);
                        }
                    }
                    if (this.parentNode.classList.contains('tab')) {
                        let TabDepth = Tabs_GetTabDepthInTree(this);
                        let PDepth = TabDepth + tt.DragTreeDepth;
                        let PIsGroup = this.parentNode.parentNode.parentNode.classList.contains('group');
                        // let PIsTab = this.parentNode.parentNode.parentNode.classList.contains("tab");
                        let PIsFolder = this.parentNode.parentNode.parentNode.classList.contains('folder');
                        let PIsDraggedParents = this.parentNode.classList.contains('dragged_parents');
                        if ((PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true) && this.parentNode.classList.contains('before') == false && event.layerY < this.clientHeight / 3 && (PDepth <= opt.max_tree_depth + 1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false || PIsDraggedParents == true)) {
                            DOM_RemoveHighlight();
                            DOM_SetClasses(this.parentNode, ['before', 'highlighted_drop_target'], ['inside', 'after'], []);
                        }
                        if (tt.DraggingFolder == false && this.parentNode.classList.contains('inside') == false && event.layerY > this.clientHeight / 3 && event.layerY <= 2 * (this.clientHeight / 3) && (PDepth <= opt.max_tree_depth || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false || PIsDraggedParents == true)) {
                            DOM_RemoveHighlight();
                            DOM_SetClasses(this.parentNode, ['inside', 'highlighted_drop_target'], ['before', 'after'], []);
                        }
                        if ((PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true) && this.parentNode.classList.contains('after') == false && this.parentNode.classList.contains('o') == false && event.layerY > 2 * (this.clientHeight / 3) && (PDepth <= opt.max_tree_depth + 1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false || PIsDraggedParents == true)) {
                            DOM_RemoveHighlight();
                            DOM_SetClasses(this.parentNode, ['after', 'highlighted_drop_target'], ['before', 'inside'], []);
                        }
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
            DIV_header.ondragend = function(event) {
                if (opt.open_tree_on_hover) {
                    clearTimeout(tt.DragOverTimer);
                    tt.DragOverId = '';
                }
                setTimeout(function() {DOM_CleanUpDragAndDrop();}, 300);
                setTimeout(function() {chrome.runtime.sendMessage({command: 'drag_end'});}, 500);
            };
            DIV_audio_indicator.onmousedown = function(event) {
                event.stopImmediatePropagation();
                if (event.which == 1 && (this.parentNode.parentNode.classList.contains('audible') || this.parentNode.parentNode.classList.contains('muted'))) {
                    chrome.tabs.get(parseInt(this.parentNode.parentNode.id), function(tab) {
                        if (tab) chrome.tabs.update(tab.id, {muted: !tab.mutedInfo.muted});
                    });
                }
            };
        }
        let parent;
        if (p.tab.pinned == true) {
            parent = document.getElementById('pin_list');
        } else {
            if (p.ParentId == false || p.ParentId == undefined || p.ParentId == 'pin_list') {
                parent = document.getElementById('°' + tt.active_group);
            } else {
                parent = document.getElementById(p.ParentId);
                if (parent == null || parent.classList.contains('pin') || parent.parentNode.classList.contains('pin')) {
                    parent = document.getElementById('°' + tt.active_group);
                } else {
                    parent = document.getElementById('°' + p.ParentId);
                    if (parent.children.length == 0) DOM_SetClasses(parent.parentNode, ['o'], ['c'], []);
                }
            }
        }
        if (p.Append == true && parent) parent.appendChild(DIV_Tab);
        if ((p.Append == false || p.Append == undefined) && parent) parent.prepend(DIV_Tab);
        if (p.InsertAfterId) {
            let After = document.getElementById(p.InsertAfterId);
            if (After != null) {
                if ((p.tab.pinned && After.classList.contains('pin')) || (p.tab.pinned == false && (After.classList.contains('tab') || After.classList.contains('folder')))) {
                    DOM_InsertAfterNode(DIV_Tab, After);
                } else {
                    parent.appendChild(DIV_Tab);
                }
            } else {
                parent.appendChild(DIV_Tab);
            }
        }
        this.Node = DIV_Tab;
        this.title = DIV_title;
        if (!p.SkipFavicon) this.GetFaviconAndTitle(p.addCounter);
        if (!p.SkipMediaIcon) this.RefreshMediaIcon(p.tab.id);
        if (p.RefreshDiscarded) this.RefreshDiscarded();
        if (p.tab.active && !p.SkipSetActive) Tabs_SetActiveTab(p.tab.id);
        if (p.Scroll) this.ScrollToTab();
    }
    RemoveTab() {
        if (opt.debug) Utils_log('tabs.js: class Tabs_ttTab: RemoveTab: tabId: ' + this.id);
        if (this.Node != null) {
            this.Node.parentNode.removeChild(this.Node);
            if (tt.tabs[this.id]) delete tt.tabs[this.id];
        }
    }
    ScrollToTab() {
        if (opt.debug) Utils_log('tabs.js: class Tabs_ttTab: ScrollToTab');
        let Tab = this.Node;
        let P = document.getElementById('pin_list');
        let G = document.getElementById(tt.active_group);
        if (Tab != null) {
            if (Tab.classList.contains('pin')) {
                if (Tab.getBoundingClientRect().left - P.getBoundingClientRect().left < 0) {
                    P.scrollLeft = P.scrollLeft + Tab.getBoundingClientRect().left - P.getBoundingClientRect().left - 2;
                } else {
                    if (Tab.getBoundingClientRect().left - P.getBoundingClientRect().left > G.getBoundingClientRect().width - document.querySelector('.tab_header').getBoundingClientRect().width) {
                        P.scrollLeft = P.scrollLeft + Tab.getBoundingClientRect().left - P.getBoundingClientRect().left - P.getBoundingClientRect().width + document.querySelector('.tab_header').getBoundingClientRect().width + 2;
                    }
                }
            } else if (Tab.classList.contains('tab') && document.querySelector('#' + tt.active_group + " [id='" + this.id + "']") != null) {
                let Parents = DOM_GetParentsByClass(Tab, 'c');
                if (Parents.length > 0) {
                    for (let s of Parents) {
                        DOM_SetClasses(s, ['o'], ['c'], []);
                    }
                }
                if (Tab.getBoundingClientRect().top - G.getBoundingClientRect().top < 0) {
                    G.scrollTop = G.scrollTop + Tab.getBoundingClientRect().top - G.getBoundingClientRect().top - 2;
                } else {
                    if (Tab.getBoundingClientRect().top - G.getBoundingClientRect().top > G.getBoundingClientRect().height - document.querySelector('.tab_header').getBoundingClientRect().height) {
                        G.scrollTop = G.scrollTop + Tab.getBoundingClientRect().top - G.getBoundingClientRect().top - G.getBoundingClientRect().height + document.querySelector('.tab_header').getBoundingClientRect().height + 10;
                    }
                }
            }
        }
    }
    SetTabClass(pin) {
        if (opt.debug) Utils_log('tabs.js: class Tabs_ttTab: SetTabClass');
        let GroupList = document.getElementById('°' + tt.active_group);
        let Tab = this.Node;
        if (Tab != null) {
            if (pin) {
                if (Tab.parentNode.id != 'pin_list') document.getElementById('pin_list').appendChild(Tab);
                DOM_SetClasses(Tab, ['pin'], ['tab', 'o', 'c'], []);
                if (Tab.childNodes[1].childNodes.length > 0) { // flatten out children
                    let tabs = document.querySelectorAll('#°' + Tab.id + ' .pin, #°' + Tab.id + ' .tab');
                    for (let tab of tabs) {
                        DOM_SetClasses(tab, ['pin'], ['tab', 'o', 'c'], []);
                        DOM_InsertAfterNode(tab, Tab);
                        chrome.tabs.update(parseInt(tab.id), {pinned: true});
                    }
                    let folders = document.querySelectorAll('#°' + Tab.id + ' .folder');
                    for (let i = folders.length - 1; i >= 0; i--) {
                        GroupList.prepend(folders[i]);
                    }
                }
                chrome.tabs.update(parseInt(Tab.id), {pinned: true});
            } else {
                if (Tab.parentNode.id == 'pin_list') { // if coming from pin_list
                    if (GroupList.childNodes.length > 0) {
                        GroupList.insertBefore(Tab, GroupList.childNodes[0]);
                    } else {
                        GroupList.appendChild(Tab);
                    }
                }
                DOM_SetClasses(Tab, ['tab'], ['pin', 'attention'], []);
                DOM_RefreshExpandStates();
                chrome.tabs.update(parseInt(Tab.id), {pinned: false});
            }
            DOM_RefreshGUI();
        }
    }
    DuplicateTab() {
        if (opt.debug) Utils_log('tabs.js: class Tabs_ttTab: DuplicateTab');
        let OriginalTabNode = this.Node;
        chrome.tabs.duplicate(parseInt(this.id), function(tab) {
            let DupRetry = setInterval(function() {
                let DupTab = document.getElementById(tab.id);
                if (DupTab != null && OriginalTabNode != null) {
                    if (browserId == 'F' && tab.pinned) DOM_SetClasses(DupTab, ['pin'], ['tab'], []);
                    DOM_InsertAfterNode(DupTab, OriginalTabNode);
                    DOM_RefreshExpandStates();
                    tt.schedule_update_data++;
                    DOM_RefreshCounters();
                    clearInterval(DupRetry);
                }
            }, 10);
            setTimeout(function() {
                if (DupRetry) clearInterval(DupRetry);
            }, 500);
        });
    }
    GetFaviconAndTitle(addCounter) {
        if (opt.debug2) Utils_log('tabs.js: class Tabs_ttTab: GetFaviconAndTitle');
        let t = document.getElementById(this.id);
        let tTitle = this.title;
        if (t != null) {
            chrome.tabs.get(parseInt(t.id), async function(tab) {
                if (tab) {
                    let title = tab.title ? tab.title : tab.url;
                    if (opt.debug_tab_title_and_favicon) Utils_log('tabs.js: class Tabs_ttTab: GetFaviconAndTitle: tab.id = ' + tab.id + ' Title = ' + title);
                    let tHeader = t.childNodes[0];
                    if (tab.status == 'complete' || tab.discarded) {
                        t.classList.remove('loading');
                        tTitle.textContent = title;
                        tHeader.title = title;
                        if (opt.show_counter_tabs_hints) tHeader.setAttribute('tabTitle', title);
                        let Img = new Image();
                        let TryCases = [tab.favIconUrl, 'chrome://favicon/' + tab.url, './theme/icon_empty.svg'];
                        Tabs_LoadFavicon(tab.id, Img, TryCases, tHeader, 0);
                    }
                    if (tab.status == 'loading' && tab.discarded == false) {
                        title = tab.title ? tab.title : labels.loading;
                        t.classList.add('loading');
                        tHeader.style.backgroundImage = '';
                        tHeader.title = labels.loading;
                        if (opt.show_counter_tabs_hints) tHeader.setAttribute('tabTitle', labels.loading);
                        tTitle.textContent = labels.loading;
                        setTimeout(function() {
                            if (document.getElementById(tab.id) != null && tt.tabs[tab.id]) tt.tabs[tab.id].GetFaviconAndTitle(addCounter);
                        }, 1000);
                    }
                    if (addCounter && (opt.show_counter_tabs || opt.show_counter_tabs_hints)) tt.tabs[t.id].RefreshTabCounter();
                }
            });
        }
    }
    RefreshDiscarded() { // set discarded class
        if (opt.debug) Utils_log('tabs.js: class Tabs_ttTab: RefreshDiscarded');
        let t = document.getElementById(this.id);
        if (t != null) {
            chrome.tabs.get(parseInt(t.id), function(tab) {
                if (tab) {
                    if (tab.discarded) {
                        DOM_SetClasses(t, ['discarded'], ['audible', 'muted'], []);
                    } else {
                        t.classList.remove('discarded');
                    }
                }
            });
        }
    }
    SetAttentionIcon() { // set attention class
        if (opt.debug) Utils_log('tabs.js: class Tabs_ttTab: SetAttentionIcon');
        let t = document.getElementById(this.id);
        if (t != null) t.classList.add('attention');
    }
    RefreshMediaIcon() { // change media icon
        if (opt.debug2) Utils_log('tabs.js: class Tabs_ttTab: RefreshMediaIcon');
        let t = document.getElementById(this.id);
        if (t != null) {
            chrome.tabs.get(parseInt(t.id), function(tab) {
                if (tab) {
                    if (tab.mutedInfo.muted && !tab.discarded) DOM_SetClasses(t, ['muted'], ['audible'], []);
                    if (!tab.mutedInfo.muted && tab.audible && !tab.discarded) DOM_SetClasses(t, ['audible'], ['muted'], []);
                    if ((!tab.mutedInfo.muted && !tab.audible) || tab.discarded) DOM_SetClasses(t, [], ['audible', 'muted'], []);
                }
            });
        }
    }
    RefreshTabCounter() {
        if (opt.debug) Utils_log('tabs.js: class Tabs_ttTab: RefreshTabCounter');
        let t = document.getElementById(this.id);
        if (t != null && t.childNodes[0]) {
            let title = t.childNodes[0].getAttribute('tabTitle');
            if (t != null && title != null) {
                if (t.classList.contains('o') || t.classList.contains('c')) {
                    if (opt.show_counter_tabs) t.childNodes[0].childNodes[1].childNodes[0].textContent = document.querySelectorAll("[id='" + t.id + "'] .tab").length;
                    if (opt.show_counter_tabs_hints) t.childNodes[0].title = (document.querySelectorAll("[id='" + t.id + "'] .tab").length + ' • ') + title;
                } else {
                    t.childNodes[0].title = title;
                }
            }
        }
    }
}

async function Tabs_LoadFavicon(tabId, Img, TryUrls, TabHeaderNode, i) {
    // Some TryUrls[i] contain base64 encoding, but most do not
    if (opt.debug) {
      if (TryUrls[i]) {
        if (TryUrls[i].indexOf('base64') !== -1) {
          if (opt.debug_tab_title_and_favicon) {Utils_log('tabs.js: ' + arguments.callee.name + ': tabid = ' + tabId)}
        } else {
          if (opt.debug_tab_title_and_favicon) {Utils_log('tabs.js: ' + arguments.callee.name + ': tabid = ' + tabId + ' favicon URL = ' + JSON.stringify(TryUrls[i]))}
        }
      } else {
        if (opt.debug_tab_title_and_favicon) {Utils_log('tabs.js: ' + arguments.callee.name + ': tabid = ' + tabId)}
      }
    }
    if (TabHeaderNode) {
        Img.src = TryUrls[i];
        Img.onload = function() {
            TabHeaderNode.style.backgroundImage = 'url(' + TryUrls[i] + ')';
        };
        Img.onerror = function() {
            if (i < TryUrls.length) Tabs_LoadFavicon(tabId, Img, TryUrls, TabHeaderNode, (i + 1));
        };
    }
}

async function Tabs_SaveTabs() {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name + ': tt.schedule_update_data = ' + tt.schedule_update_data);
    setInterval(function() {
        if (tt.schedule_update_data > 1) tt.schedule_update_data = 1;
        if (tt.schedule_update_data > 0) {
            let pins_data = [];
            let tabs_data = [];
            for (let tabId in tt.tabs) {
                if (tt.tabs[tabId].Node != null && tt.tabs[tabId].Node.parentNode != null) {
                    if (tt.tabs[tabId].pinned) {
                        pins_data.push({id: tabId, parent: 'pin_list', index: Array.from(tt.tabs[tabId].Node.parentNode.children).indexOf(tt.tabs[tabId].Node), expand: ''});
                    } else {
                        tabs_data.push({id: tabId, parent: tt.tabs[tabId].Node.parentNode.parentNode.id, index: Array.from(tt.tabs[tabId].Node.parentNode.children).indexOf(tt.tabs[tabId].Node), expand: (tt.tabs[tabId].Node.classList.contains('c') ? 'c' : (tt.tabs[tabId].Node.classList.contains('o') ? 'o' : ''))});
                    }
                }
            }
            chrome.runtime.sendMessage({command: 'update_all_tabs', pins: pins_data, tabs: tabs_data});
            tt.schedule_update_data--;
        }
    }, 1000);
}

async function Tabs_RearrangeBrowserTabs() {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    setInterval(function() {
        if (tt.schedule_rearrange_tabs > 0) {
            tt.schedule_rearrange_tabs--;
            chrome.tabs.query({currentWindow: true}, function(tabs) {
                let ttTabIds = Array.prototype.map.call(document.querySelectorAll('.pin, .tab'), function(s) {return parseInt(s.id);});
                let tabIds = Array.prototype.map.call(tabs, function(t) {return t.id;});
                Tabs_RearrangeBrowserTabsLoop(ttTabIds, tabIds, ttTabIds.length - 1);
            });
        }
    }, 1000);
}

async function Tabs_RearrangeBrowserTabsLoop(ttTabIds, tabIds, tabIndex) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    if (tabIndex >= 0 && tt.schedule_rearrange_tabs == 0) {
        if (ttTabIds[tabIndex] != tabIds[tabIndex]) chrome.tabs.move(ttTabIds[tabIndex], {index: tabIndex});
        setTimeout(function() {
            Tabs_RearrangeBrowserTabsLoop(ttTabIds, tabIds, (tabIndex - 1));
        }, 0);
    }
}

function Tabs_RearrangeTree(TTtabs, TTfolders, show_finish_in_status) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage('status_bar_rearranging_tabs')});
    let Nodes = document.querySelectorAll('.pin, .tab, .folder');
    for (let Node of Nodes) {
        let Sibling = Node.nextElementSibling;
        if (Sibling) {
            let NodeIndex = TTtabs[Node.id] ? TTtabs[Node.id].index : (TTfolders[Node.id] ? TTfolders[Node.id].index : undefined);
            while (Sibling && NodeIndex) {
                let SiblingIndex = TTtabs[Sibling.id] ? TTtabs[Sibling.id].index : (TTfolders[Sibling.id] ? TTfolders[Sibling.id].index : 0);
                if (NodeIndex > SiblingIndex) DOM_InsertAfterNode(Node, Sibling);
                Sibling = Sibling.nextElementSibling ? Sibling.nextElementSibling : false;
            }
        }
        if (show_finish_in_status) Manager_ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage('status_bar_rearranging_finished'), hideTimeout: 1000});
    }
}

function Tabs_Detach(Nodes, NodesTypes, Group) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    let folderNodes = {};
    let TabsIds = [];
    for (let Node of Nodes) {
        if (Node.NodeClass == 'folder') folderNodes[Node.id] = {id: Node.id, parent: (Node.parent).substr(1), name: Node.name, index: Node.index, expand: Node.expand};
        if (Node.NodeClass == 'pin') TabsIds.push(parseInt(Node.id));
        if (Node.NodeClass == 'tab') TabsIds.push(parseInt(Node.id));
    }
    chrome.windows.get(tt.CurrentWindowId, {populate: true}, function(window) {
        if (window.tabs.length == 1) return;
        if (TabsIds.length == window.tabs.length) {
            if (opt.debug) Utils_log('tabs.js: You are trying to detach all tabs! Skipping!');
            return;
        }
        let params = TabsIds.length > 0 ? {tabId: TabsIds[0], state: window.state} : {state: window.state};
        chrome.windows.create(params, function(new_window) {
            chrome.tabs.update(new_window.tabs[0].id, {active: true});
            chrome.runtime.sendMessage({command: 'get_groups', windowId: new_window.id}, function(g) {
                if (NodesTypes.DraggingGroup) {
                    let GroupsToDetach = Object.assign({}, g); // if there will be a multi groups selection, below I will need for each group loop
                    GroupsToDetach[Group.id] = Group;
                    chrome.runtime.sendMessage({command: 'save_groups', groups: GroupsToDetach, windowId: new_window.id});
                    setTimeout(function() {Groups_GroupRemove(Group.id, false);}, 2000);
                }
                chrome.runtime.sendMessage({command: 'save_folders', folders: folderNodes, windowId: new_window.id});
                for (let Node of Nodes) {
                    if (Node.NodeClass == 'pin') {
                        chrome.tabs.update(parseInt(Node.id), {pinned: true});
                        chrome.runtime.sendMessage({command: 'update_tab', tabId: Node.id, tab: {parent: 'pin_list'}});
                    }
                    if (Node.NodeClass == 'tab') chrome.runtime.sendMessage({command: 'update_tab', tabId: Node.id, tab: {parent: (Node.parent).substr(1)}});
                    if (Node.NodeClass == 'folder') Folders_RemoveFolder(Node.id);
                }
                if (TabsIds.length > 1) {
                    TabsIds.splice(0, 1);
                    chrome.tabs.move(TabsIds, {windowId: new_window.id, index: -1}, function(MovedTabs) {
                        for (let Node of Nodes) {
                            if (Node.NodeClass == 'pin') {chrome.tabs.update(parseInt(Node.id), {pinned: true});}
                            if (Node.NodeClass == 'folder') {Folders_RemoveFolder(Node.id);}
                        }
                        let Stop = 500;
                        let DetachNodes = setInterval(function() {
                            Stop--;
                            let all_moved = true;
                            for (let Node of Nodes) {
                                if (document.getElementById(Node.id) != null) all_moved = false;
                                if (Node.NodeClass == 'pin') chrome.runtime.sendMessage({command: 'update_tab', tabId: Node.id, tab: {parent: 'pin_list'}});
                                if (Node.NodeClass == 'tab') chrome.runtime.sendMessage({command: 'update_tab', tabId: Node.id, tab: {parent: (Node.parent).substr(1)}});
                            }
                            if (all_moved || Stop < 0) {
                                setTimeout(function() {
                                    clearInterval(DetachNodes);
                                }, 300);
                            }
                        }, 100);
                    });
                }
            });
        });
    });
}

function Tabs_DiscardTabs(tabsIds) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name + ': tab IDs to be discarded: ' + JSON.stringify(tabsIds));
    let delay = 100;
    let tabNode = document.getElementById(tabsIds[0]);
    if (tabNode == null || tabNode.classList.contains('discarded') || tabNode.classList.contains('active_tab')) {
        delay = 5;
    } else {
        chrome.tabs.discard(tabsIds[0]);
    }
    tabsIds.splice(0, 1);
    if (tabsIds.length > 0) {
        setTimeout(function() {
            Tabs_DiscardTabs(tabsIds);
        }, delay);
    }
}

function Tabs_FindTab(input) { // find and select tabs
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    let ButtonFilterClear = document.getElementById('button_filter_clear');
    let Nodes = document.querySelectorAll('.filtered, .highlighted_search');
    for (let s of Nodes) {
        DOM_SetClasses(s, [], ['selected', 'selected_last', 'filtered', 'highlighted_search'], []);
    }
    if (input.length == 0) {
        document.getElementById('filter_box').value = '';
        ButtonFilterClear.style.opacity = '0'; ButtonFilterClear.title = '';
        return;
    } else {
        ButtonFilterClear.style.opacity = '1'; ButtonFilterClear.title = labels.clear_filter;
    }
    tt.SearchIndex = 0;
    let FilterType = document.getElementById('button_filter_type');
    let searchUrl = FilterType.classList.contains('url');
    let searchTitle = FilterType.classList.contains('title');
    let query = {windowId: tt.CurrentWindowId, pinned: false};
    if (input == '*audible') query = {windowId: tt.CurrentWindowId, discarded: false, audible: true, muted: false, pinned: false};
    if (input == '*muted') query = {windowId: tt.CurrentWindowId, discarded: false, muted: true, pinned: false};
    if (input == '*unloaded') query = {windowId: tt.CurrentWindowId, discarded: true, pinned: false};
    if (input == '*loaded') query = {windowId: tt.CurrentWindowId, discarded: false, pinned: false};
    chrome.tabs.query(query, function(tabs) {
        for (let Tab of tabs) {
            let t = document.getElementById(Tab.id);
            if (input == '*audible' || input == '*muted' || input == '*unloaded' || input == '*loaded') {
                DOM_SetClasses(t, ['filtered', 'selected'], [], []);
            } else {
                if (searchUrl) {
                    if (Tab.url.toLowerCase().match(input.toLowerCase())) DOM_SetClasses(t, ['filtered', 'selected'], [], []);
                }
                if (searchTitle) {
                    if (Tab.title.toLowerCase().match(input.toLowerCase())) DOM_SetClasses(t, ['filtered', 'selected'], [], []);
                }
            }
        }
    });
}

function Tabs_CloseTabs(tabsIds) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name + ': tab IDs to be closed: ' + JSON.stringify(tabsIds));
    for (let tabId of tabsIds) {
        let t = document.getElementById(tabId);
        if (t != null) t.classList.add('will_be_closed');
    }
    let activeTab = document.querySelector('.pin.active_tab, #' + tt.active_group + ' .tab.active_tab');
    if (activeTab != null && tabsIds.indexOf(parseInt(activeTab.id)) != -1) Tabs_SwitchActiveTabBeforeClose(tt.active_group);
    setTimeout(function() {
        for (let tabId of tabsIds) {
            let t = document.getElementById(tabId);
            if (t != null && t.classList.contains('pin') && opt.allow_pin_close) {
                t.parentNode.removeChild(t);
                chrome.tabs.update(tabId, {pinned: false});
                chrome.runtime.sendMessage({command: 'update_tab', tabId: tabId, tab: {parent: 'pin_list'}});
            }
            if (tabId == tabsIds[tabsIds.length - 1]) {
                setTimeout(function() {chrome.tabs.remove(tabsIds, null);}, 10);
                DOM_RefreshGUI();
            }
        }
    }, 200);
}

function Tabs_OpenNewTab(pin, InsertAfterTabId, ParentId, Append) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    chrome.tabs.create({pinned: pin}, function(tab) {
        tt.tabs[tab.id] = new Tabs_ttTab({tab: tab, ParentId: ParentId, InsertAfterId: InsertAfterTabId, Append: Append, Scroll: true});
        if (!pin && opt.move_tabs_on_url_change == 'from_empty') chrome.runtime.sendMessage({command: 'remove_tab_from_empty_tabs', tabId: tab.id});
        DOM_RefreshGUI();
        tt.schedule_update_data++;
    });
}

function Tabs_GetTabDepthInTree(Node) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    let Depth = 0;
    let ParentNode = Node;
    if (ParentNode == null) return Parents;
    let Stop = false;
    while (!Stop && ParentNode.parentNode != null) {
        if (ParentNode.parentNode.classList != undefined) {
            if (ParentNode.parentNode.classList.contains('tab')) Depth++;
            if (ParentNode.parentNode.classList.contains('folder') || ParentNode.parentNode.classList.contains('group')) {
                Stop = true;
            } else {
                ParentNode = ParentNode.parentNode;
            }
        } else {
            Stop = true;
        }
    }
    return Depth;
}

function Tabs_ActionClickTab(TabNode, bgOption) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name + ': bgOption = ' + bgOption);
    if (bgOption == 'new_tab') {
        let pin = TabNode.classList.contains('pin');
        Tabs_OpenNewTab(pin, TabNode.id, undefined, undefined);
    }
    if (bgOption == 'new_child_tab') {
        let pin = TabNode.classList.contains('pin');
        Tabs_OpenNewTab(pin, (pin ? TabNode.id : undefined), (pin ? undefined : TabNode.id), ((opt.append_child_tab === 'bottom' || opt.append_child_tab === 'after') ? true : false));
    }
    if (bgOption == 'expand_collapse') DOM_EventExpandBox(TabNode);
    if (bgOption == 'close_tab') {
        if ((TabNode.classList.contains('pin') && opt.allow_pin_close) || TabNode.classList.contains('tab')) Tabs_CloseTabs([parseInt(TabNode.id)]);
    }
    if (bgOption == 'undo_close_tab') {
        chrome.sessions.getRecentlyClosed(null, function(sessions) {
            if (sessions.length > 0) chrome.sessions.restore(null, function(restored) {});
        });
    }
    if (bgOption == 'reload_tab') {chrome.tabs.reload(parseInt(TabNode.id));}
    if (bgOption == 'unload_tab') {
        if (TabNode.classList.contains('active_tab')) {
            Tabs_SwitchActiveTabBeforeClose(tt.active_group);
            setTimeout(function() {Tabs_DiscardTabs([parseInt(TabNode.id)]);}, 500);
        } else {
            Tabs_DiscardTabs([parseInt(TabNode.id)]);
        }
    }
    if (bgOption == 'activate_previous_active' && TabNode.classList.contains('active_tab')) {
        let PrevActiveTabId = parseInt(tt.groups[tt.active_group].prev_active_tab);
        if (isNaN(PrevActiveTabId) == false) chrome.tabs.update(PrevActiveTabId, {active: true});
    }
}

function Tabs_SetActiveTab(tabId, switchToGroup) {
    let Tab = document.getElementById(tabId);
//    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name + ' (called by ' + arguments.caller.name + ') tabId = ' + tabId + ': Tab Title = ' + Tab.title);
    if (Tab != null) {
        let TabGroup = DOM_GetParentsByClass(Tab, 'group');
        if (TabGroup.length) {
            if (Tab.classList.contains('tab')) Groups_SetActiveTabInGroup(TabGroup[0].id, tabId);
            if (switchToGroup) Groups_SetActiveGroup(TabGroup[0].id, false, false); // not going to scroll, because mostly it's going to change to a new active in group AFTER switch, so we are not going to scroll to previous active tab
        }
        let active_tabs = document.querySelectorAll('.pin.active_tab, #' + tt.active_group + ' .active_tab');
        for (let s of active_tabs) {
            DOM_SetClasses(s, [], ['active_tab'], []);
        }
        DOM_RemoveHighlight();
        DOM_SetClasses(Tab, ['active_tab'], ['attention'], []);
        if (tt.tabs[tabId]) tt.tabs[tabId].ScrollToTab();
    }
}

function Tabs_SwitchActiveTabBeforeClose(ActiveGroupId) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name + ': ActiveGroupId = ' + ActiveGroupId + ': opt.after_closing_active_tab = ' + opt.after_closing_active_tab);
    let activeGroup = document.getElementById(ActiveGroupId);

    // If we're closing the last active tab in the current group
    if (document.querySelectorAll('#' + ActiveGroupId + ' .tab:not(.will_be_closed)').length <= 1 && document.querySelector('.pin.active_tab') == null) {

        if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name + ': the last active tab in the group has been closed');
        let pins = document.querySelectorAll('.pin');

        // IF THERE ARE ANY PINNED TABS, ACTIVATE IT
        if (pins.length > 0) {
            if (opt.debug) Utils_log('tabs.js: available pin, switching to: ' + pins[pins.length - 1].id);
            chrome.tabs.update(parseInt(pins[pins.length - 1].id), {active: true});
            return;
        } else { // NO OTHER CHOICE BUT TO SEEK IN ANOTHER GROUP
            if (opt.after_closing_active_tab == 'above' || opt.after_closing_active_tab == 'above_seek_in_parent') {
                if (activeGroup.previousSibling != null) {
                    if (document.querySelectorAll('#' + activeGroup.previousSibling.id + ' .tab').length > 0) {
                        Groups_SetActiveGroup(activeGroup.previousSibling.id, true, true);
                    } else {
                        Tabs_SwitchActiveTabBeforeClose(activeGroup.previousSibling.id);
                        return;
                    }
                } else {
                    Groups_SetActiveGroup('tab_list', true, true);
                }
            } else {
                if (activeGroup.nextSibling != null) {
                    if (document.querySelectorAll('#' + activeGroup.nextSibling.id + ' .tab').length > 0) {
                        Groups_SetActiveGroup(activeGroup.nextSibling.id, true, true);
                    } else {
                        Tabs_SwitchActiveTabBeforeClose(activeGroup.nextSibling.id);
                        return;
                    }
                } else {
                    Groups_SetActiveGroup('tab_list', true, true);
                }
            }
        }
    } else {
        // There are other active tabs in the group, so use the user's preference to determine which tab to activate
        if (opt.debug) Utils_log('tabs.js: opt.after_closing_active_tab: ' + opt.after_closing_active_tab);
        if (opt.after_closing_active_tab == 'above') Tabs_ActivatePrevTab(true);
        if (opt.after_closing_active_tab == 'below') Tabs_ActivateNextTab(true);
        if (opt.after_closing_active_tab == 'above_seek_in_parent') Tabs_ActivatePrevTabSameLevel();
        if (opt.after_closing_active_tab == 'below_seek_in_parent') Tabs_ActivateNextTabSameLevel();
    }
}

function Tabs_ActivateNextTabSameLevel() {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    let activeTab = document.querySelector('#' + tt.active_group + ' .tab.active_tab') != null ? document.querySelector('#' + tt.active_group + ' .tab.active_tab') : document.querySelector('.pin.active_tab');
    if (activeTab == null) return;
    let NewActiveId;
    let Node = activeTab;
    if (activeTab.classList.contains('tab')) {
        if (opt.promote_children && activeTab.childNodes[1].firstChild != null && activeTab.childNodes[1].firstChild.classList.contains('tab') && activeTab.childNodes[1].firstChild.classList.contains('will_be_closed') == false) NewActiveId = activeTab.childNodes[1].firstChild.id;
    }
    if (NewActiveId == undefined) {
        while (NewActiveId == undefined && Node.nextSibling != null && Node.classList != undefined) {
            if ((Node.nextSibling.classList.contains('pin') || Node.nextSibling.classList.contains('tab')) && Node.nextSibling.classList.contains('will_be_closed') == false) NewActiveId = Node.nextSibling.id;
            Node = Node.nextSibling;
        }
    }
    if (NewActiveId == undefined) {
        while (NewActiveId == undefined && Node.previousSibling != null && Node.classList != undefined) {
            if ((Node.previousSibling.classList.contains('pin') || Node.previousSibling.classList.contains('tab')) && Node.previousSibling.classList.contains('will_be_closed') == false) NewActiveId = Node.previousSibling.id;
            Node = Node.previousSibling;
        }
    }
    if (NewActiveId == undefined) {Tabs_ActivatePrevTab();}
    if (NewActiveId != undefined) {
        let tabId = parseInt(NewActiveId);
        if (isNaN(tabId) == false) chrome.tabs.update(tabId, {active: true});
    }
}

function Tabs_ActivatePrevTabSameLevel() {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    let activeTab = document.querySelector('#' + tt.active_group + ' .tab.active_tab') != null ? document.querySelector('#' + tt.active_group + ' .tab.active_tab') : document.querySelector('.pin.active_tab');
    if (activeTab == null) return;
    let NewActiveId;
    let Node = activeTab;
    if (activeTab.classList.contains('tab')) {
        if (opt.promote_children && activeTab.childNodes[1].firstChild != null && activeTab.childNodes[1].firstChild.classList.contains('tab') && activeTab.childNodes[1].firstChild.classList.contains('will_be_closed') == false) NewActiveId = activeTab.childNodes[1].firstChild.id;
    }
    if (NewActiveId == undefined) {
        while (NewActiveId == undefined && Node.previousSibling != null && Node.classList != undefined) {
            if ((Node.previousSibling.classList.contains('pin') || Node.previousSibling.classList.contains('tab')) && Node.previousSibling.classList.contains('will_be_closed') == false) NewActiveId = Node.previousSibling.id;
            Node = Node.previousSibling;
        }
    }
    if (NewActiveId == undefined) {
        while (NewActiveId == undefined && Node.nextSibling != null && Node.classList != undefined) {
            if ((Node.nextSibling.classList.contains('pin') || Node.nextSibling.classList.contains('tab')) && Node.nextSibling.classList.contains('will_be_closed') == false) NewActiveId = Node.nextSibling.id;
            Node = Node.nextSibling;
        }
    }
    if (NewActiveId == undefined) Tabs_ActivateNextTab();
    if (NewActiveId != undefined) {
        let tabId = parseInt(NewActiveId);
        if (isNaN(tabId) == false) chrome.tabs.update(tabId, {active: true});
    }
}

function Tabs_ActivateNextTab(allow_loop) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    let activeTab = document.querySelector('#' + tt.active_group + ' .tab.active_tab') != null ? document.querySelector('#' + tt.active_group + ' .tab.active_tab') : document.querySelector('.pin.active_tab');
    if (activeTab == null) return;
    let NewActiveId;
    let Node = activeTab;
    let parents = DOM_GetAllParents(activeTab);
    while (Node != null && Node.classList != undefined) {
        if (parents.indexOf(Node) == -1 && Node != activeTab && (Node.classList.contains('pin') || Node.classList.contains('tab')) && Node.classList.contains('will_be_closed') == false) {
            NewActiveId = Node.id;
            Node = null;
        } else {
            if (parents.indexOf(Node) == -1 && Node.childNodes[1] && Node.childNodes[1].classList.contains('children') && Node.childNodes[1].childNodes.length > 0 && Node.classList.contains('c') == false) { // GO TO CHILDREN
                Node = Node.childNodes[1].firstChild;
            } else {
                if (Node.nextSibling) { // GO TO NEXT SIBLING
                    Node = Node.nextSibling;
                } else { // GO UP TO PARENT
                    Node = Node.parentNode.parentNode;
                }
            }
        }
    }
    if (allow_loop && NewActiveId == undefined) {
        let RestartLoopFromPin = document.querySelector('.pin');
        let RestartLoopFromTab = document.querySelector('#°' + tt.active_group + ' .tab');
        if (activeTab.classList.contains('pin')) {
            if (RestartLoopFromTab != null) {
                NewActiveId = RestartLoopFromTab.id;
            } else {
                if (RestartLoopFromPin != null) NewActiveId = RestartLoopFromPin.id;
            }
        }
        if (activeTab.classList.contains('tab')) {
            if (RestartLoopFromPin != null) {
                NewActiveId = RestartLoopFromPin.id;
            } else {
                if (RestartLoopFromTab != null) NewActiveId = RestartLoopFromTab.id;
            }
        }
    }
    if (NewActiveId != undefined) {
        let tabId = parseInt(NewActiveId);
        if (isNaN(tabId) == false) chrome.tabs.update(tabId, {active: true});
    }
}

function Tabs_ActivatePrevTab(allow_loop) {
    if (opt.debug) Utils_log('tabs.js: ' + arguments.callee.name);
    let activeTab = document.querySelector('#' + tt.active_group + ' .tab.active_tab') != null ? document.querySelector('#' + tt.active_group + ' .tab.active_tab') : document.querySelector('.pin.active_tab');
    if (activeTab == null) return;
    let NewActiveId;
    let Node = activeTab;
    while (Node != null && Node.classList != undefined) {
        if (Node != activeTab && (Node.classList.contains('pin') || Node.classList.contains('tab')) && Node.classList.contains('will_be_closed') == false) {
            NewActiveId = Node.id;
            Node = null;
        } else {
            if (Node.previousSibling) { // GO TO PREV SIBLING
                Node = Node.previousSibling;
                while (Node != null && Node.classList != undefined && Node.childNodes[1] && Node.childNodes[1].classList.contains('children') && Node.childNodes[1].childNodes.length > 0 && Node.classList.contains('c') == false) {
                    Node = Node.childNodes[1].lastChild;
                }
            } else { // GO UP TO PARENT
                Node = Node.parentNode.parentNode;
            }
        }
    }
    if (allow_loop && NewActiveId == undefined) {
        let RestartLoopFromPin = document.querySelector('.pin:last-child');
        let RestartLoopFromTab = document.querySelectorAll('#°' + tt.active_group + ' .tab');
        if (activeTab.classList.contains('pin')) {
            if (RestartLoopFromTab.length > 0) {
                NewActiveId = RestartLoopFromTab[RestartLoopFromTab.length - 1].id;
            } else {
                if (RestartLoopFromPin != null) NewActiveId = RestartLoopFromPin.id;
            }
        }
        if (activeTab.classList.contains('tab')) {
            if (RestartLoopFromPin != null) {
                NewActiveId = RestartLoopFromPin.id;
            } else {
                if (RestartLoopFromTab != null) NewActiveId = RestartLoopFromTab[RestartLoopFromTab.length - 1].id;
            }
        }
    }
    if (NewActiveId != undefined) {
        let tabId = parseInt(NewActiveId);
        if (isNaN(tabId) == false) chrome.tabs.update(tabId, {active: true});
    }
}
