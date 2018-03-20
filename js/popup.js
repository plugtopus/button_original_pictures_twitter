let options = ['SHOW_ON_TWEET_DETAIL',
  'SHOW_ON_TIMELINE',
  'OPEN_WITH_KEY_PRESS',
  'SHOW_ON_TWEETDECK_TIMELINE',
  'SHOW_ON_TWEETDECK_TWEET_DETAIL',
  'STRIP_IMAGE_SUFFIX'
]

options.map((v, i) => {
  document.getElementsByClassName(v)[0].checked = (localStorage[v] != 'isfalse')
})

document.getElementById('save').addEventListener('click', (e) => {
  options.map((v, i) => {
    localStorage[v] = `is${document.getElementsByClassName(v)[0].checked.toString()}`
  })
  chrome.tabs.query({}, (result) => {
    result.map((v, i) => {
      chrome.tabs.sendMessage(v.id, {
        method: 'OPTION_UPDATED'
      }, null, (response) => {
      })
    })
  })
})