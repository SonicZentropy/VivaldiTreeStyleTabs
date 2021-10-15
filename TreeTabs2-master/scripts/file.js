function File_ShowOpenFileDialog(extension) {
    let inp = DOM_New('input', document.getElementById('body'), {id: 'file_import', type: 'file', accept: extension}, {display: 'none'});
    inp.click();
    return inp;
}

function File_SaveFile(inFilename, inExtension, data) {
  Utils_log('manager.js: ' + arguments.callee.name + ': filename = ' + inFilename + ', extension = ' + inExtension);

  if (browserId == 'V') {
      chrome.tabs.create({url: 'vivaldi/save_file.html'}, async function(tab) {
          setTimeout(function() {
              chrome.runtime.sendMessage({command: 'save_file', filename: inFilename, extension: inExtension, data: data});
          }, 500);
      });

  } else {

    let blob = new Blob([JSON.stringify(data, null, 4)], {type: 'text/' + inExtension + ';charset=utf-8'});

    let filename = inFilename + '.' + inExtension;

    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const a = document.createElement('a');
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 1);
    }
  }
}
