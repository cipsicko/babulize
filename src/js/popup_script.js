
/**
 * Build list of alternate countryes
 */
const country = (alternate) => {
    return `
        <a data-location="${alternate.relativeUrl}" href="#"">
            <img src="https://countryflagsapi.com/svg/${alternate.hreflang.split('-')[1]}" />
            <span>${alternate.hreflang.toUpperCase()}</span>
        </a>
    `;
};
const buildSelection = (alternates) => {

    if(alternates && activeTab){
        const countrySelector = document.querySelector('#countrySelector');
        countrySelector.innerHTML = '';
        alternates.forEach(alternate => {

            //Keep the origin anche the search parameter but change only the path name
            let alternateUrl = new URL(alternate.href);
            let activeUrl = new URL(activeTab.url);
            alternate.relativeUrl = `${activeUrl.origin}${alternateUrl.pathname}${activeUrl.search}`;
            countrySelector.insertAdjacentHTML('beforeend', country(alternate));
        });
    
        countrySelector.querySelectorAll('a').forEach(el => {
            el.addEventListener('click', (ev) => {
                ev.preventDefault();

                let location = el.getAttribute('data-location');
                chrome.tabs.create({
                    url: location
                });
    
            })
        });
    }else{
        countrySelector.insertAdjacentText('beforebegin', 'Please wait until page is fully loaded, than reopen me!');
    }
};

/**
 * Build summary
 */
const printSummary = (currentPageData) => {
    const summaryEL = document.querySelector('#summary');
    summaryEL.innerHTML = '';
    const summaryPageTitle = document.createElement('p');
    const summaryCurrentLang = document.createElement('p');

    summaryPageTitle.innerHTML = currentPageData.title;
    summaryPageTitle.className = "summary--title";
    summaryCurrentLang.innerHTML = `<img src="https://countryflagsapi.com/svg/${currentPageData.pageLang.split('-')[1]}" />`;
    summaryCurrentLang.className = "summary--lang";

    summaryEL.appendChild(summaryCurrentLang);
    summaryEL.appendChild(summaryPageTitle)
}

/**
 * Comunications
 */
const getData = (request) => {
    buildSelection(request.alternateLang, request.activeUrl);
    printSummary(request.currentPageData);
};

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

let activeTab = undefined;
getCurrentTab()
.then((tab) => {
    activeTab = tab;
    chrome.scripting.executeScript({
        target: {tabId: tab.id, allFrames: true},
        files: ['./js/c_script.js'],
    },
    () => {
        console.log('script executed');
    });
});

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {

        getCurrentTab()
        .then((tab) => {
            console.log('request from listener', {
                tab: tab,
                request: request,
                sender: sender,
                sendResponse: sendResponse
            });

            getData(request);
        })

    }
);
