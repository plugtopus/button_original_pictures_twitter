chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == 'GET_LOCAL_STORAGE') {
    sendResponse({
      data: localStorage[request.key]
    });
  } else {
    sendResponse({
      data: 'none'
    });
  }
});