function File_ShowOpenFileDialog(extension) {
    let inp = DOM_New("input", document.getElementById("body"), {id: "file_import", type: "file", accept: extension}, {display: "none"});
    inp.click();
    return inp;
}

function File_SaveFile(filename, extension, data) {
    if (browserId == "V") {
        chrome.tabs.create({url: "vivaldi/save_file.html"}, async function(tab) {
            setTimeout(function() {
                chrome.runtime.sendMessage({command: "save_file", filename: filename, extension: extension, data: data});
            }, 500);
        });
    } else {
      let file;
        if (extension == "log") {
          file = new File([JSON.stringify(data, null, 4)], filename + "." + extension, {type: "text/" + extension + ";charset=utf-8"});
        } else {
          file = new File([JSON.stringify(data)], filename + "." + extension, {type: "text/" + extension + ";charset=utf-8"});
        }
//      let file = new File([JSON.stringify(data)], filename + "." + extension, {type: "text/" + extension + ";charset=utf-8"});
        let savelink = DOM_New("a", document.getElementById("body"), {href:URL.createObjectURL(file), fileSize: file.size, target: "_blank", type: "file", download: (filename + "." + extension)}, {display: "none"});
        savelink.click();
        setTimeout(function() {
            savelink.parentNode.removeChild(savelink);
        }, 60000);
    }
}