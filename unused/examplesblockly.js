window.addEventListener("DOMContentLoaded", function() {
    var codes = document.getElementsByTagName("code");
    for (var i = 0; i < codes.length; i++) {
        var code = codes[i];
        var lines = code.innerHTML.split("\n").length;
        code.setAttribute("data-line-count", lines);
    }
});

var start_block = '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="new_event_start" maxInstances="1"></block>/xml>'

function LoadWorkspaceCode(code) {
    parent.LoadCode(code);
}
