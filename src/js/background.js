/**
 * Function to run in web page
 */
const currentPageData = () => {

    let alternateLang = [];
    document.querySelectorAll('link[rel="alternate"]').forEach(lang => { 
    
        //The hreflang attribute is not set while user is viewing that coutry
        if(!lang.getAttribute('hreflang')){
            return;
        }
    
        alternateLang.push({
            'hreflang' : lang.getAttribute('hreflang'),
            'href' : lang.getAttribute('href')
        });
    });

    chrome.storage.local.set({
        currentTabData: {
            url: window.location.href,
            pageTitle: document.querySelector('meta[name="title"]').getAttribute('content'),
            pageLang: document.querySelector('html').getAttribute('lang'),
            alternateLang: alternateLang
        }
    });
};

/**
 * Background Core functions
 */
async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
};

/**
 * Background listeners
 */
chrome.runtime.onInstalled.addListener((tabId, changeInfo, tab) => {
});

//Actions on tab is activated: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Tab Activated', activeInfo);
    
    chrome.scripting.executeScript({
        target: {tabId: activeInfo.tabId, allFrames: false},
        function: currentPageData,
    },
    () => {
        chrome.storage.local.get(['currentTabData'], function(result) {
            console.log('Value currently is ', result.currentTabData);
        });
    });
});

//Actions on tab is updated: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        console.log('Tab updated', changeInfo);
        
        chrome.scripting.executeScript({
            target: {tabId: activeInfo.tabId, allFrames: false},
            function: currentPageData,
        },
        () => {
            chrome.storage.local.get(['currentTabData'], function(result) {
                console.log('Value currently is ', result.currentTabData);
            });
        });
    }
});