chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    console.log(sender)
    console.log(sendResponse)
    console.log(message.message)
})
chrome.omnibox.onInputEntered.addListener(function (text) {
    if (text === '') {
        console.log('no text')
        let searchUrl = 'https://www.studymode.academy/'
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.update(tabs[0].id, { url: searchUrl })
            }
        )
    } else {
        console.log('searched a specific text')
        let searchQuery = text
        let searchUrl = 'https://www.studymode.academy/quizzes/new'
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabs) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: function (searchQuery) {
                        // Select the search input box and enter the search query
                        let searchInput =
                            document.getElementsByTagName('textarea')[0]
                        searchInput.value = searchQuery

                        // Submit the search form
                        let searchForm = document.getElementById('search-form')
                        searchForm.submit()
                    },
                    args: [searchQuery],
                })
                chrome.tabs.update(tabs[0].id, { url: searchUrl })
            }
        )
    }
})

chrome.commands.onCommand.addListener(function (command) {
    if (command === 'search-study-mode') {
        chrome.tabs.create({ url: 'https://www.studymode.academy' })
    }
})

chrome.contextMenus.create({
    id: 'contextMenu',
    title: 'STUDY MOD',
    contexts: ['all'],
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    console.log(info.selectionText)
    console.log(info.pageUrl)
    console.log(info.linkUrl)
    // const h1Element = document.querySelector('h1')

    //get the h1 element

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Query for the active tab to get its URL, title, and favicon URL
        const tabInfo = {}

        const activeTab = tabs[0]
        tabInfo.url = activeTab.url
        tabInfo.title = activeTab.title
        tabInfo.icon = activeTab.favIconUrl

        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                url: tabInfo.url,
                title: tabInfo.title,
                icon: tabInfo.icon,
                pageText: info.selectionText,
            },
            function (response) {}
        )
    })

    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //     chrome.tabs.sendMessage(
    //         tabs[0].id,
    //         {
    //             url: `${info.pageUrl}`,
    //             // title: h1Element,
    //         },
    //         function (response) {}
    //     )
    // })
})

//testing
// chrome.action.onClicked.addListener((tab) => {
//     chrome.tabs.sendMessage(tab.id, { message: 'openTextArea' })
// })

// chrome.runtime.sendMessage(
//     { message: 'hello' },
//     console.log('message sent')
// )

// chrome.tabs.create({
//     url: `https://www.google.com/search?q=${info.selectionText}`,
//     active: true,
// })

// chrome.tabs.create({
//     url: info.selectionText,
//     active: true,
// })

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     if (request.reply === 'hello') {
//         sendResponse({ insult: 'niggerfaggot' })
//     }
// })
