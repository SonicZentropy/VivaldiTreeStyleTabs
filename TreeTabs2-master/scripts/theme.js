function Theme_RestorePinListRowSettings() {
    plist = document.getElementById('pin_list');
    if (opt.pin_list_multi_row) {
        plist.style.whiteSpace = 'normal';
        plist.style.overflowX = 'hidden';
    } else {
        plist.style.whiteSpace = '';
        plist.style.overflowX = '';
    }
    DOM_RefreshGUI();
}

function Theme_ApplyTheme(theme) {
    Groups_RestoreStateOfGroupsToolbar();
    Theme_ApplySizeSet(theme['TabsSizeSetNumber']);
    Theme_ApplyColorsSet(theme['ColorsSet']);
    Theme_ApplyTabsMargins(theme['TabsMargins']);
    Theme_ApplyBlinking();
    DOM_RefreshGUI();
     // for some reason (top) text position is different in chromium !?
    // if (browserId != "F") {
    //     document.styleSheets[document.styleSheets.length-1].insertRule(".tab_title, .folder_title { margin-top: 1px; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
    // }
   for (var groupId in tt.groups) {
        let groupTitle = document.getElementById('_gte' + groupId);
        if (groupTitle != null && tt.groups[groupId].font == '') groupTitle.style.color = '';
    }
    DOM_Loadi18n();
}

// theme colors is an object with css variables (but without --), for example; {"button_background": "#f2f2f2", "filter_box_border": "#cccccc"}
function Theme_ApplyColorsSet(ThemeColors) {
    let css_variables = '';
    for (let css_variable in ThemeColors) {
        css_variables = css_variables + '--' + css_variable + ':' + ThemeColors[css_variable] + ';';
    }
    for (let si = 0; si < document.styleSheets.length; si++) {
        if (document.styleSheets[si].ownerNode.id == 'theme_colors') {
            document.styleSheets[si].deleteRule(document.styleSheets[si].cssRules.length - 1);
            document.styleSheets[si].insertRule('body { ' + css_variables + ' }', document.styleSheets[si].cssRules.length);
        }
    }
}

function Theme_ApplySizeSet(size) {
    for (let si = 0; si < document.styleSheets.length; si++) {
        if ((document.styleSheets[si].ownerNode.id).match('sizes_preset') != null) {
            if (document.styleSheets[si].ownerNode.id == 'sizes_preset_' + size) {
                document.styleSheets.item(si).disabled = false;
            } else {
                document.styleSheets.item(si).disabled = true;
            }
        }
    }
}

function Theme_ApplyTabsMargins(size) {
    for (let si = 0; si < document.styleSheets.length; si++) {
        if ((document.styleSheets[si].ownerNode.id).match('tabs_margin') != null) {
            if (document.styleSheets[si].ownerNode.id == 'tabs_margin_' + size) {
                document.styleSheets.item(si).disabled = false;
            } else {
                document.styleSheets.item(si).disabled = true;
            }
        }
    }
}

function Theme_ApplyBlinking() {
    for (let si = 0; si < document.styleSheets.length; si++) {
        if ((document.styleSheets[si].ownerNode.id).match('blinking_pins') != null) {
            if (opt.pin_attention_blinking) {
                document.styleSheets.item(si).disabled = false;
            } else {
                document.styleSheets.item(si).disabled = true;
            }
        }
        if ((document.styleSheets[si].ownerNode.id).match('blinking_audio') != null) {
            if (opt.audio_blinking) {
                document.styleSheets.item(si).disabled = false;
            } else {
                document.styleSheets.item(si).disabled = true;
            }
        }
    }
}

function Theme_GetCurrentToolbar(storage) {
    if (storage['toolbar']) {
        return storage['toolbar'];
    } else {
        return DefaultToolbar;
    }
}

function Theme_GetCurrentTheme(storage) {
    if (storage['current_theme'] && storage['themes'] && storage['themes'][storage['current_theme']]) {
        let theme = storage['themes'][storage['current_theme']];
        let correctedTheme = Theme_CheckTheme(theme);
        if (correctedTheme.theme_version < 4 && storage['preferences'].show_toolbar == undefined) {
            opt.show_toolbar = correctedTheme.ToolbarShow;
            Preferences_SavePreferences(opt);
        }
        return correctedTheme;
    } else {
        return DefaultTheme;
    }
}

