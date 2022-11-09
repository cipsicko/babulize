
let getAlternatLang = () => {
    const alternateLang = [];
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
    return alternateLang;
}

let currentPageData = () => {
    console.log(document.querySelector('meta[name="title"]'))
    return {
        title: document.querySelector('meta[name="title"]').getAttribute('content'),
        pageLang: document.querySelector('html').getAttribute('lang')
    }
}


chrome.runtime.sendMessage({ 
    message: "set_data",
    alternate: getAlternatLang(),
    currentPageData: currentPageData()
});