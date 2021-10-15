function Preferences_SavePreferences(options) {
    chrome.storage.local.set({preferences: options});
    chrome.runtime.sendMessage({command: 'reload_options', opt: options});
}

function Preferences_LoadDefaultPreferences() {
    opt = Object.assign({}, DefaultPreferences);
}

function Preferences_GetCurrentPreferences(storage) {
    opt = Object.assign({}, DefaultPreferences);
    if (storage.preferences) {
        for (let parameter in storage['preferences']) {
            if (opt[parameter] != undefined) {
                opt[parameter] = storage['preferences'][parameter];

                // legacy, changed from "after_active" to "after", because it is a parent tab, not necessarily an active tab
                if (parameter == 'append_child_tab' && storage['preferences'][parameter] == 'after_active') {
                    opt[parameter] = 'after';
                }
            }
        }
    } else {
        Preferences_SavePreferences(opt);
    }
}
