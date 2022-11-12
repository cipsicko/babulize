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
        let localStorage = result.optionPageData.environments;
        localStorage[`${now}`] = data;
        chrome.storage.local.set({
            optionPageData: {
                environments : localStorage
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
                <span>${data.envName} | <a href="${data.envUrl}">${data.envUrl}</a></span>
                <a data-id="${index}" href="#!" class="secondary-content"><i class="material-icons">delete</i></a>
            </li>
        `;
    }

    for (const prop in datas.environments) {
        if (Object.hasOwn(datas.environments, prop)) {
            collectionContainer.insertAdjacentHTML('beforeend', markup(datas.environments[prop], prop))
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
        let localStorage = result.optionPageData.environment
        delete localStorage[id];
        console.log('deleted!', localStorage);
        chrome.storage.local.set({
            optionPageData: {
                environment : localStorage
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
        console.log(result.optionPageData)
        if (Object.keys(result.optionPageData.environments).length){
            //there are some data. show collection
            console.log("get datas", result.optionPageData);
            document.querySelector('#environmentColletion-message').classList.add('hide');
            document.querySelector('#environmentColletion').classList.remove('hide');
            updateCollectionHTML(result.optionPageData);
        }else{
            //show FILL message
            document.querySelector('#environmentColletion-message').classList.remove('hide');
            document.querySelector('#environmentColletion').classList.add('hide');
        }
    });

});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if( key === 'optionPageData' ){
            console.log('Storage updated!', newValue);

            if (Object.keys(newValue.environments).length){
                //there are some data. show collection
                document.querySelector('#environmentColletion-message').classList.add('hide');
                document.querySelector('#environmentColletion').classList.remove('hide');
                updateCollectionHTML(newValue);
            }else{
                //show FILL message
                document.querySelector('#environmentColletion-message').classList.remove('hide');
                document.querySelector('#environmentColletion').classList.add('hide');
            }

        }
    }
});