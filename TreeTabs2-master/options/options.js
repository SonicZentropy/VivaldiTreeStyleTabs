// **********      OPTIONS       ***************

var current_theme = "";
var themes = [];
var SelectedTheme = Object.assign({}, DefaultTheme);
var dragged_button = { id: "" };
let tt = {
    CurrentWindowId: 0,
    active_group: "tab_list",
    tabs: {},
    groups: {},
    folders: {}
};

// options for all drop down menus
let DropDownList = ["dbclick_folder", "midclick_folder", "midclick_tab", "dbclick_group", "midclick_group", "dbclick_tab", "append_pinned_tab", "append_child_tab", "append_child_tab_after_limit", "append_orphan_tab", "append_tab_from_toolbar", "after_closing_active_tab", "move_tabs_on_url_change"];

document.addEventListener("DOMContentLoaded", function() {
    document.title = "Tree Tabs 2";
    chrome.storage.local.get(null, function(storage) {

        Groups_AppendGroupToList("tab_list", labels.ungrouped_group, "", false);
        Groups_AppendGroupToList("tab_list2", labels.noname_group, "", false);
        AppendSampleTabs();

        Preferences_GetCurrentPreferences(storage);

        if (storage["themes"]) {
            for (var themeName in storage["themes"]) {
                themes.push(themeName);
            }
        }
        if (storage["current_theme"]) {
            current_theme = storage["current_theme"];
            Theme_LoadTheme(storage["current_theme"]);
        }


        if (storage["unused_buttons"]) {
            Toolbar_RecreateToolbarUnusedButtons(storage["unused_buttons"]);
        }

        Toolbar_RecreateToolbar(Theme_GetCurrentToolbar(storage));
        Toolbar_SetToolbarEvents(false, false, true, "click", false, true);
        AddEditToolbarEditEvents();


        GetOptions(storage);
        RefreshFields();
        SetEvents();


        setTimeout(function() {
            document.querySelectorAll(".on").forEach(function(s) {
                s.classList.remove("on");
            });
            RefreshGUI();
        }, 100);
    });
});

function SetRegexes() {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);
    let regexes = document.getElementById('tab_group_regexes');
    opt.tab_group_regexes = [];
    for (let child of regexes.children) {
        var regex = child.children[0].value.trim();
        var groupName = child.children[1].value.trim();
        if (regex !== "" && groupName !== "") {
            if (opt.debug) Utils_log("options.js: " + arguments.callee.name + ': regex = ' + regex + ': groupName = ' + groupName);
            opt.tab_group_regexes.push([regex, groupName]);
        }
    }
    Preferences_SavePreferences(opt);
}

function AddRegexPair() {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);
    let regexes = document.getElementById('tab_group_regexes');
    let outer = document.createElement("div");

    let input = document.createElement("input");
    input.type = "text";
    input.style.width = '200px';
    input.onchange = SetRegexes;
    input.onkeyup = SetRegexes;
    outer.appendChild(input);

    input = document.createElement("input");
    input.type = "text";
    input.style.width = '200px';
    input.onchange = SetRegexes;
    input.onkeyup = SetRegexes;
    outer.appendChild(input);

    let deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.style.width = '75px';
    deleteButton.className = "set_button theme_buttons";
    deleteButton.value = chrome.i18n.getMessage("options_Remove_button");
    deleteButton.onclick = function() { regexes.removeChild(outer); }
    outer.appendChild(deleteButton);

    regexes.appendChild(outer);
    return outer;
}

// document events
function GetOptions(storage) {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);
    // get language labels
    document.querySelectorAll(".label, .set_button, .bg_opt_drop_down_menu, .hint_explanation").forEach(function(s) {
        s.textContent = chrome.i18n.getMessage(s.id);
    });

    // get language for menu labels
    document.querySelectorAll(".menu_item").forEach(function(s) {
        s.textContent = chrome.i18n.getMessage("options_example_menu_item");
    });

    // get checkboxes from saved states
    document.querySelectorAll(".opt_checkbox").forEach(function(s) {
        s.checked = opt[s.id];
        if (s.checked) {
            if (s.id == "never_show_close") {
                document.getElementById("always_show_close").disabled = true;
            }
        } else {
            if (s.id == "promote_children") {
                document.getElementById("promote_children_in_first_child").disabled = true;
            }
        }
    });

    // get language labels
    document.querySelectorAll(".pick_col, #close_x, #close_hover_x, .options_button_minus, .options_button_plus, .tabs_margin_spacing").forEach(function(s) {
        s.title = chrome.i18n.getMessage(s.id);
    });


    // get options for all drop down menus (loop through all drop down items that are in DropDownList array)
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name + ": DropDownList.length = " + DropDownList.length);
    for (let i = 0; i < DropDownList.length; i++) {
        let DropDownOption = document.getElementById(DropDownList[i]);
        for (let j = 0; j < DropDownOption.options.length; j++) {
            if (DropDownOption.options[j].value == opt[DropDownList[i]]) {
                DropDownOption.selectedIndex = j;
                break;
            }
        }
        RefreshFields();
    }

    for (let i = 0; i < opt.tab_group_regexes.length; i++) {
        let regexPair = opt.tab_group_regexes[i];
        let outer = AddRegexPair();
        outer.children[0].value = regexPair[0];
        outer.children[1].value = regexPair[1]
    }

    // get options for tabs tree depth option
    document.getElementById("max_tree_depth").value = opt.max_tree_depth;


    // append themes to dropdown menu
    let ThemeList = document.getElementById("theme_list");
    for (var i = 0; i < themes.length; i++) {
        let theme_name = document.createElement("option");
        theme_name.value = themes[i];
        theme_name.text = storage.themes[themes[i]].theme_name;
        ThemeList.add(theme_name);
    }
    // select current theme in dropdown list
    for (var i = 0; i < ThemeList.options.length; i++) {
        if (ThemeList.options[i].value == current_theme) {
            ThemeList.selectedIndex = i;
            break;
        }
    }
}

