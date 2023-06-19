const grabBtn = document.getElementById("grabBtn");

grabBtn.addEventListener("click",() => {
    chrome.tabs.query({active: true}, function(tabs) {
        let tab = tabs[0];
        let link = tab.url;
        if (tab) {
            if (link.indexOf("steamcommunity.com") != -1) {
                if (link.indexOf("friends") != -1) {
                    chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: true},
                        func:grabProfileLevelsInFriendList
                    }
                    )
                } else if ((link.indexOf("groups") != -1 && link.indexOf("members") != -1)) {
                    chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: true},
                        func:grabProfileLevelsFromGroupMembersList
                    }
                    )
                } else {
                    alert("Not a steam friends or group members tab")
                }
            } else {
                alert("Not a steam tab")
            }
        } else {
            alert("There are no active tabs")
        }
    })
})
async function grabProfileLevelsFromGroupMembersList() {
    const members = document.getElementsByClassName('member_block');
    const profile_links = document.getElementsByClassName('linkFriend');
    const links_array = Array.from(profile_links).map(link=>link.href);
    const api_url = "https://steamcommunity.com/dev/apikey";
    const parser = new DOMParser();

    let links_index = 0;
    let response = await fetch(api_url);
    let api_page = await response.text();
    let dom_response = parser.parseFromString(api_page, "text/html");
    let ranks_list = Array.prototype.slice.call(document.getElementsByClassName('rank_icon'));
    let ranks_index = 0;
    let api_key = dom_response.getElementById('bodyContents_ex').getElementsByTagName('p')[0].innerHTML.split(':').at(-1).trim();
    document.getElementsByClassName('maincontent')[1].style.cssText = "width: 1171px;"
    document.getElementById('memberList').style.cssText = "width: 1179px;"
    document.getElementsByClassName('group_paging')[0].style.cssText = "width: 1167px;"
    document.getElementsByClassName('group_paging')[1].style.cssText = "width: 1167px;"
    if (api_key.indexOf('API Steam') != -1) {
        alert('API_KEY is not registered. Please visit: https://steamcommunity.com/dev/apikey')
        api_key = null;
    }
    console.log(ranks_list.length)
    for (ranks_index; ranks_index < ranks_list.length; ++ranks_index) {
        ranks_list[ranks_index].style.cssText = "position: absolute; right: 42px;"
    }
    for (links_index; links_index < members.length; ++links_index) {
        members[links_index].style.cssText = "width: 389px;"
    }
    links_index = 0;
    if (typeof api_key == 'string') {
        for (links_index; links_index < links_array.length; ++links_index) {
            let NewDiv = document.createElement('div');
            let steam_id = links_array[links_index].split('/').at(-1);
            let resolve_url_link = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${api_key}&vanityurl=${steam_id}`;
            response = await fetch(resolve_url_link);
            let resolve_json = await response.json();
            if (resolve_json['response']['success'] == 1) {
                steam_id = resolve_json['response']['steamid'];
            }
            let get_steam_level = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${api_key}&steamid=${steam_id}`;
            response = await fetch(get_steam_level);
            let level_response = await response.json();
            let level = level_response['response']['player_level'];
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
            let member = members[links_index];
            NewDiv.innerHTML = level;
            NewDiv.style.cssText = "position: absolute; top: 7px; right: 5px; margin-top: 2px; color: white;";
            member.append(NewDiv);
        };
    }
}
async function grabProfileLevelsInFriendList() {
    const friend_blocks = document.getElementsByClassName('selectable friend_block_v2');
    const profile_links = document.getElementsByClassName('selectable_overlay');
    const api_url = "https://steamcommunity.com/dev/apikey";
    const parser = new DOMParser();
    let links_index = 0;
    let levels = [];
    let api_key = '';
    let links_array = Array.from(profile_links).map(link=>link.href);
    let response = await fetch(api_url);
    let api_page = await response.text();
    let dom_response = parser.parseFromString(api_page, "text/html");
    let level_class = 0;
    let level_plus = 0;

    api_key = dom_response.getElementById('bodyContents_ex').getElementsByTagName('p')[0].innerHTML.split(':').at(-1).trim()
    if (api_key.indexOf('API Steam') != -1) {
        alert('API_KEY is not registered. Please visit: https://steamcommunity.com/dev/apikey')
        api_key = null;
    }

    if (typeof api_key == 'string') {
        let steam_id = links_array[0].split('/').at(-1);
        for (links_index; links_index < links_array.length; ++links_index) {
            let NewDiv = document.createElement('div');
            let steam_id = links_array[links_index].split('/').at(-1);
            let resolve_url_link = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${api_key}&vanityurl=${steam_id}`;
            response = await fetch(resolve_url_link);
            let resolve_json = await response.json();
            if (resolve_json['response']['success'] == 1) {
                steam_id = resolve_json['response']['steamid'];
            }
            let get_steam_level = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${api_key}&steamid=${steam_id}`;
            response = await fetch(get_steam_level);
            let level_response = await response.json();
            let level = level_response['response']['player_level'];
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
            let friend_small_text = friend_blocks[links_index];
            NewDiv.innerHTML = level;
            NewDiv.style.cssText = "position: absolute; top: 7px; right: 5px; margin-top: 0px; color: white;";
            friend_small_text.append(NewDiv);
        };
    }
}