// OPTIONS PAGE
function Theme_LoadTheme(ThemeId, reloadInSidebar) {
    let query = document.querySelectorAll('.theme_buttons');
    for (let s of query) {
        s.disabled = true;
    }
    chrome.storage.local.set({current_theme: ThemeId}, function() {
        chrome.storage.local.get(null, function(storage) {
            SelectedTheme = Object.assign({}, Theme_GetCurrentTheme(storage));
            setTimeout(function() {
                document.getElementById('new_theme_name').value = SelectedTheme.theme_name;
                setTimeout(function() {
                    RemoveToolbarEditEvents();
                    Theme_ApplySizeSet(SelectedTheme['TabsSizeSetNumber']);
                    Theme_ApplyColorsSet(SelectedTheme['ColorsSet']);
                    document.getElementById('_gtetab_list').style.color = '';
                    document.getElementById('_gtetab_list2').style.color = '';
                    if (SelectedTheme['TabsMargins']) {
                        document.getElementById('tabs_margin_spacing')[SelectedTheme['TabsMargins']].checked = true;
                        Theme_ApplyTabsMargins(SelectedTheme['TabsMargins']);
                    } else {
                        document.getElementById('tabs_margin_spacing')['2'].checked = true;
                    }
                    if (reloadInSidebar) chrome.runtime.sendMessage({command: 'reload_theme', ThemeId: ThemeId, theme: SelectedTheme});
                    let query = document.querySelectorAll('.theme_buttons');
                    for (let s of query) {
                        s.disabled = false;
                    }
                }, 200);
            }, 200);
        });
    });
}

function Theme_SaveTheme(ThemeId) {
    chrome.storage.local.get(null, function(storage) {
        SelectedTheme.theme_version = DefaultTheme.theme_version;
        let LSthemes = storage.themes ? Object.assign({}, storage.themes) : {};
        LSthemes[ThemeId] = Object.assign({}, SelectedTheme);
        chrome.storage.local.set({themes: LSthemes});
        chrome.runtime.sendMessage({command: 'reload_theme', ThemeId: ThemeId, theme: SelectedTheme});
        return SelectedTheme;
    });
}

function Theme_AddNewTheme() {
    let ThemeId = GenerateRandomID() + GenerateRandomID();
    let ThemeList = document.getElementById('theme_list');
    let ThemeNameBox = document.getElementById('new_theme_name');
    let NewName = ThemeNameBox.value;
    if (ThemeNameBox.value == '') {
        alert(chrome.i18n.getMessage('options_theme_name_cannot_be_empty'));
        return;
    }
    SelectedTheme = Object.assign({}, DefaultTheme);
    SelectedTheme['ColorsSet'] = {};
    ThemeNameBox.value = NewName;
    SelectedTheme['theme_name'] = NewName;
    themes.push(ThemeId);
    DOM_New('option', ThemeList, {value: ThemeId, text: NewName});
    ThemeList.selectedIndex = ThemeList.options.length - 1;
    Theme_SaveTheme(ThemeId);
    setTimeout(function() {Theme_LoadTheme(ThemeId, true);}, 50);
    chrome.storage.local.set({current_theme: ThemeId});
    RefreshFields();
}

function Theme_DeleteSelectedTheme() {
    chrome.storage.local.get(null, function(storage) {
        let LSthemes = storage.themes ? Object.assign({}, storage.themes) : {};
        let ThemeList = document.getElementById('theme_list');
        themes.splice(ThemeList.selectedIndex, 1);
        if (LSthemes[current_theme]) delete LSthemes[current_theme];
        chrome.storage.local.set({themes: LSthemes});
        ThemeList.remove(ThemeList.selectedIndex);
        current_theme = (ThemeList.options.length > 0) ? ThemeList.value : 'default';
        chrome.storage.local.set({current_theme: current_theme});
        if (ThemeList.options.length == 0) {
            current_theme = '';
            SelectedTheme = Object.assign({}, DefaultTheme);
            SelectedTheme['ColorsSet'] = {};
            chrome.storage.local.set({themes: {}});
            setTimeout(function() {chrome.runtime.sendMessage({command: 'reload_theme', themeName: '', theme: SelectedTheme});}, 500);
        }
        Theme_LoadTheme(current_theme, true);
        RefreshFields();
    });
}

function Theme_RenameSelectedTheme() {
    let ThemeList = document.getElementById('theme_list');
    let ThemeNameBox = document.getElementById('new_theme_name');
    if (ThemeNameBox.value == '') {
        alert(chrome.i18n.getMessage('options_theme_name_cannot_be_empty'));
        return;
    }
    chrome.storage.local.get(null, function(storage) {
        let LSthemes = storage.themes ? Object.assign({}, storage.themes) : {};
        ThemeList.options[ThemeList.selectedIndex].text = ThemeNameBox.value;
        SelectedTheme['theme_name'] = ThemeNameBox.value;
        LSthemes[current_theme]['theme_name'] = ThemeNameBox.value;
        chrome.storage.local.set({themes: LSthemes});
        chrome.storage.local.set({current_theme: current_theme});
    });
}

