/* BufferLoader
	
	Boris Smus' BufferLoader (https://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js),
	modifiziert für dieses Projekt:
	
	Anstatt eines eindimensonalen Arrays wird ein Objekt verwendet,
	um mit Key-Value-Pairs arbeiten zu können.
	Der Key wird als Variablenname in der Anwendung verwendet, 
	Value beinhaltet weiterhin die URL.
*/

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Object();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, key) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function () {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function (buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[key] = buffer;
        if (++loader.loadCount == Object.keys(loader.urlList).length) {
          loader.onload(loader.bufferList);
        }
      },
      function (error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function () {
      alert('BufferLoader: XHR error');
  }

    request.send();
}

BufferLoader.prototype.load = function () {
  for (key in this.urlList) {
    this.loadBuffer(this.urlList[key], key);
  }
}
