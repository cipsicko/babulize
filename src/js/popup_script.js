
/**
 * Build list of alternate countryes
 */
const country = (alternate) => {
    return `
        <a data-location="${alternate.relativeUrl}" href="#"">
            <img src="https://flagcdn.com/${alternate.hreflang.split('-')[1].toLowerCase()}.svg" />
            <span>${alternate.hreflang.toUpperCase()}</span>
        </a>
    `;
};
const buildSelection = (currentPageData) => {

    const countrySelector = document.querySelector('#countrySelector');
    countrySelector.innerHTML = '';
    let activeUrl = new URL(currentPageData.url);

    currentPageData.alternateLang.forEach(alternate => {

        //Keep the origin anche the search parameter but change only the path name
        let alternateUrl = new URL(alternate.href);
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
};

/**
 * Build summary
 */
const printSummary = (currentPageData) => {
    const summaryEL = document.querySelector('#summary');
    summaryEL.innerHTML = '';
    const summaryPageTitle = document.createElement('p');
    const summaryCurrentLang = document.createElement('p');

    summaryPageTitle.innerHTML = currentPageData.pageTitle;
    summaryPageTitle.className = "summary--title";
    summaryCurrentLang.innerHTML = `<img src="https://flagcdn.com/${currentPageData.pageLang.split('-')[1].toLowerCase()}.svg" />`;
    summaryCurrentLang.className = "summary--lang";

    summaryEL.appendChild(summaryCurrentLang);
    summaryEL.appendChild(summaryPageTitle)
}

/**
 * Check if storage has the correct data and hide the spinner
 */
 chrome.storage.local.get(['currentTabData'], function(result) {
     console.log('Value currently is ', result.currentTabData);
    if(!result.currentTabData){
        //No data set
    }else{
        buildSelection(result.currentTabData);
        printSummary(result.currentTabData);
    }
});