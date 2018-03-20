let options = {
  'SHOW_ON_TIMELINE': 'isfalse',
  'SHOW_ON_TWEET_DETAIL': 'isfalse',
  'OPEN_WITH_KEY_PRESS': 'isfalse'
}

let target = document.getElementsByTagName('html')[0]
let observer = new MutationObserver(doTask)
let config = {
  childList: true,
  subtree: true
}
observer.observe(target, config)

updateOptions()
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.method) {
      case 'OPTION_UPDATED':
        updateOptions()
        sendResponse({
          data: 'done'
        })
        break
      default:
        sendResponse({
          data: 'yet'
        })
        break
    }
  }
)

function printException(tooiException) {
  console.log('tooi: ' + tooiException)
}
document.addEventListener('keydown', function (e) {
  if (e.key == 'Enter' &&
    !(e.ctrlKey) && !(e.metaKey) && !(e.altKey) && !(e.shiftKey)) {
    if ((options['OPEN_WITH_KEY_PRESS'] != 'isfalse') &&
      !(document.activeElement.className.match(/rich-editor/))) {
      openFromTweetDetail(e)
    }
  }
})

function updateOptions() {
  for (let key in options) {
    (function (k) {
      chrome.runtime.sendMessage({
          method: 'GET_LOCAL_STORAGE',
          key: k
        },
        function (response) {
          options[k] = response.data
          doTask()
        }
      )
    })(key)
  }
}

function doTask() {
  if (options['SHOW_ON_TIMELINE'] != 'isfalse') {
    setButtonOnTimeline()
  }
  if (options['SHOW_ON_TWEET_DETAIL'] != 'isfalse') {
    setButtonOnTweetDetail()
  }
} // doTask end

function setButtonOnTimeline() {
  if (document.getElementsByClassName('js-stream-tweet').length != 0) {
    Array.from(document.getElementsByClassName('js-stream-tweet'))
      .map((tweet, i) => {
        if (!!(tweet.getElementsByClassName('AdaptiveMedia-container')[0]) &&
          !!(tweet.getElementsByClassName('AdaptiveMedia-container')[0].getElementsByTagName('img')[0]) &&
          !(tweet.getElementsByClassName('tooiDivTimeline')[0])) {
          let actionList,
            parentDiv,
            origButton
          actionList = tweet.getElementsByClassName('ProfileTweet-actionList')[0]
          parentDiv = document.createElement('div')
          parentDiv.className = 'ProfileTweet-action tooiDivTimeline'
          actionList.appendChild(parentDiv)
          origButton = document.createElement('input')
          tweet.getElementsByClassName('tooiDivTimeline')[0].appendChild(origButton)
          origButton.type = 'button'
          origButton.value = 'Открыть'
          origButton.style.width = '70px'
          origButton.style.fontSize = '13px'
          origButton.addEventListener('click', openFromTimeline)
        }
      })
  }
}

function setButtonOnTweetDetail() {
  if (!document.getElementById('tooiInputDetailpage')) {
    if (!!(document.getElementsByClassName('permalink-tweet-container')[0]) &&
      !!(document.getElementsByClassName('permalink-tweet-container')[0].getElementsByClassName('AdaptiveMedia-photoContainer')[0])) {
      let actionList,
        parentDiv,
        origButton
      actionList = document.getElementsByClassName('permalink-tweet-container')[0].getElementsByClassName('ProfileTweet-actionList')[0]
      parentDiv = document.createElement('div')
      parentDiv.id = 'tooiDivDetailpage'
      parentDiv.className = 'ProfileTweet-action'
      actionList.appendChild(parentDiv)
      origButton = document.createElement('input')
      document.getElementById('tooiDivDetailpage').appendChild(origButton)
      origButton.id = 'tooiInputDetailpage'
      origButton.type = 'button'
      origButton.value = 'Original'
      origButton.style.width = '70px'
      origButton.style.fontSize = '13px'
      origButton.addEventListener('click', openFromTweetDetail)
    }
  }
}

function openFromTimeline(e) {
  if (this.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('AdaptiveMedia-container')[0]) {
    e.preventDefault()
    e.stopPropagation()
    openImagesInNewTab(
      this.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('AdaptiveMedia-photoContainer')
    )
  } else {
    printException('CANT_FIND_IMAGE_ELEMENT_ON_TIMELINE')
  }
}

function openFromTweetDetail(e) {
  if (!!(document.getElementsByClassName('permalink-tweet-container')[0])) {
    e.preventDefault()
    e.stopPropagation()
    openImagesInNewTab(
      document.getElementsByClassName('permalink-tweet-container')[0].getElementsByClassName('AdaptiveMedia-photoContainer')
    )
  } else {
    printException('CANT_FIND_TWEET_DETAIL_ELEMENT')
  }
}

function openImagesInNewTab(tag) {
  Array.from(tag).reverse().map((v, i) => {
    let imgurl = v.getElementsByTagName('img')[0].src
    if (!!imgurl) {
      window.open(imgurl.replace(/(\.\w+)(|:\w+)$/, '$1:orig'))
    } else {
      printException('CANT_FIND_IMAGE_URL')
    }
  })
}