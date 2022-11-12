/**
 * Function to run in web page
 */
const currentPageData = () => {

    let alternateLang = [];
    try{
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
                pageTitle: document.querySelector('title').innerHTML,
                pageLang: document.querySelector('html').getAttribute('lang'),
                alternateLang: alternateLang
            }
        });

        return {
            message: 'ok',
            success: true,
        }

    }catch(err){
        return {
            message: `Error on getting hreflang or href`,
            success: false,
            error: err
        }
    }

};

/**
 * Internal logic functions
 */
async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
};

const executeScript = (tab) => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: currentPageData,
    },
    (response) => {
        if(response[0].result.success){
            chrome.storage.local.get(['currentTabData'], function(result) {
                console.log('Value currently is ', result.currentTabData);
            });
            console.info(response[0].result);
        }else{
            console.error(response[0].result);
        }
        
    });
};

/**
 * Background listeners
 */
chrome.runtime.onInstalled.addListener((tabId, changeInfo, tab) => {
    chrome.storage.local.set({
        optionPageData: {
            environments: {}
        }
    });

    /**
     * TODO:
     * -manage unistall
     * -manage upgrade
     * -manage first install
     */
});

//Actions on tab is activated: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
chrome.tabs.onActivated.addListener((activeInfo) => {
    
    getCurrentTab()
    .then((tab)=>{
        console.log('Tab Activated', activeInfo, tab);
        executeScript(tab);
    })
    
});

//Actions on tab is updated: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        
        getCurrentTab()
        .then((tab)=>{
            console.log('Tab Updated', changeInfo, tab);
            executeScript(tab);
        })

    }
});