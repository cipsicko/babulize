//Save data from form
const checkData = () => {
    const   envName     = document.querySelector('#environment_name').value,
            envUrl      = document.querySelector('#environment_url').value;
    let     success     = true, 
            reason      = 'Enviroment added!';

    if(envName.length >= 40){
        success = false;
        reason = 'Name is too long. Max chart 40';
    }

    if(envName.length == 0 || envUrl.length == 0 || envName == '' || envUrl == ''){
        success = false;
        reason = 'No empty field allowed'
    }

    return {
        success : success,
        reason: reason,
        data: {
            envName : envName,
            envUrl : envUrl
        }
    }
};

const saveDataToStorage = (data) => {
    chrome.storage.local.get(['optionPageData'], function(result) {
        let now = new Date().getTime();
        let localStorage = result.optionPageData.enviroments;
        localStorage[`${now}`] = data;
        chrome.storage.local.set({
            optionPageData: {
                enviroments : localStorage
            }
        });
    });
}

const updateCollectionHTML = (datas) => {
    let collectionContainer = document.querySelector('#environmentColletion');
    collectionContainer.innerHTML = '';
    let markup = (data, index) => {
        return `
            <li class="collection-item">
                ${data.envName} | ${data.envUrl}
                <a data-id="${index}" href="#!" class="secondary-content"><i class="material-icons">delete</i></a>
            </li>
        `;
    }

    for (const prop in datas.enviroments) {
        if (Object.hasOwn(datas.enviroments, prop)) {
            collectionContainer.insertAdjacentHTML('beforeend', markup(datas.enviroments[prop], prop))
        }
    }

    document.querySelectorAll('.collection-item a').forEach((el) => {
        el.addEventListener('click', (ev) =>{
            ev.preventDefault();

            deleteItemFromStorage(el)
        });
    })

};

const deleteItemFromStorage = (el) => {
    let id = el.getAttribute('data-id');
    
    chrome.storage.local.get(['optionPageData'], function(result) {
        let localStorage = result.optionPageData.enviroments
        delete localStorage[id];
        console.log('deleted!', localStorage);
        chrome.storage.local.set({
            optionPageData: {
                enviroments : localStorage
            }
        });
    });
}


//Handlers
document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.querySelector('#optionForm');
    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        
        let response = checkData();

        if( response.success ){
            M.toast({
                html: response.reason,
                classes: 'green darken-2'
            });
            saveDataToStorage(response.data);
        }else{
            M.toast({
                html: response.reason,
                classes: 'red darken-4'
            });
        }

    });

    //retive stored data a fill collection
    chrome.storage.local.get(['optionPageData'], function(result) {
        if (Object.keys(result.optionPageData.enviroments).length){
            console.log("get datas", result.optionPageData);
            updateCollectionHTML(result.optionPageData);
        }else{
            //show FILL message
        }
    });

});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if( key === 'optionPageData' ){
            console.log('Storage updated!', newValue);
            updateCollectionHTML(newValue);
        }
    }
});