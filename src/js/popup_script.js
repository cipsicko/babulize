/**
 * Build list of alternate countryes
 */
const country = (alternate) => {
    return `
        <div class="col s3 m2">
            <a class="" data-location="${alternate.relativeUrl}" href="#"">
                <img class="" src="https://flagcdn.com/${alternate.hreflang.split('-')[1].toLowerCase()}.svg" />
                <span>${alternate.hreflang.toUpperCase()}</span>
            </a>
        </div>
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
 * ====================
 */

/**
 * Build summary
 */
const printSummary = (currentPageData) => {
    const summaryEL = document.querySelector('#summary');

    let markup = `
        <div class="valign-wrapper">
            <div class="col s2">
                <img class="" src="https://flagcdn.com/${currentPageData.pageLang.split('-')[1].toLowerCase()}.svg" />
            </div>
            <div class="col s10">
                <p>${currentPageData.pageTitle}</p>
            </div>
        </div>
    `;

    summaryEL.insertAdjacentHTML('beforeend', markup);
}
/**
 * ====================
 */

/**
 * Check if storage has the correct data and hide the spinner
 */
chrome.storage.local.get(['currentTabData'], function(result) {
     console.log('Value currently is ', result.currentTabData);
    if(!result.currentTabData){
        //No data set
    }else{
        //Hide prelloader and show page info
        document.querySelector('.preloader-container').classList.add('hide');
        buildSelection(result.currentTabData);
        printSummary(result.currentTabData);
        document.querySelector('.page-info').classList.remove('hide');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.dropdown-trigger');
    var instances = M.Dropdown.init(elems);
});
/**
 * ====================
 */