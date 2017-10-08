var debugMsg = "";
function onError(message, source, lineno/*, colno, error*/)
{
    debugInfo("Error: " + source + ":" + lineno + " " + message);
}
window.onerror = onError;

function debugInfo(str)
{
    debugMsg += str + "<br>";
    document.getElementById("debugText").innerHTML = debugMsg;
}
