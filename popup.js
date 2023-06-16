const grabBtn = document.getElementById("grabBtn");

grabBtn.addEventListener("click",() => {
    chrome.tabs.query({active: true}, function(tabs) {
        let tab = tabs[0];
        let link = tab.url;
        if (tab) {
            if (link.indexOf("steamcommunity.com") != -1 && link.indexOf("friends") != -1) {
                chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: true},
                        func:grabProfileLevels
                    }
                )
            } else {
                alert("Not a steam tab or not a steam friends tab")
            }
        } else {
            alert("There are no active tabs")
        }
    })
})

function grabProfileLevels() {
    let api_xhr = new XMLHttpRequest();
    api_xhr.addEventListener("load", apiTransferComplete);
    let api_key = '';
    function apiTransferComplete(evt) {
        let parser = new DOMParser();
        let response = api_xhr.response;
        let dom_response = parser.parseFromString(response, "text/html");
        api_key = dom_response.getElementById('bodyContents_ex').getElementsByTagName('p')[0].innerHTML.split(':').at(-1).trim()
        if (api_key.indexOf('API Steam') != -1) {
            alert('API_KEY is not registered. Please visit: https://steamcommunity.com/dev/apikey')
            api_key = null;
        }
    }
    api_xhr.open('GET', "https://steamcommunity.com/dev/apikey", false);
    api_xhr.send();
    if (typeof api_key == 'string') {
        const profile_links = document.getElementsByClassName('selectable_overlay');
        let links_array = Array.from(profile_links).map(link=>link.href);
        let steam_id = links_array[0].split('/').at(-1);
        let levels = [];
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", transferComplete);
        let xhr2 = new XMLHttpRequest();
        xhr2.addEventListener("load", transferComplete2);
        function transferComplete(evt) {
            response = JSON.parse(xhr.responseText)
            let response_url = evt['currentTarget']['responseURL'];
            if (response['response']['success'] == 1) {
                steam_id = response['response']['steamid'];
            } else {
                steam_id = response_url.split('=').at(-1)
            }
            let get_steam_level = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${api_key}&steamid=${steam_id}`;
            xhr2.open('GET', get_steam_level, false);
            xhr2.send();
        }
        function transferComplete2(evt) {
            response = JSON.parse(xhr2.responseText)
            let level = response['response']['player_level'];
            levels.push(level);
        }

        for (i in links_array) {
            let steam_id = links_array[i].split('/').at(-1);
            let resolve_url_link = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${api_key}&vanityurl=${steam_id}`;
            xhr.open('GET', resolve_url_link, false);
            xhr.send();
        };

        const friend_blocks = document.getElementsByClassName('selectable friend_block_v2');
        for (index = 0; index < levels.length; ++index) {
            let NewDiv = document.createElement('div');
            let level = levels[index];
            let level_class = 0;
            let level_plus = 0;
            if ((typeof level) == 'number') {
                if (level > 1000) {
                    level_class = 1000 + ((level % 1000) - (level % 1000 % 100));
                    level_plus = ((level % 1000) % 100) - (((level % 1000) % 100) % 10);
                    NewDiv.className = `friendPlayerLevel lvl_${level_class} lvl_plus_${level_plus}`;
                } else if (level > 100) {
                    level_class = level - (level % 100);
                    level_plus = level - level_class - ((level - level_class) % 10);
                    NewDiv.className = `friendPlayerLevel lvl_${level_class} lvl_plus_${level_plus}`;
                } else {
                    level_class = level - (level % 10);
                    NewDiv.className = `friendPlayerLevel lvl_${level_class}`;
                }
            } else {
                level_class = 0;
                level = '?';
                NewDiv.className = `friendPlayerLevel lvl_${level_class}`;
            }
            let friend_small_text = friend_blocks[index];

            NewDiv.innerHTML = level;
            NewDiv.style.cssText = "position: absolute; top: 5px; right: 10px; color: white;";
            friend_small_text.append(NewDiv);
        }
    }
}
