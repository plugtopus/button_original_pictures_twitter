let options = {
  'SHOW_ON_TWEETDECK_TIMELINE': 'isfalse',
  'SHOW_ON_TWEETDECK_TWEET_DETAIL': 'isfalse',
}

let target = document.getElementsByTagName('html')[0]
let observer = new MutationObserver(doTask)
let config = {childList: true, subtree: true}
observer.observe(target, config)

updateOptions()
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.method) {
      case 'OPTION_UPDATED':
        updateOptions()
        sendResponse({data: 'done'})
        break
      default:
        sendResponse({data: 'yet'})
        break
    }
  }
)

function printException(tooiException) {
  console.log('tooitd: ' + tooiException)
}

function updateOptions() {
  Object.keys(options).map((key, i) => {
    (function(k) {
      chrome.runtime.sendMessage({method: 'GET_LOCAL_STORAGE', key: k},
        function(response) {
          options[k] = response.data
          doTask()
        }
      )
    })(key)
  })
}

function doTask() {
  if(options['SHOW_ON_TWEETDECK_TIMELINE'] != 'isfalse') {
    setButtonOnTweetdeckTimeline()
  }
  if(options['SHOW_ON_TWEETDECK_TWEET_DETAIL'] != 'isfalse') {
    setButtonOnTweetdeckTweetDetail()
  }
}

function setStyle(e, attrs) {
  Object.keys(attrs).map((key, i) => {
    e.style[key] = attrs[key]
  })
}

function setButtonOnTweetdeckTimeline() {
  if(document.getElementsByClassName('js-stream-item is-actionable').length != 0) {
    Array.from(document.getElementsByClassName('js-stream-item is-actionable'))
      .map((tweet, i) => {
      if(!!(tweet.getElementsByClassName('js-media-image-link')[0])
       && !(tweet.getElementsByClassName('is-video')[0])
       && !(tweet.getElementsByClassName('is-gif')[0])
       && !(tweet.getElementsByClassName('tooiATweetdeckTimeline')[0])) {
        let origButton = document.createElement('a')
        tweet.getElementsByTagName('footer')[0].appendChild(origButton)
        origButton.className = 'pull-left margin-txs txt-mute tooiATweetdeckTimeline'
        let borderColor = document.defaultView.getComputedStyle(origButton, '').color
        setStyle(origButton,
          {border: `1px solid ${borderColor}`,
          borderRadius: '2px',
          fontSize: '0.75em',
          marginLeft: '3px',
          lineHeight: '1.5em',
          paddingRight: '1px'})
        origButton.insertAdjacentHTML('beforeend', 'Original')
        origButton.addEventListener('click', openFromTweetdeckTimeline)
      }
    })
  }
}

function setButtonOnTweetdeckTweetDetail() {
  if(document.getElementsByClassName('js-tweet-detail').length != 0) {
    Array.from(document.getElementsByClassName('js-tweet-detail'))
      .map((tweet, i) => {
      if( ((tweet.getElementsByClassName('media-img').length != 0) || (tweet.getElementsByClassName('media-image').length != 0))
        && !(tweet.getElementsByClassName('tooiATweetdeckDetail')[0]) ) {
        let origButton = document.createElement('a')
        let footer = tweet.getElementsByTagName('footer')[0]
        footer.parentNode.insertBefore(origButton, footer)
        origButton.className = 'txt-mute tooiATweetdeckDetail'
        let borderColor = document.defaultView.getComputedStyle(origButton, '').color
        setStyle(origButton,
          {
            border: `1px solid ${borderColor}`,
            borderRadius: '2px',
            fontSize: '0.75em',
            marginTop: '5px',
            padding: '2px 2px 2px 0',
            cursor: 'pointer'
          })
        origButton.insertAdjacentHTML('beforeend', 'Original')
        origButton.addEventListener('click', openFromTweetdeckTweetDetail)
      }
    })
  }
}

function openFromTweetdeckTimeline(e) {
  e.preventDefault()
  e.stopPropagation()
  if(this.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('js-media')) {
    openImagesInNewTab(
      Array.from(this.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('js-media-image-link'))
        .map(v => {return v.style.backgroundImage})
    )
  }
  else {
    printException('CANT_FIND_IMAGE_ELEMENT_ON_TWEETDECK_TIMELINE')
  }
}

function openFromTweetdeckTweetDetail(e) {
  e.preventDefault()
  e.stopPropagation()
  if(this.parentNode.parentNode.getElementsByClassName('media-img').length != 0) {
    openImagesInNewTab(
      [this.parentNode.parentNode.getElementsByClassName('media-img')[0].src]
    )
  }
  else if(this.parentNode.parentNode.getElementsByClassName('js-media-image-link').length != 0) {
    openImagesInNewTab(
      Array.from(this.parentNode.parentNode.getElementsByClassName('js-media-image-link'))
        .map(v => {return v.style.backgroundImage})
    )
  }
  else {
    printException('CANT_FIND_IMAGE_ELEMENT_ON_TWEETDECK_TWEET_DETAIL')
  }
}

function openImagesInNewTab(imgurls) {
  Array.from(imgurls).reverse().map(imgurl => {
    if(!!imgurl) {
      window.open(imgurl.replace(/^[^(]+\(\"(https:[^:]+)(|:[^:]+)\"\)$/, '$1:orig'))
    }
    else {
      printException('CANT_FIND_IMAGE_URL')
    }
  })
}
