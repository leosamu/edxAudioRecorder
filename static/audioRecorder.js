function togglegetusermedia(obj)
{

    var configuration = $("comment",obj.parentNode.parentNode.parentNode)[0];
    if (recording === false && objrec==null){
        objrec=obj
        obj.src = configuration.getAttribute("imgStop");
        recording=true;
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;
    } else if (recording == true && objrec == obj) {
        // we stop recording
        obj.src = configuration.getAttribute("imgrec");
        objrec=null;
        recording = false;

        // we flat the left and right channels down
        var leftBuffer = mergeBuffers ( leftchannel, recordingLength );
        var rightBuffer = mergeBuffers ( rightchannel, recordingLength );
        // we interleave both channels together
        var interleaved = interleave ( leftBuffer, rightBuffer );

        // we create our wav file
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        var view = new DataView(buffer);

        // RIFF chunk descriptor
        writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + interleaved.length * 2, true);
        writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        // stereo (2 channels)
        view.setUint16(22, 2, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);
        // data sub-chunk
        writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);

        // write the PCM samples Comment Ã§a va ?
        var lng = interleaved.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++){
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

        // our final binary blob
        var blob = new Blob ( [ view ], { type : 'audio/wav' } );

        // let's save it locally

        var url = (window.URL || window.webkitURL).createObjectURL(blob);
        var player =  $(".record",obj.parentNode.parentNode.parentNode)[0];
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.overrideMimeType('audio/wav');
        xhr.onreadystatechange = function () {
            console.log(xhr);
            if (xhr.readyState === 4 && xhr.status == 200) {
                xhrBlobUrl = window.URL.createObjectURL(xhr.response);
                player.src = xhrBlobUrl;
            }
        };
        xhr.send();        
    }
}


function handleFileSelect(obj) {
    var files = obj.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

      // Only process image files.
      if (!f.type.match('video.*')) {
        continue;
      }

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        var blob = new Blob ( [ theFile ], { type : 'video/quicktime' } );
        var url = (window.URL || window.webkitURL).createObjectURL(blob);
        var player =  $(".record",obj.parentNode.parentNode.parentNode)[0];
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.overrideMimeType('video/quicktime');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status == 200) {
                xhrBlobUrl = window.URL.createObjectURL(xhr.response);
                player.src = xhrBlobUrl;
            }
        };

        return function(e) {
          // Render thumbnail.
           xhr.send();

        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }
  }

function toggleios(obj)
{
    var ifile = $("input",obj.parentNode.parentNode.parentNode)[0];
    ifile.click();
}

function toggleRecord(obj){
    if (getusermedia)
    {
        togglegetusermedia(obj);
    }else
    {
        toggleios(obj);
    }
}
// when key is down

function interleave(leftChannel, rightChannel){
  var length = leftChannel.length + rightChannel.length;
  var result = new Float32Array(length);

  var inputIndex = 0;

  for (var index = 0; index < length; ){
    result[index++] = leftChannel[inputIndex];
    result[index++] = rightChannel[inputIndex];
    inputIndex++;
  }
  return result;
}

function mergeBuffers(channelBuffer, recordingLength){
  var result = new Float32Array(recordingLength);
  var offset = 0;
  var lng = channelBuffer.length;
  for (var i = 0; i < lng; i++){
    var buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

function writeUTFBytes(view, offset, string){
  var lng = string.length;
  for (var i = 0; i < lng; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function success(e){
    if (typeof(init)=="undefined")
        init="inicializado audio buffer";
    else
        return -1;
    // creates the audio context
    audioContext = window.AudioContext || window.webkitAudioContext;
    context = new audioContext();

	// we query the context sample rate (varies depending on platforms)
    sampleRate = context.sampleRate;

    console.log('succcess');

    // creates a gain node
    volume = context.createGain();

    // creates an audio node from the microphone incoming stream
    audioInput = context.createMediaStreamSource(e);

    // connect the stream to the gain node
    audioInput.connect(volume);

    /* From the spec: This value controls how frequently the audioprocess event is
    dispatched and how many sample-frames need to be processed each call.
    Lower values for buffer size will result in a lower (better) latency.
    Higher values will be necessary to avoid audio breakup and glitches */
    var bufferSize = 2048;
    recorder = context.createScriptProcessor(bufferSize, 2, 2);

    recorder.onaudioprocess = function(e){
        if (!recording) return;
        var left = e.inputBuffer.getChannelData (0);
        var right = e.inputBuffer.getChannelData (1);
        // we clone the samples
        leftchannel.push (new Float32Array (left));
        rightchannel.push (new Float32Array (right));
        recordingLength += bufferSize;
        console.log('recording');
    }

    // we connect the recorder
    volume.connect (recorder);
    recorder.connect (context.destination);
}