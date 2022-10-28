
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
const buildSelection = (alternates, active) => {

    if(alternates && active){
        const countrySelector = document.querySelector('#countrySelector');
        countrySelector.innerHTML = '';
        alternates.forEach(alternate => {

            //Keep the origin anche the search parameter but change only the path name
            let alternateUrl = new URL(alternate.href);
            let activeUrl = new URL(active);
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
 * Refresh data
 */
document.querySelector('#refresh').addEventListener('click', (ev) => {
    ev.preventDefault();
    console.log('click');
    document.querySelector('#statusMessage').classList.add('loading');
    getData()
        .then(() => {
            console.log('finito');
            document.querySelector('#statusMessage').classList.remove('loading');
        });
});

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
const getData = () => {
    return new Promise(resolve => {
        chrome.runtime.sendMessage({
            message: "get_data"
            }, response => {
                if (response.message === 'success') {
                    console.log('gettin data');
                    buildSelection(response.alternate, response.activeUrl);
                    printSummary(response.currentPageData);
                    resolve();
                }
            }
        );
    });
};
getData();