function RemovePreview() {
    // if (opt.debug) ... this is just for the hover colors/borders
    document.querySelectorAll(".hover_blinking").forEach(function(s) { s.classList.remove("hover_blinking"); });
    document.querySelectorAll(".hover_border_blinking").forEach(function(s) { s.classList.remove("hover_border_blinking"); });
    document.querySelectorAll(".red_preview").forEach(function(s) {
        s.style.backgroundColor = "";
        s.style.border = "";
        s.style.borderBottom = "";
        s.style.borderRight = "";
        s.style.color = "";
        s.style.animation = "";
        s.style.fontWeight = "";
        s.style.fontStyle = "";
        // s.style.zIndex = "";
        s.classList.remove("red_preview");
    });
}

function AddRedStylePreview(Id, style, value, removePreview) {
    // if (opt.debug) ... this is just for the hover colors/borders
    if (removePreview) RemovePreview();
    let d = document.getElementById(Id);
    d.classList.add("red_preview");
    d.style[style] = value;
}

function AddBlueBackgroundPreview(Id, removePreview) {
    // if (opt.debug) ... this is just for the hover colors/borders
    if (removePreview) RemovePreview();
    document.getElementById(Id).classList.add("hover_blinking");
}

function AddBlueBorderPreview(Id, removePreview) {
    // if (opt.debug) ... this is just for the hover colors/borders
    if (removePreview) RemovePreview();
    document.getElementById(Id).classList.add("hover_border_blinking");
}

