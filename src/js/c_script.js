chrome.runtime.sendMessage({
    action: 'send-data',
    alternateLang: getAlternateLang(),
    currentPageData: currentPageData(),
    pageData: {}
}, function(response) {});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting === "hello")
        sendResponse({farewell: "goodbye"});
    }
);