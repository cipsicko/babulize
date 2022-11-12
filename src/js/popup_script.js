/**
 * Build list of alternate countryes
 */
const getCountryMarkup = (alternate, response) => {
    let country = alternate.hreflang.split('-');

    return `
        <div class="col s3 m2">
            <a class="" data-location="${alternate.relativeUrl}" href="#"">
                <img class="${response ? '' : 'hide'}" src="https://flagcdn.com/${country[country.length-1].toLowerCase()}.svg" />
                <i class="material-icons ${response ? 'hide' : ''}">language</i>
                <span>${alternate.hreflang.toUpperCase()}</span>
            </a>
        </div>
    `;
};
const buildSelection = async (currentPageData) => {

    return new Promise(resolve => {
        const countrySelector = document.querySelector('#countrySelector');
        countrySelector.innerHTML = '';
        let activeUrl = new URL(currentPageData.url);

        if(!currentPageData.alternateLang.length){
            document.querySelector('#collapsible-countries').classList.add('hide');
            resolve();
        }
        currentPageData.alternateLang.forEach((alternate, index, array) => {

            //Keep the origin anche the search parameter but change only the path name
            let     alternateUrl            = new URL(alternate.href);
                    alternate.relativeUrl   = `${activeUrl.origin}${alternateUrl.pathname}${activeUrl.search}`;
            let     country                 = alternate.hreflang.split('-');

            console.log('checking url');
            checkLink(`https://flagcdn.com/${country[country.length-1].toLowerCase()}.svg`)
            .then((response)=>{
                console.log('checking complete');
                countrySelector.insertAdjacentHTML('beforeend', getCountryMarkup(alternate, response));
                if(index === array.length-1){
                    countrySelector.querySelectorAll('a').forEach(el => {
                        el.addEventListener('click', (ev) => {
                            ev.preventDefault();
                    
                            let location = el.getAttribute('data-location');
                            chrome.tabs.create({
                                url: location
                            });
                    
                        })
                    });
                    resolve();
                }
            });

        });
    });

};
/**
 * ====================
 */

/**
 * Build summary
 */
const printSummary = (currentPageData) => {
    return new Promise(resolve => {
        const summaryEL = document.querySelector('#summary');
        let country = currentPageData.pageLang.split('-');

        let markup =  (currentPageData, response) => {
            return `<div class="row">
                <div class="col s2 valign-wrapper">
                    <img class="${response ? '' : 'hide'}" src="https://flagcdn.com/${country[country.length-1].toLowerCase()}.svg" />
                    <i class="material-icons ${response ? 'hide' : ''}">language</i>
                </div>
                <div class="col s10">
                    <p>${currentPageData.pageTitle}</p>
                </div>
            </div>`
        };
        
        checkLink(`https://flagcdn.com/${country[country.length-1].toLowerCase()}.svg`)
        .then((response)=>{
            summaryEL.insertAdjacentHTML('beforeend', markup(currentPageData, response));
            resolve();
        });
    });

};
/**
 * ====================
 */

/**
 * Build Environment dropdown list
 */
const printEnvironmentList = (environments, currentTabData) => {

    if(Object.keys(environments).length > 0){
        const environmentContainer = document.querySelector('#collapsible-environment');
        environmentContainer.classList.remove('hide');
        const dropdownContainer = environmentContainer.querySelector('#dropdown1');
        dropdownContainer.innerHTML = '';

        let relativeUrl = new URL(currentTabData.url);

        const markup = (env, index) => {
            return `
                <li>
                    <a data-id="${index}" data-location="${env.envUrl}${relativeUrl.pathname}${relativeUrl.search}" href="#!"><i class="material-icons">cloud</i>${env.envName}</a>
                </li>
            `
        }
    
        for (const prop in environments) {
            if (Object.hasOwn(environments, prop)) {
                dropdownContainer.insertAdjacentHTML('beforeend', markup(environments[prop], prop))
            }
        }

        dropdownContainer.querySelectorAll('a').forEach((el) => {
            el.addEventListener('click', (ev) =>{
                ev.preventDefault();
    
                let location = el.getAttribute('data-location');
                console.log(location);
                chrome.tabs.create({
                    url: location
                });
            });
        })
    }


};
/**
 * ====================
 */

/**
 * Check URL status
 */
const checkLink = async url => (await fetch(url)).ok
/**
 * ====================
 */

/**
 * Check if storage has the correct data and hide the spinner
 */
chrome.storage.local.get(['currentTabData', 'optionPageData'], function(result) {
    if(!result.currentTabData){
        //No data set
    }else{
        
        if(result.currentTabData){
            console.log('Value currently is ', result.currentTabData);
            //Hide prelloader and show page info
            buildSelection(result.currentTabData)
            .then(()=>{
                document.querySelector('.preloader-container').classList.add('hide');
                printSummary(result.currentTabData)
                .then(()=>{
                    document.querySelector('.page-info').classList.remove('hide');
                });
            })
        }

        if(result.optionPageData){
            printEnvironmentList(result.optionPageData.environments, result.currentTabData);
        }
    }
});
/**
 * ====================
 */

/**
 * Listener fo message from content script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('request', request);
});
/**
 * ====================
 */

/**
 * On document ready functions
 */
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.dropdown-trigger');
    var instances = M.Dropdown.init(elems);

    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);

    document.querySelector('#open-option-page').addEventListener('click', (ev) => {
        ev.preventDefault();

        chrome.tabs.create({ url: "options.html" });
    });
});
/**
 * ====================
 */