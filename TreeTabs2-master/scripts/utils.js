function Utils_RGBtoHex(color) { // color in format "rgb(r,g,b)" or simply "r,g,b" (can have spaces, but must contain "," between values)
    color = color.replace(/[rgb(]|\)|\s/g, '');
    color = color.split(',');
    return color.map(function(v) {return ('0' + Math.min(Math.max(parseInt(v), 0), 255).toString(16)).slice(-2);}).join('');
}
function Utils_HexToRGB(hex, alpha) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.length == 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
    let g = parseInt(hex.length == 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
    let b = parseInt(hex.length == 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
    if (alpha) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    } else {
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
}
function Utils_log(log) {
    chrome.runtime.sendMessage({command: 'debug', log: log});
}
function Clear_log() {
    chrome.runtime.sendMessage({command: 'clearlog'});
}

Utils_log('utils.js has finished loading');
