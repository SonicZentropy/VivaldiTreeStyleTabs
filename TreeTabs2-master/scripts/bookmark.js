function Bookmark(rootNode) {
    let ToolbarId = browserId == 'F' ? 'toolbar_____' : '1';
    chrome.bookmarks.get(ToolbarId, function(list) {
        chrome.bookmarks.search('TreeTabs2', function(list) {
            let TreeTabs2Id;
            for (var elem in list) {
                if (list[elem].parentId == ToolbarId) {
                    TreeTabs2Id = list[elem].id;
                    break;
                }
            }
            if (TreeTabs2Id == undefined) {
                chrome.bookmarks.create({parentId: ToolbarId, title: 'TreeTabs2'}, function(TreeTabs2New) {
                    TreeTabs2Id = TreeTabs2New.id;
                });
                Bookmark(rootNode);
                return;
            } else {
                let Tabs = document.querySelectorAll('#°' + rootNode.id + ' .tab');
                if (rootNode.classList.contains('tab')) {
                    if (Tabs.length > 0) {
                        chrome.tabs.get(parseInt(rootNode.id), function(tab) {
                            if (tab) {
                                chrome.bookmarks.create({parentId: TreeTabs2Id, title: tab.title}, function(root) {
                                    let TabNodes = document.querySelectorAll("[id='" + rootNode.id + "'], [id='" + rootNode.id + "'] .tab");
                                    for (let s of TabNodes) {
                                        chrome.tabs.get(parseInt(s.id), function(tab) {
                                            if (tab) chrome.bookmarks.create({parentId: root.id, title: tab.title, url: tab.url});
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        chrome.tabs.get(parseInt(rootNode.id), function(tab) {
                            if (tab) chrome.bookmarks.create({parentId: TreeTabs2Id, title: tab.title, url: tab.url});
                        });
                    }
                }
                if (rootNode.classList.contains('folder') || rootNode.classList.contains('group')) {
                    let rootName = labels.noname_group;
                    if (rootNode.classList.contains('folder') && tt.folders[rootNode.id]) rootName = tt.folders[rootNode.id].name;
                    if (rootNode.classList.contains('group') && tt.groups[rootNode.id]) rootName = tt.groups[rootNode.id].name;
                    chrome.bookmarks.create({parentId: TreeTabs2Id, title: rootName}, function(root) {
                        let Nodes = {};
                        let folders = document.querySelectorAll('#°' + rootNode.id + ' .folder');
                        for (let f of folders) {
                            if (tt.folders[f.id]) {
                                chrome.bookmarks.create({parentId: root.id, title: tt.folders[f.id].name}, function(Bkfolder) {
                                    Nodes[f.id] = {ttid: f.id, id: Bkfolder.id, ttparent: tt.folders[f.id].parent, parent: root.id};
                                    if (Object.keys(Nodes).length == folders.length) {
                                        for (var elem in Nodes) {
                                            if (Nodes[Nodes[elem].ttparent]) Nodes[Nodes[elem].ttid].parent = Nodes[Nodes[elem].ttparent].id;
                                        }
                                        for (var elem in Nodes) {
                                            chrome.bookmarks.move(Nodes[elem].id, {parentId: Nodes[elem].parent}, function(BkFinalfolder) {});
                                        }
                                    }
                                });
                            }
                        }
                        setTimeout(function() {
                            let reverse_tabs = Array.from(Tabs).reverse();
                            for (let t of reverse_tabs) {
                                chrome.tabs.get(parseInt(t.id), function(tab) {
                                    if (tab) chrome.bookmarks.create({parentId: (Nodes[t.parentNode.parentNode.id] ? Nodes[t.parentNode.parentNode.id].id : root.id), title: tab.title, url: tab.url});
                                });
                            }
                            // Array.from(Tabs).reverse().forEach(function(t) {
                            //     chrome.tabs.get(parseInt(t.id), function(tab) {
                            //         if (tab) chrome.bookmarks.create({parentId: (Nodes[t.parentNode.parentNode.id] ? Nodes[t.parentNode.parentNode.id].id : root.id), title: tab.title, url: tab.url});
                            //     });
                            // });
                        }, 3000);
                    });
                }
            }
        });
    });
}
