//ADD THE CSS
var head = document.getElementsByTagName('head')[0]
var link = document.createElement('link')
link.rel = 'stylesheet'
link.type = 'text/css'
link.href = chrome.runtime.getURL('content.css')
head.appendChild(link)

//SHORTEN TEXT HELPER FUNCTIONS
function truncateUrl(url) {
    // Remove the protocol if it exists
    let domain = url.split('://')[1] || url

    // Get the domain up to the first slash
    domain = domain.split('/')[0]

    // Get the domain up to the last dot
    const lastDotIndex = domain.lastIndexOf('.')
    domain = domain.substring(0, lastDotIndex)

    return domain
}
function truncateTitle(text) {
    if (text.length > 26) {
        return `${text.slice(0, 26)}...`
    }
    return text
}

function removeBracketsFromString(str) {
    if (str === undefined || str === null) return ''
    return str.replace(/\[\d+\]/g, '')
}

function countWords(str) {
    if (str === undefined || str === null) return 0
    var words = str.match(/\b\w+\b/g)
    return words ? words.length : 0
}

function tuncateTextStartEnd(str) {
    if (str.length <= 150) {
        return str
    } else {
        return str.slice(0, 50) + '...' + str.slice(str.length - 100)
    }
}
//SHORTEN TEXT HELPER FUNCTIONS --- END

