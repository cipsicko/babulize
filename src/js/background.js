chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        alternate: undefined,
        currentPageData: undefined
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./foreground.js"]
        })
        .then(() => {
            console.log("INJECTED THE FOREGROUND SCRIPT.");
        });
        
        chrome.storage.local.set({
            activeUrl: tab.url
        })
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.message === 'get_data') {
        chrome.storage.local.get(['currentPageData', 'alternate', 'activeUrl'], data => {
            if (chrome.runtime.lastError) {
                sendResponse({
                    message: 'fail'
                });

                return;
            }

            sendResponse({
                message: 'success',
                alternate: data.alternate,
                currentPageData: data.currentPageData,
                activeUrl: data.activeUrl
            });
        });

        return true;
    } else if (request.message === 'set_data') {
        chrome.storage.local.set({
            alternate: request.alternate,
            currentPageData: request.currentPageData
        }, () => {
            chrome.storage.local.get(['currentPageData', 'alternate'], data => {
                console.log('Data from foreground set!', data);
            })
        });
    } else if (request.message === 'delete_data') {
        chrome.storage.local.set({
            alternate: undefined,
            currentPageData: undefined
        });
    }
});