// document events
function SetEvents() {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);
    // --------------------------------DONATIONS-----------------------------------------------------------------------------

    document.getElementById("donate_paypal").onclick = function(event) {
        if (event.which == 1) {
            chrome.tabs.create({ url: "https://www.paypal.me/tommcarthur" });
        }
    }

    // --------------------------------COPY VIVALDI LINK----------------------------------------------------------------------

    document.getElementById("copy_vivaldi_url_for_web_panel").onclick = function(event) {
        if (event.which == 1) {
            copyStringToClipboard(chrome.runtime.getURL("sidebar.html"));
            alert(chrome.i18n.getMessage("options_vivaldi_copied_url"));
        }
    }

    // --------------------------------ADD RED AND BLUE PREVIEWS---------------------------------------------------------------
    // document.body.onmousedown = function(event) {
    // if (event.which == 1 && (event.target.id || event.target.classList)) {
    // console.log(event.target);
    // }
    // }


    document.querySelectorAll("#scrollbar_thumb_hover, #options_tab_list_scrollbar_height_up, #options_tab_list_scrollbar_height_down, #options_tab_list_scrollbar_width_up, #options_tab_list_scrollbar_width_down, .pick_col, .font_weight_normal, .font_weight_bold, .font_style_normal, .font_style_italic, #filter_box_font").forEach(function(s) {
        s.onmouseleave = function(event) {
            RemovePreview();
        }
    });

    // toolbar buttons
    document.getElementById("button_background").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_plus", "backgroundColor", "red", true);
    }
    document.getElementById("button_hover_background").onmouseenter = function(event) {
        AddBlueBackgroundPreview("button_theme_plus", true);
    }

    document.getElementById("button_on_background").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_search", "backgroundColor", "red", true);
    }

    document.getElementById("button_icons").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_plus_img", "backgroundColor", "red", true);
    }
    document.getElementById("button_icons_hover").onmouseenter = function(event) {
        AddBlueBackgroundPreview("button_theme_plus_img", true);
    }
    document.getElementById("button_on_icons").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_search_img", "backgroundColor", "red", true);
    }

    document.getElementById("button_border").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_plus", "border", "1px solid red", true);
    }
    document.getElementById("button_hover_border").onmouseenter = function(event) {
        AddBlueBorderPreview("button_theme_plus", true);
    }


    // search box
    document.getElementById("filter_box_font").onmouseenter = function(event) {
        AddRedStylePreview("filter_box_theme", "color", "red", true);
    }
    document.getElementById("filter_box_background").onmouseenter = function(event) {
        AddRedStylePreview("filter_box_theme", "backgroundColor", "red", true);
    }
    document.getElementById("filter_box_border").onmouseenter = function(event) {
        AddRedStylePreview("filter_box_theme", "border", "1px solid red", true);
    }
    document.getElementById("filter_clear_icon").onmouseenter = function(event) {
        AddRedStylePreview("button_filter_clear_theme", "backgroundColor", "red", true);
    }

    // toolbar background
    document.getElementById("toolbar_background").onmouseenter = function(event) {
        AddRedStylePreview("toolbar_main_theme", "backgroundColor", "red", true);
    }

    // shelf toolbar background
    document.getElementById("toolbar_shelf_background").onmouseenter = function(event) {
        AddRedStylePreview("toolbar_search_input_box_theme", "backgroundColor", "red", true);
    }

    // toolbar's border
    document.getElementById("toolbar_border_bottom").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_search", "border", "1px solid red", true);
        AddRedStylePreview("toolbar_main_theme", "borderBottom", "1px solid red");
        AddRedStylePreview("toolbar_theme", "borderBottom", "1px solid red");
    }

    // shelf toolbar buttons
    document.getElementById("button_shelf_background").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_pen", "backgroundColor", "red", true);
    }
    document.getElementById("button_shelf_hover_background").onmouseenter = function(event) {
        AddBlueBackgroundPreview("button_theme_pen", true);
    }
    document.getElementById("button_shelf_icons").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_pen_img", "backgroundColor", "red", true);
    }
    document.getElementById("button_shelf_icons_hover").onmouseenter = function(event) {
        AddBlueBackgroundPreview("button_theme_pen_img", true);
    }
    document.getElementById("button_shelf_border").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_pen", "border", "1px solid red", true);
    }
    document.getElementById("button_shelf_hover_border").onmouseenter = function(event) {
        AddBlueBorderPreview("button_theme_pen", true);
    }

    // pinned tab attention_background
    document.getElementById("attention_background").onmouseenter = function(event) {
        AddRedStylePreview("tab_header_10", "backgroundColor", "red", true);
        document.getElementById("tab_header_10").style.animation = "none";
    }

    // pinned tab attention_border
    document.getElementById("attention_border").onmouseenter = function(event) {
        AddRedStylePreview("tab_header_10", "border", "1px solid red", true);
        document.getElementById("tab_header_10").style.animation = "none";
    }

    // pin_list border bottom
    document.getElementById("pin_list_border_bottom").onmouseenter = function(event) {
        AddRedStylePreview("pin_list", "borderBottom", "1px solid red", true);
    }

    // pin_list background
    document.getElementById("pin_list_background").onmouseenter = function(event) {
        AddRedStylePreview("pin_list", "backgroundColor", "red", true);
    }


    // tab row font_color
    document.querySelectorAll(".tab_col.font_color").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
        }
    });

    // tab row font not bold
    document.querySelectorAll(".tab_col.font_weight_normal").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "fontWeight", "normal", false);
        }
    });

    // tab row font bold
    document.querySelectorAll(".tab_col.font_weight_bold").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "fontWeight", "bold", false);
        }
    });

    // tab row font style normal
    document.querySelectorAll(".tab_col.font_style_normal").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "fontStyle", "normal", false);
        }
    });
    // tab row font style italic
    document.querySelectorAll(".tab_col.font_style_italic").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "fontStyle", "italic", false);
        }
    });


    // tab border
    document.querySelectorAll(".tab_col.color_border").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_header_" + this.parentNode.id.substr(1), "border", "1px solid red", true);
        }
    });

    // tab background
    document.querySelectorAll(".tab_col.color_bucket").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_header_" + this.parentNode.id.substr(1), "backgroundColor", "red", true);
        }
    });

    // scrollbars hover
    document.getElementById("scrollbar_thumb_hover").onmouseenter = function(event) {
        AddBlueBackgroundPreview("group_scrollbar_thumb", true);
        AddBlueBackgroundPreview("pin_list_scrollbar_thumb");
    }

    // scrollbars thumb
    document.getElementById("scrollbar_thumb").onmouseenter = function(event) {
        AddRedStylePreview("group_scrollbar_thumb", "backgroundColor", "red", true);
        AddRedStylePreview("pin_list_scrollbar_thumb", "backgroundColor", "red");
    }


    // scrollbars track
    document.getElementById("scrollbar_track").onmouseenter = function(event) {
        AddRedStylePreview("group_scrollbar", "backgroundColor", "red", true);
        AddRedStylePreview("pin_list_scrollbar", "backgroundColor", "red");
    }


    // tab_list scrollbars
    document.querySelectorAll("#options_tab_list_scrollbar_width_up, #options_tab_list_scrollbar_width_down").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("group_scrollbar", "backgroundColor", "red", true);
            AddRedStylePreview("group_scrollbar_thumb", "backgroundColor", "red");
        }
    });

    // pin_list scrollbars
    document.querySelectorAll("#options_tab_list_scrollbar_height_up, #options_tab_list_scrollbar_height_down").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("pin_list_scrollbar", "backgroundColor", "red", true);
            AddRedStylePreview("pin_list_scrollbar_thumb", "backgroundColor", "red");
        }
    });



    // folder icon open
    document.getElementById("folder_icon_open").onmouseenter = function(event) {
            AddRedStylePreview("folder_expand_f_folder1", "backgroundColor", "red", true);
        }
        // folder icon closed
    document.getElementById("folder_icon_closed").onmouseenter = function(event) {
            AddRedStylePreview("folder_expand_f_folder2", "backgroundColor", "red", true);
        }
        // folder icon hover
    document.getElementById("folder_icon_hover").onmouseenter = function(event) {
        AddBlueBackgroundPreview("folder_expand_f_folder3", true);
    }


    // tab expand closed
    document.getElementById("expand_closed_background").onmouseenter = function(event) {
            AddRedStylePreview("exp_14", "backgroundColor", "red", true);
        }
        // tab expand hover
    document.getElementById("expand_hover_background").onmouseenter = function(event) {
            AddBlueBackgroundPreview("exp_16", true);
        }
        // tab expand open
    document.getElementById("expand_open_background").onmouseenter = function(event) {
        AddRedStylePreview("exp_5", "backgroundColor", "red", true);
    }





    // drag indicator
    document.getElementById("drag_indicator").onmouseenter = function(event) {
        AddRedStylePreview("drag_indicator_19", "borderBottom", "1px solid red", true);
    }


    // close x
    document.getElementById("close_x").onmouseenter = function(event) {
            AddRedStylePreview("close_img_11", "backgroundColor", "red", true);
        }
        // close x hover
    document.getElementById("close_hover_x").onmouseenter = function(event) {
            AddBlueBackgroundPreview("close_img_13", true);
        }
        // close border hover
    document.getElementById("close_hover_border").onmouseenter = function(event) {
            AddBlueBorderPreview("close_13", true);
        }
        // close border hover
    document.getElementById("close_hover_background").onmouseenter = function(event) {
        AddBlueBackgroundPreview("close_13", true);
    }




    // group button hover
    document.getElementById("group_list_button_hover_background").onmouseenter = function(event) {
            AddBlueBackgroundPreview("_tab_list2", true);
        }
        // group buttons borders
    document.getElementById("group_list_borders").onmouseenter = function(event) {
            AddRedStylePreview("toolbar_groups_block", "borderRight", "1px solid red", true);
            AddRedStylePreview("_tab_list", "border", "1px solid red");
        }
        // group buttons font
    document.getElementById("group_list_default_font_color").onmouseenter = function(event) {
            AddRedStylePreview("_gtetab_list", "color", "red", true);
            AddRedStylePreview("_gtetab_list2", "color", "red");
        }
        // group list background
    document.getElementById("group_list_background").onmouseenter = function(event) {
            AddRedStylePreview("toolbar_groups_block", "backgroundColor", "red", true);
        }
        // tab_list background
    document.getElementById("tab_list_background").onmouseenter = function(event) {
        AddRedStylePreview("tab_list", "backgroundColor", "red", true);
        AddRedStylePreview("_tab_list", "backgroundColor", "red");
    }





    // menu hover border
    document.getElementById("tabs_menu_hover_border").onmouseenter = function(event) {
            AddRedStylePreview("menu_hover_sample", "border", "1px solid red", true);
        }
        // menu hover background
    document.getElementById("tabs_menu_hover_background").onmouseenter = function(event) {
        AddRedStylePreview("menu_hover_sample", "backgroundColor", "red", true);
    }

    // menu separator
    document.getElementById("tabs_menu_separator").onmouseenter = function(event) {
        AddRedStylePreview("menu_separator1", "backgroundColor", "red", true);
        AddRedStylePreview("menu_separator2", "backgroundColor", "red");
    }

    // menu font
    document.getElementById("tabs_menu_font").onmouseenter = function(event) {
        AddRedStylePreview("menu_hover_sample", "color", "red", true);
        AddRedStylePreview("menu_sample1", "color", "red");
        AddRedStylePreview("menu_sample2", "color", "red");
    }


    // menu border
    document.getElementById("tabs_menu_border").onmouseenter = function(event) {
        AddRedStylePreview("tabs_menu", "border", "1px solid red", true);
    }

    // menu background
    document.getElementById("tabs_menu_background").onmouseenter = function(event) {
        AddRedStylePreview("tabs_menu", "backgroundColor", "red", true);
    }



    // --------------------------------------COLOR PICKER---------------------------------------------------------------------

    // change fonts weight && style
    document.querySelectorAll(".font_weight_normal, .font_weight_bold, .font_style_normal, .font_style_italic").forEach(function(s) {
        s.onmousedown = function(event) {
            event.stopPropagation();
            // if this.classList.contains("font_weight_normal") || this.classList.contains("font_style_normal")
            let FontStyle = "normal";
            if (this.classList.contains("font_weight_bold")) {
                FontStyle = "bold";
            }
            if (this.classList.contains("font_style_italic")) {
                FontStyle = "italic";
            }
            SelectedTheme["ColorsSet"][this.id] = FontStyle;
            Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    });

    // show color picker
    document.querySelectorAll(".pick_col").forEach(function(s) {
        s.onclick = function(event) {
            if (event.which == 1) {
                RemovePreview();
                event.stopPropagation();
                let bod = document.getElementById("body");
                let color = window.getComputedStyle(bod, null).getPropertyValue("--" + this.id);
                let ColorPicker = document.getElementById("color_picker");
                ColorPicker.setAttribute("PickColor", this.id);
                ColorPicker.value = color.replace(" ", "");
                ColorPicker.click();
            }
        }
    });

    document.getElementById("color_picker").oninput = function(event) {
        let ColorPicker = document.getElementById("color_picker");
        SelectedTheme["ColorsSet"][this.getAttribute("PickColor")] = ColorPicker.value;
        Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
        // Theme_SaveTheme(document.getElementById("theme_list").value);
    }
    document.getElementById("color_picker").onchange = function(event) {
        Theme_SaveTheme(document.getElementById("theme_list").value);
    }


    // ----------------------------------EVENTS FOR CHECKBOXES AND DROPDOWN MENUS---------------------------------------------

    // set checkbox options on/off and save
    document.querySelectorAll(".bg_opt").forEach(function(s) {
        s.onclick = function(event) {
            if (event.which == 1) {
                opt[this.id] = this.checked ? true : false;
                if (this.checked) {
                    if (this.id == "never_show_close") {
                        document.getElementById("always_show_close").disabled = true;
                    }
                    if (this.id == "promote_children") {
                        document.getElementById("promote_children_in_first_child").disabled = false;
                    }
                } else {
                    if (this.id == "never_show_close") {
                        document.getElementById("always_show_close").disabled = false;
                    }
                    if (this.id == "promote_children") {
                        document.getElementById("promote_children_in_first_child").disabled = true;
                    }
                }
                Preferences_SavePreferences(opt);
                if (this.id == "show_toolbar") {
                    Toolbar_SaveToolbar();
                    RefreshFields();


                    // setTimeout(function() {
                    // chrome.runtime.sendMessage({command: "reload_toolbar", toolbar: toolbar, opt: opt});
                    // }, 300);
                }
            }
        }
    });


    // options that need reload
    document.onclick = function(event) {
        if (event.which == 1) {
            if (event.target.id == "syncro_tabbar_tabs_order" || event.target.id == "allow_pin_close" || event.target.id == "switch_with_scroll" || event.target.id == "always_show_close" || event.target.id == "never_show_close" || event.target.id == "hide_other_groups_tabs_firefox" ||
                event.target.id == "collapse_other_trees" || event.target.id == "show_counter_tabs" || event.target.id == "show_counter_tabs_hints" || event.target.id == "syncro_tabbar_tabs_order" || event.target.id == "syncro_tabbar_groups_tabs_order" || event.target.id == "groups_toolbar_default") {
                setTimeout(function() {
                    chrome.runtime.sendMessage({ command: "reload_sidebar" });
                }, 50);
            }
            if (event.target.id == "groups_toolbar_default") {
                chrome.runtime.sendMessage({ command: "reload" });
                setTimeout(function() {
                    location.reload();
                }, 300);
            }
        }
    }

    // set dropdown menu options
    for (let i = 0; i < DropDownList.length; i++) {
        document.getElementById(DropDownList[i]).onchange = function(event) {
            opt[this.id] = this.value;
            RefreshFields();
            setTimeout(function() {
                Preferences_SavePreferences(opt);
                // chrome.runtime.sendMessage({command: "reload_sidebar"});
            }, 50);
        }
    }

    // set tabs tree depth option
    document.getElementById("max_tree_depth").oninput = function(event) {
        opt.max_tree_depth = parseInt(this.value);
        setTimeout(function() {
            Preferences_SavePreferences(opt);
        }, 50);
    }

    // set toolbar on/off and show/hide all toolbar options
    // document.getElementById("show_toolbar").onclick = function(event) {if (event.which == 1) {
    // SelectedTheme.ToolbarShow = this.checked ? true : false;
    // RefreshFields();
    // Theme_SaveTheme(document.getElementById("theme_list").value);
    // }}


    // ------------------------------OTHER-----------------------------------------------------------------------------------

    // block system dragging
    document.ondrop = function(event) {
        event.preventDefault();
    }
    document.ondragover = function(event) {
        event.preventDefault();
    }

    // ------------------------------ADD REGEX FILTER-------------------------------------------------------------------------

    document.getElementById("add_tab_group_regex").onclick = AddRegexPair;

    // ----------------------------RESET TOOLBAR BUTTON-----------------------------------------------------------------------

    document.getElementById("options_reset_toolbar_button").onclick = function(event) {
        if (event.which == 1) {

            Toolbar_SetToolbarEvents(true, false, false, "", false, false);
            RemoveToolbarEditEvents();


            let unused_buttons = document.getElementById("toolbar_unused_buttons");
            while (unused_buttons.hasChildNodes()) {
                unused_buttons.removeChild(unused_buttons.firstChild);
            }

            Toolbar_RemoveToolbar();
            Toolbar_RecreateToolbar(DefaultToolbar);
            Toolbar_SetToolbarEvents(false, false, true, "click", false, true);
            AddEditToolbarEditEvents();

            Toolbar_SaveToolbar();


        }
    }


    // --------------------------------------THEME BUTTONS--------------------------------------------------------------------


    // add new theme preset button
    document.getElementById("options_add_theme_button").onclick = function(event) {
        if (event.which == 1) {
            Theme_AddNewTheme();
        }
    }

    // remove theme preset button
    document.getElementById("options_remove_theme_button").onclick = function(event) {
        if (event.which == 1) {
            Theme_DeleteSelectedTheme();
        }
    }

    // select theme from list
    document.getElementById("theme_list").onchange = function(event) {
        Theme_LoadTheme(this.value, true);
        chrome.storage.local.set({ current_theme: this.value });
    }

    // import theme preset button
    document.getElementById("options_import_theme_button").onclick = function(event) {
        if (event.which == 1) {
            let inputFile = File_ShowOpenFileDialog(".tt_theme");
            inputFile.onchange = function(event) {
                Theme_ImportTheme();
            }
        }
    }

    // export theme preset button
    document.getElementById("options_export_theme_button").onclick = function(event) {
        if (event.which == 1) {
            let ThemeList = document.getElementById("theme_list");
            if (ThemeList.options.length == 0) {
                alert(chrome.i18n.getMessage("options_no_theme_to_export"));
            } else {
                File_SaveFile(ThemeList.options[ThemeList.selectedIndex].text, "tt_theme", SelectedTheme);
            }
        }
    }

    // rename theme preset button
    document.getElementById("options_rename_theme_button").onclick = function(event) {
            if (event.which == 1) {
                Theme_RenameSelectedTheme();
            }
        }
        // get themes
    document.getElementById("options_share_theme_link").onclick = function(event) {
        if (event.which == 1) {
            chrome.tabs.create({ url: "https://drive.google.com/drive/folders/0B3jXQpRtOfvSelFrTEVHZEx3Nms?usp=sharing" });
        }
    }


    // -------------------------------INDENTATION ADJUSTMENT------------------------------------------------------------------

    // change tabs size preset(down)
    document.getElementById("options_tabs_indentation_down").onmousedown = function(event) {
        let bod = document.getElementById("body");
        var indentation = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--children_padding_left")).replace("p", "").replace("x", ""));
        if (indentation > 0) {
            indentation--;
            SelectedTheme["ColorsSet"]["children_padding_left"] = indentation + "px";
            Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }

    // change tabs size preset(up)
    document.getElementById("options_tabs_indentation_up").onmousedown = function(event) {
        let bod = document.getElementById("body");
        var indentation = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--children_padding_left")).replace("p", "").replace("x", ""));
        if (indentation < 50) {
            indentation++;
            SelectedTheme["ColorsSet"]["children_padding_left"] = indentation + "px";
            Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }


    // --------------------------TABS ROUNDNESS ADJUSTMENT--------------------------------------------------------------------

    // change tabs roundness preset(down)
    document.getElementById("options_tabs_roundness_down").onmousedown = function(event) {
        let bod = document.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--tab_header_border_radius").replace("p", "").replace("x", "")));
        if (border_radius > 0) {
            border_radius--;
            SelectedTheme["ColorsSet"]["tab_header_border_radius"] = border_radius + "px";
            Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }

    // change tabs roundness preset(up)
    document.getElementById("options_tabs_roundness_up").onmousedown = function(event) {
        let bod = document.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--tab_header_border_radius")).replace("p", "").replace("x", ""));
        if (border_radius < 25) {
            border_radius++;
            SelectedTheme["ColorsSet"]["tab_header_border_radius"] = border_radius + "px";
            Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }

    // -------------------------------SIZE ADJUSTMENT-------------------------------------------------------------------------

    // set tabs margins
    document.getElementById("tabs_margin_spacing").onchange = function(event) {
        let size = "0";
        if (this[1].checked) {
            size = "1";
        } else {
            if (this[2].checked) {
                size = "2";
            }
        }
        SelectedTheme["TabsMargins"] = size;
        Theme_ApplyTabsMargins(size);
        Theme_SaveTheme(document.getElementById("theme_list").value);
    }


    // change tabs size preset(down)
    document.getElementById("options_tabs_size_down").onmousedown = function(event) {
        if (SelectedTheme["TabsSizeSetNumber"] > 0) {
            SelectedTheme["TabsSizeSetNumber"]--;
            Theme_ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }

    // change tabs size preset(up)
    document.getElementById("options_tabs_size_up").onmousedown = function(event) {
        if (SelectedTheme["TabsSizeSetNumber"] < 5) {
            SelectedTheme["TabsSizeSetNumber"]++;
            Theme_ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }


    // -------------------------------TABS SCROLLBAR SIZE ADJUSTMENT----------------------------------------------------------

    // change tab list scrollbar preset(down)
    document.getElementById("options_tab_list_scrollbar_width_down").onmousedown = function(event) {
        let bod = document.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_width").replace("p", "").replace("x", "")));
        if (border_radius > 0) {
            border_radius--;
            SelectedTheme["ColorsSet"]["scrollbar_width"] = border_radius + "px";
            Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }

    // change tab list scrollbar preset(up)
    document.getElementById("options_tab_list_scrollbar_width_up").onmousedown = function(event) {
        let bod = document.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_width")).replace("p", "").replace("x", ""));
        if (border_radius < 20) {
            border_radius++;
            SelectedTheme["ColorsSet"]["scrollbar_width"] = border_radius + "px";
            Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }

    // change pin list scrollbar preset(down)
    document.getElementById("options_tab_list_scrollbar_height_down").onmousedown = function(event) {
        let bod = document.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_height").replace("p", "").replace("x", "")));
        if (border_radius > 0) {
            border_radius--;
            SelectedTheme["ColorsSet"]["scrollbar_height"] = border_radius + "px";
            Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }

    // change pin list scrollbar preset(up)
    document.getElementById("options_tab_list_scrollbar_height_up").onmousedown = function(event) {
        let bod = document.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_height")).replace("p", "").replace("x", ""));
        if (border_radius < 20) {
            border_radius++;
            SelectedTheme["ColorsSet"]["scrollbar_height"] = border_radius + "px";
            Theme_ApplyColorsSet(SelectedTheme["ColorsSet"]);
            Theme_SaveTheme(document.getElementById("theme_list").value);
        }
    }



    // ----------------------EXPORT DEBUG LOG---------------------------------------------------------------------------------
    document.getElementById("options_export_debug").onclick = function(event) {
        if (event.which == 1) {
            chrome.storage.local.get(null, function(storage) {
                File_SaveFile("TreeTabs2", "log", storage.debug_log);
            });
        }
    }

    // ----------------------CLEAR/RESET DEBUG LOG---------------------------------------------------------------------------------
    document.getElementById("options_clear_debug").onclick = function(event) {
        if (event.which == 1) {
            Clear_log();
            alert("The log has been cleared.");
        };
    }

    // ----------------------CLEAR DATA BUTTON--------------------------------------------------------------------------------

    // clear data
    document.getElementById("options_clear_data").onclick = function(event) {
        if (event.which == 1) {
            chrome.storage.local.clear();
            setTimeout(function() {
                chrome.runtime.sendMessage({ command: "reload" });
                chrome.runtime.sendMessage({ command: "reload_sidebar" });
                location.reload();
            }, 100);
        }
    }

}

function RemoveToolbarEditEvents() {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);
    document.querySelectorAll("#button_filter_clear").forEach(function(s) {
        s.style.opacity = "0";
    });
    document.querySelectorAll(".button").forEach(function(s) {
        s.removeAttribute("draggable");
    });
}

// ----------------------EDIT TOOLBAR-------------------------------------------------------------------------------------
function AddEditToolbarEditEvents() {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);
    document.querySelectorAll("#button_filter_clear").forEach(function(s) {
        s.style.opacity = "1";
    });

    document.querySelectorAll("#toolbar_main .button_img, #toolbar_shelf_tools .button_img, #toolbar_shelf_groups .button_img, #toolbar_shelf_backup .button_img, #toolbar_shelf_folders .button_img").forEach(function(s) {
        s.setAttribute("draggable", true);
        s.onmousedown = function(event) {
            if (event.which == 1) {
                dragged_button = document.getElementById(this.parentNode.id);
            }
        }
        s.ondragstart = function(event) {
                event.dataTransfer.setData(" ", " ");
                event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
            }
            // move (flip) buttons
        s.ondragenter = function(event) {
                if ((dragged_button.id == "button_tools" || dragged_button.id == "button_search" || dragged_button.id == "button_groups" || dragged_button.id == "button_backup" || dragged_button.id == "button_folders") && this.parentNode.parentNode.classList.contains("toolbar_shelf")) {
                    return;
                }
                let dragged_buttonIndex = Array.from(dragged_button.parentNode.children).indexOf(dragged_button);
                let Index = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);

                if (Index <= dragged_buttonIndex) {
                    DOM_InsterBeforeNode(dragged_button, this.parentNode);
                } else {
                    DOM_InsertAfterNode(dragged_button, this.parentNode);
                }
            }
            // save toolbar
        s.ondragend = function(event) {
            RemoveToolbarEditEvents();
            Toolbar_SaveToolbar();
            AddEditToolbarEditEvents();
        }
    });


    document.querySelectorAll("#toolbar_main, .toolbar_shelf:not(#toolbar_search), #toolbar_unused_buttons").forEach(function(s) {
        s.ondragenter = function(event) {
            if ((dragged_button.id == "button_tools" || dragged_button.id == "button_search" || dragged_button.id == "button_groups" || dragged_button.id == "button_backup" || dragged_button.id == "button_folders") && this.classList.contains("toolbar_shelf")) {
                return;
            }
            if (dragged_button.parentNode.id != this.id) {
                this.appendChild(dragged_button);
            }

        }
    });
}

function copyStringToClipboard(string) {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);
    function handler(event) {
        event.clipboardData.setData('text/plain', string);
        event.preventDefault();
        document.removeEventListener('copy', handler, true);
    }
    document.addEventListener('copy', handler, true);
    document.execCommand('copy');
}

// shrink or expand theme field
function RefreshFields() {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);
    if (document.getElementById("theme_list").options.length == 0) {
        document.getElementById("field_theme").style.height = "45px";
    } else {
        document.getElementById("field_theme").style.height = "";
    }
    // if (browserId == "F") {
    if (browserId != "F") {
        // document.querySelectorAll("#scrollbar_size_indicator, #scrollbar_thumb, #scrollbar_thumb_hover, #scrollbar_track").forEach(function(s) {
            // s.style.display = "none";
        // });
    // } else {
        document.querySelectorAll("#firefox_option_hide_other_groups_tabs_firefox").forEach(function(s) {
            s.style.display = "none";
        });
    }
    if (browserId == "V") {
        let WebPanelUrlBox = document.getElementById("url_for_web_panel");
        WebPanelUrlBox.value = (chrome.runtime.getURL("sidebar.html"));
        WebPanelUrlBox.setAttribute("readonly", true);
        document.getElementById("field_vivaldi").style.display = "block";
    }
    if (document.getElementById("show_toolbar").checked) {
        document.querySelectorAll("#options_available_buttons, #sample_toolbar_block, #options_reset_toolbar_button").forEach(function(s) {
            s.style.display = "";
        });
        document.getElementById("options_toolbar_look").style.display = "";
        document.getElementById("field_show_toolbar").style.height = "";
    } else {
        document.querySelectorAll("#options_available_buttons, #sample_toolbar_block, #options_reset_toolbar_button").forEach(function(s) {
            s.style.display = "none";
        });
        document.getElementById("options_toolbar_look").style.display = "none";
        document.getElementById("field_show_toolbar").style.height = "6";
    }


    if (document.getElementById("append_child_tab").value == "after") {
        document.getElementById("append_child_tab_after_limit_dropdown").style.display = "none";
        document.getElementById("options_append_orphan_tab_as_child").style.display = "none";

        if (opt.append_child_tab == "after" && opt.append_orphan_tab == "as_child") {
            opt.append_orphan_tab = "after_active";
            document.getElementById("append_orphan_tab").value = "after_active";
            Preferences_SavePreferences(opt);
        }

    } else {
        document.getElementById("append_child_tab_after_limit_dropdown").style.display = "";
        document.getElementById("options_append_orphan_tab_as_child").style.display = "";
    }
}

function RefreshGUI() {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);
    let button_filter_type = document.getElementById("button_filter_type");
    if (button_filter_type != null) {
        button_filter_type.classList.add("url");
        button_filter_type.classList.remove("title");
    }
    if (document.querySelector(".on") != null) {
        document.getElementById("toolbar").style.height = "53px";
    } else {
        document.getElementById("toolbar").style.height = "26px";
    }
}

function AppendSampleTabs() {
    if (opt.debug) Utils_log("options.js: " + arguments.callee.name);

    // folders
    Folders_AddNewFolder({ folderId: "f_folder1", ParentId: "°tab_list", Name: labels.noname_group, Index: 0, ExpandState: "o", SkipSetEvents: true, AdditionalClass: "o" });
    Folders_AddNewFolder({ folderId: "f_folder2", ParentId: "f_folder1", Name: labels.noname_group, Index: 0, ExpandState: "c", SkipSetEvents: true, AdditionalClass: "c" });
    Folders_AddNewFolder({ folderId: "f_folder3", ParentId: "f_folder1", Name: labels.noname_group, Index: 0, ExpandState: "c", SkipSetEvents: true, AdditionalClass: "c" });

    // pins
    tt.tabs["0"] = new Tabs_ttTab({ tab: { id: 0, pinned: true, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    tt.tabs["1"] = new Tabs_ttTab({ tab: { id: 1, pinned: true, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    tt.tabs["10"] = new Tabs_ttTab({ tab: { id: 10, pinned: true, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("10").classList.add("attention");

    // regular tabs
    tt.tabs["2"] = new Tabs_ttTab({ tab: { id: 2, pinned: false, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, addCounter: true, SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_2").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal");

    tt.tabs["11"] = new Tabs_ttTab({ tab: { id: 11, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_11").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_hover");
    document.getElementById("tab_header_11").classList.add("tab_header_hover");
    document.getElementById("tab_header_11").classList.add("close_show");

    tt.tabs["12"] = new Tabs_ttTab({ tab: { id: 12, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_12").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected");

    tt.tabs["13"] = new Tabs_ttTab({ tab: { id: 13, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_13").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected_hover");
    document.getElementById("tab_header_13").classList.add("tab_header_hover")
    document.getElementById("tab_header_13").classList.add("close_show");
    document.getElementById("close_13").classList.add("close_hover");

    // regular active tabs
    tt.tabs["3"] = new Tabs_ttTab({ tab: { id: 3, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_3").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active");

    tt.tabs["15"] = new Tabs_ttTab({ tab: { id: 15, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_15").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_hover");
    document.getElementById("tab_header_15").classList.add("tab_header_hover");

    tt.tabs["14"] = new Tabs_ttTab({ tab: { id: 14, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "c selected active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_14").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected");

    tt.tabs["16"] = new Tabs_ttTab({ tab: { id: 16, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "c selected active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_16").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected_hover");
    document.getElementById("tab_header_16").classList.add("tab_header_hover");
    document.getElementById("exp_16").classList.add("hover");

    // discarded tabs
    tt.tabs["5"] = new Tabs_ttTab({ tab: { id: 5, pinned: false, active: false, discarded: true }, Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_5").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded");

    tt.tabs["17"] = new Tabs_ttTab({ tab: { id: 17, pinned: false, active: false, discarded: true }, ParentId: "5", Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_17").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_hover");
    document.getElementById("tab_header_17").classList.add("tab_header_hover");

    tt.tabs["19"] = new Tabs_ttTab({ tab: { id: 19, pinned: false, active: false, discarded: true }, ParentId: "5", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected highlighted_drop_target after", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_19").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected");

    tt.tabs["20"] = new Tabs_ttTab({ tab: { id: 20, pinned: false, active: false, discarded: true }, ParentId: "5", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_20").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected_hover");
    document.getElementById("tab_header_20").classList.add("tab_header_hover");

    // search result
    tt.tabs["6"] = new Tabs_ttTab({ tab: { id: 6, pinned: false, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_6").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result");

    tt.tabs["21"] = new Tabs_ttTab({ tab: { id: 21, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_21").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_hover");
    document.getElementById("tab_header_21").classList.add("tab_header_hover");

    tt.tabs["22"] = new Tabs_ttTab({ tab: { id: 22, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_22").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active");

    tt.tabs["23"] = new Tabs_ttTab({ tab: { id: 23, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_23").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active_hover");
    document.getElementById("tab_header_23").classList.add("tab_header_hover");


    // search result selected
    tt.tabs["8"] = new Tabs_ttTab({ tab: { id: 8, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_8").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected");

    tt.tabs["18"] = new Tabs_ttTab({ tab: { id: 18, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_18").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_hover");
    document.getElementById("tab_header_18").classList.add("tab_header_hover");

    tt.tabs["25"] = new Tabs_ttTab({ tab: { id: 25, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_25").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active");


    tt.tabs["26"] = new Tabs_ttTab({ tab: { id: 26, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_26").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active_hover");
    document.getElementById("tab_header_26").classList.add("tab_header_hover");

    // search result highlighted
    tt.tabs["30"] = new Tabs_ttTab({ tab: { id: 30, pinned: false, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_30").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted");

    tt.tabs["31"] = new Tabs_ttTab({ tab: { id: 31, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_31").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_hover");
    document.getElementById("tab_header_31").classList.add("tab_header_hover");

    tt.tabs["32"] = new Tabs_ttTab({ tab: { id: 32, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_32").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active");

    tt.tabs["33"] = new Tabs_ttTab({ tab: { id: 33, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_33").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active_hover");
    document.getElementById("tab_header_33").classList.add("tab_header_hover");

    tt.tabs["34"] = new Tabs_ttTab({ tab: { id: 34, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered highlighted_search", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_34").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected");

    tt.tabs["35"] = new Tabs_ttTab({ tab: { id: 35, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered highlighted_search", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_35").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_hover");
    document.getElementById("tab_header_35").classList.add("tab_header_hover");

    tt.tabs["36"] = new Tabs_ttTab({ tab: { id: 36, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered highlighted_search active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_36").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active");

    tt.tabs["37"] = new Tabs_ttTab({ tab: { id: 37, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered highlighted_search active_tab", SkipFavicon: true, SkipMediaIcon: true });
    document.getElementById("tab_title_37").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active_hover");
    document.getElementById("tab_header_37").classList.add("tab_header_hover");

    document.getElementById("_tab_list").classList.add("active_group");

}