//SAVE A NOTE
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('request', request)
    console.log('sender', sender)
    console.log('sendResponse', sendResponse)
    console.log('request.pageText', request.pageText)

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0px'
    container.style.right = '0px'
    container.style.backgroundColor = 'white'
    container.style.zIndex = '9999'
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.25)'
    container.style.borderRadius = '2em'
    container.style.margin = '5px'
    //this needs to be media query
    container.style.minHeight = '20vh'
    container.style.minWidth = '20vw'
    container.style.justifyContent = 'space-between'

    const titleContainer = document.createElement('div')
    titleContainer.style.display = 'flex'
    titleContainer.style.borderBottom = '1px solid #e0e0e0'
    titleContainer.style.justifyContent = 'space-evenly'
    titleContainer.style.alignItems = 'center'

    const icon = document.createElement('img')
    icon.src = request.icon
    icon.alt = 'Icon'
    icon.style.width = '2em'
    icon.style.height = '2em'
    icon.style.margin = '10px'
    icon.style.position = 'relative'

    const titleText = document.createElement('div')
    titleText.style.display = 'flex'
    titleText.style.flexDirection = 'column'

    const title = document.createElement('div')
    title.style.fontSize = '1em'
    title.style.fontWeight = 'bold'
    title.style.margin = '0px'
    title.innerText = truncateTitle(request.title)
    title.style.position = 'relative'

    const urlText = document.createElement('div')
    urlText.style.fontSize = '12px'
    urlText.style.margin = '0px'
    urlText.innerText = truncateUrl(request.url)
    urlText.style.position = 'relative'
    urlText.title = request.url

    const deleteLink = document.createElement('img')
    deleteLink.src = chrome.runtime.getURL('delete.png')
    deleteLink.alt = 'Delete Link'
    deleteLink.style.width = '1em'
    deleteLink.style.height = '1em'
    deleteLink.style.position = 'relative'
    deleteLink.style.margin = '10px'
    deleteLink.style.cursor = 'pointer'
    deleteLink.addEventListener('click', () => {
        titleContainer.remove()
    })

    titleText.appendChild(title)
    titleText.appendChild(urlText)
    titleContainer.appendChild(icon)
    titleContainer.appendChild(titleText)
    titleContainer.appendChild(deleteLink)

    const wordCounter = document.createElement('div')
    let addNoteWordCount = 0
    let totalWordCount
    // Create the text area element
    const textArea = document.createElement('textarea')
    textArea.style.width = '25em'
    textArea.rows = 1
    textArea.placeholder = 'Take a note...'
    textArea.style.resize = 'none'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.padding = '10px'
    textArea.style.fontFamily = 'Arial'
    textArea.style.borderRadius = '1.5em'

    textArea.setAttribute('spellcheck', false)
    textArea.addEventListener('input', function () {
        // Get the input value
        var addedNote = textArea.value
        addNoteWordCount = countWords(addedNote)
        let totalWordCount = highlightedWordCount + addNoteWordCount

        wordCounter.textContent = `${totalWordCount} / 1000`
    })
    //total characters allowed
    let averageWordCharLength = 5
    let maxCharLength = 1000 * averageWordCharLength

    //getting total characters of highlighted text
    let highlightedWordCount = countWords(request.pageText) || 0
    let highlightedWordCharCount = highlightedWordCount * averageWordCharLength
    let remainingCharLength = maxCharLength - highlightedWordCharCount
    console.log('remainingCharLength', remainingCharLength)
    textArea.setAttribute('maxlength', remainingCharLength)

    function autoGrow(textarea) {
        const maxHeight = 100
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'

        if (parseInt(getComputedStyle(textarea).height) > maxHeight) {
            textarea.style.overflowY = 'scroll'
            textarea.style.height = maxHeight + 'px'
        } else {
            textarea.style.overflowY = 'hidden'
        }
    }
    textArea.addEventListener('input', function () {
        autoGrow(this)
    })

    const highlightedText = document.createElement('div')
    highlightedText.id = 'highlightedText'
    highlightedText.style.display = 'flex'
    highlightedText.style.justifySelf = 'center'
    highlightedText.style.alignSelf = 'center'
    highlightedText.style.width = '25em'
    highlightedText.style.textDecoration = 'italic'
    highlightedText.style.height = '3.5em'
    highlightedText.style.fontFamily = 'Arial'
    highlightedText.style.fontSize = '.7em'
    highlightedText.style.color = 'rgba(140, 140, 140, 0.8)'
    highlightedText.textContent = `"${tuncateTextStartEnd(
        removeBracketsFromString(request.pageText)
    )}"`
    highlightedText.style.margin = '10px'
    highlightedText.style.overflowY = 'hidden'
    highlightedText.style.overflowX = 'hidden'

    wordCounter.id = 'wordCounter'
    wordCounter.style.display = 'flex'
    wordCounter.style.justifyContent = 'center'
    wordCounter.style.alignItems = 'center'
    wordCounter.style.fontWeight = 'bold'
    wordCounter.style.fontFamily = 'Arial'
    wordCounter.style.fontSize = '1.5em'
    wordCounter.style.color = 'black'
    wordCounter.style.backgroundColor = 'lightgrey'
    wordCounter.style.borderRadius = '3em'
    wordCounter.style.padding = '5px'
    wordCounter.textContent = `${countWords(request.pageText)} / 1000`

    const tagDiv = document.createElement('div')
    tagDiv.style.display = 'flex'
    tagDiv.style.flexDirection = 'row'
    tagDiv.style.alignItems = 'center'
    tagDiv.style.justifyContent = 'end'

    const tagIcon = document.createElement('img')
    tagIcon.src = chrome.runtime.getURL('tag.png')
    tagIcon.alt = 'Tag Icon'
    tagIcon.style.width = '2.5em'
    tagIcon.style.height = '2.5em'
    tagIcon.style.position = 'relative'
    tagIcon.style.cursor = 'pointer'

    tagDiv.appendChild(tagIcon)
    tagDiv.appendChild(wordCounter)

    const footer = document.createElement('div')
    footer.style.display = 'flex'
    footer.style.justifyContent = 'flex-end'
    footer.style.backgroundColor = 'rgba(237, 237, 237)'
    footer.style.height = '3.5em'
    footer.style.bottom = '0'
    footer.style.borderBottomLeftRadius = '1.5em'
    footer.style.borderBottomRightRadius = '1.5em'

    const StudyModeRedirect = document.createElement('button')
    StudyModeRedirect.style.backgroundColor = 'transparent'
    StudyModeRedirect.style.border = 'none'
    StudyModeRedirect.style.color = 'rgba(59,130,246)'
    StudyModeRedirect.style.left = '0'
    StudyModeRedirect.style.textAlign = 'center'
    StudyModeRedirect.style.fontWeight = 'bold'
    StudyModeRedirect.style.display = 'inline-block'
    StudyModeRedirect.style.fontSize = '20px'
    StudyModeRedirect.style.margin = '0px'
    StudyModeRedirect.style.cursor = 'pointer'
    StudyModeRedirect.innerText = 'studymode'
    StudyModeRedirect.style.marginRight = 'auto'

    StudyModeRedirect.addEventListener('click', () => {
        chrome.runtime.sendMessage({ message: 'openStudyMode' })
    })

    StudyModeRedirect.className = 'tooltip'

    const saveButton = document.createElement('button')
    saveButton.style.backgroundColor = 'transparent'
    saveButton.style.border = 'none'
    saveButton.style.color = 'white'
    saveButton.style.textAlign = 'center'
    saveButton.style.fontWeight = 'bold'
    saveButton.style.display = 'inline-block'
    saveButton.style.fontSize = '1em'
    saveButton.style.margin = '0px'
    saveButton.style.cursor = 'pointer'
    saveButton.innerText = 'Save Note'
    saveButton.style.backgroundColor = 'rgba(59,130,246)'
    saveButton.style.borderRadius = '1.5em'
    saveButton.style.transition = 'background-color 0.3s ease' // Set transition property to animate the background color change
    saveButton.addEventListener('mouseover', () => {
        saveButton.style.backgroundColor = 'rgba(37, 99, 235)'
    })
    saveButton.addEventListener('mouseleave', () => {
        saveButton.style.backgroundColor = 'rgba(59,130,246)'
    })
    saveButton.addEventListener('click', function () {
        var notes = document.getElementById('notes').value
        chrome.runtime.sendMessage({ type: 'saveNotes', notes: notes })
    })
    function saveNotesToLocal(notes) {
        // Convert the notes object to a string
        var notesString = JSON.stringify(notes)

        // Save the notes to local storage
        localStorage.setItem('notes', notesString)
    }
    // Get the save button element

    // Add an event listener to the save button

    // saveButton.addEventListener('mouseout', () => {
    //     cancelButton.style.backgroundColor = 'gray'
    // })

    const cancelButton = document.createElement('button')
    cancelButton.style.border = 'none'
    cancelButton.style.color = 'grey'
    cancelButton.style.textAlign = 'center'
    cancelButton.style.fontWeight = 'bold'
    cancelButton.style.display = 'inline-block'
    cancelButton.style.fontSize = '.75em'
    cancelButton.style.cursor = 'pointer'
    cancelButton.innerText = 'Cancel'
    cancelButton.style.fontFamily = 'sans-serif'
    container.style.borderRadius = '1.5em'

    cancelButton.style.transition = 'background-color 0.3s ease' // Set transition property to animate the background color change
    cancelButton.addEventListener('mouseover', () => {
        cancelButton.style.backgroundColor = 'lightgray'
        cancelButton.style.opacity = '.3'
    })

    // cancelButton.addEventListener('mouseout', () => {
    //     cancelButton.style.backgroundColor = 'gray'
    // })

    cancelButton.addEventListener('click', () => {
        container.remove()
    })

    footer.appendChild(StudyModeRedirect)
    footer.appendChild(cancelButton)
    footer.appendChild(saveButton)

    // Add the text area to the container

    container.appendChild(titleContainer)
    container.appendChild(textArea)
    if (request.pageText) {
        container.appendChild(highlightedText)
    }
    container.appendChild(tagDiv)
    container.appendChild(footer)

    // Add the div to the page
    document.body.appendChild(container)
    textArea.focus()
})

//fade function - deprecated
// function fade(el, fadeInDuration, fadeOutDuration, pauseDuration, callback) {
//     var direction = 'in'
//     var last = +new Date()
//     var duration = fadeInDuration

//     var tick = function () {
//         el.style.opacity =
//             direction === 'in'
//                 ? +el.style.opacity + (new Date() - last) / duration
//                 : +el.style.opacity - (new Date() - last) / duration
//         last = +new Date()

//         if (
//             (direction === 'in' && +el.style.opacity < 1) ||
//             (direction === 'out' && +el.style.opacity > 0)
//         ) {
//             ;(window.requestAnimationFrame && requestAnimationFrame(tick)) ||
//                 setTimeout(tick, 16)
//         } else {
//             if (direction === 'in') {
//                 setTimeout(function () {
//                     direction = 'out'
//                     last = +new Date()
//                     duration = fadeOutDuration
//                     ;(window.requestAnimationFrame &&
//                         requestAnimationFrame(tick)) ||
//                         setTimeout(tick, 16)
//                 }, pauseDuration)
//             } else if (typeof callback === 'function') {
//                 callback()
//             }
//         }
//     }

//     tick()
// }