function Theme_CheckTheme(theme) {
    if (theme.theme_version < 2) {
        theme['ColorsSet']['scrollbar_height'] = theme.ScrollbarPinList + 'px';
        theme['ColorsSet']['scrollbar_width'] = theme.ScrollbarTabList + 'px';
    }
    if (theme['TabsMargins'] == undefined) theme['TabsMargins'] = '2';
    if (theme.theme_version < 4) {
        delete theme['ColorsSet']['active_font_weight'];
        delete theme['ColorsSet']['expand_lines'];
        delete theme['ColorsSet']['expand_open_border'];
        delete theme['ColorsSet']['expand_closed_border'];
        if (theme['ColorsSet']['toolbar_background']) {
            theme['ColorsSet']['toolbar_shelf_background'] = theme['ColorsSet']['toolbar_background'];
            theme['ColorsSet']['button_on_background'] = theme['ColorsSet']['toolbar_background'];
        }
        if (theme['ColorsSet']['button_icons']) {
            theme['ColorsSet']['button_on_icons'] = theme['ColorsSet']['button_icons'];
            theme['ColorsSet']['button_shelf_icons'] = theme['ColorsSet']['button_icons'];
        }
        if (theme['ColorsSet']['button_background']) theme['ColorsSet']['button_shelf_background'] = theme['ColorsSet']['button_background'];
        if (theme['ColorsSet']['button_hover_background']) theme['ColorsSet']['button_shelf_hover_background'] = theme['ColorsSet']['button_hover_background'];
        if (theme['ColorsSet']['button_border']) theme['ColorsSet']['button_shelf_border'] = theme['ColorsSet']['button_border'];
        if (theme['ColorsSet']['button_hover_border']) theme['ColorsSet']['button_shelf_hover_border'] = theme['ColorsSet']['button_hover_border'];
        if (theme['ColorsSet']['button_icons_hover']) theme['ColorsSet']['button_shelf_icons_hover'] = theme['ColorsSet']['button_icons_hover'];
        if (theme['ColorsSet']['expand_hover_background']) theme['ColorsSet']['folder_icon_hover'] = theme['ColorsSet']['expand_hover_background'];
        if (theme['ColorsSet']['expand_closed_background']) theme['ColorsSet']['folder_icon_closed'] = theme['ColorsSet']['expand_closed_background'];
        if (theme['ColorsSet']['expand_open_background']) theme['ColorsSet']['folder_icon_open'] = theme['ColorsSet']['expand_open_background'];
    }
    return theme;
}

function Theme_ImportTheme() {
    var file = document.getElementById('file_import');
    var fr = new FileReader();
    if (file.files[0] == undefined) return;
    fr.readAsText(file.files[0]);
    fr.onload = function() {
        var data = fr.result;
        file.parentNode.removeChild(file);
        var themeObj = JSON.parse(data);
        if (themeObj.theme_version > DefaultTheme['theme_version']) alert(chrome.i18n.getMessage('options_loaded_theme_newer_version'));
        if (themeObj.theme_version < DefaultTheme['theme_version']) alert(chrome.i18n.getMessage('options_loaded_theme_older_version'));
        if (themeObj.theme_version <= DefaultTheme['theme_version']) {
            let ThemeList = document.getElementById('theme_list');
            let ThemeId = GenerateRandomID() + GenerateRandomID();
            let correctedTheme = Theme_CheckTheme(themeObj);
            SelectedTheme = Object.assign({}, DefaultTheme);
            for (var val in correctedTheme.ColorsSet) {
                SelectedTheme['ColorsSet'][val] = correctedTheme.ColorsSet[val];
            }
            SelectedTheme['TabsSizeSetNumber'] = correctedTheme.TabsSizeSetNumber;
            SelectedTheme['TabsMargins'] = correctedTheme['TabsMargins'];
            SelectedTheme['theme_version'] = DefaultTheme['theme_version'];
            SelectedTheme['theme_name'] = correctedTheme.theme_name;
            themes.push(ThemeId);
            Theme_SaveTheme(ThemeId);
            let theme_name = DOM_New('option', undefined, {value: ThemeId, text: SelectedTheme['theme_name']});
            ThemeList.add(theme_name);
            ThemeList.selectedIndex = ThemeList.options.length - 1;
            current_theme = ThemeId;
            document.createElement('new_theme_name').value = ThemeId;
            setTimeout(function() {Theme_LoadTheme(ThemeId, true);}, 500);
            RefreshFields();
            DefaultTheme['ColorsSet'] = {};
            chrome.storage.local.set({current_theme: ThemeId});
        }
    };
}
