let options = {
  'STRIP_IMAGE_SUFFIX': 'isfalse'
};

function printException(tooiException) {
  console.log('tooitd: ' + tooiException);
}

function updateOptions() {
  chrome.runtime.sendMessage({
      method: 'GET_LOCAL_STORAGE',
      key: 'STRIP_IMAGE_SUFFIX'
    },
    function (response) {
      options['STRIP_IMAGE_SUFFIX'] = response.data;
    }
  );
}
updateOptions();

document.addEventListener('keydown', function (e) {
  updateOptions();

  if (options['STRIP_IMAGE_SUFFIX'] != 'isfalse' &&
    e.key == 's' &&
    (e.ctrlKey || e.metaKey) &&
    window.location.href.match(/https:\/\/pbs\.twimg\.com\/media\/[^.]+\.(jpg|png)(|:[a-z]+)$/)) {
    e.preventDefault();
    var a = document.createElement('a');
    var imgSrc = document.querySelector('img').src;
    var matcher = /https:\/\/pbs\.twimg\.com\/media\/([^.]+)(\.[^:]+)(|:)([a-z]*)$/;
    var imageName = imgSrc.replace(matcher, '$1');
    var imageSuffix = imgSrc.replace(matcher, '$2');
    var imageSize = imgSrc.replace(matcher, '$4');
    if (imageSize != '') {
      imageSize = '-' + imageSize;
    }
    a.href = window.location.href;
    a.setAttribute('download', imageName + imageSize + imageSuffix);
    a.dispatchEvent(new MouseEvent('click'));
  }
});