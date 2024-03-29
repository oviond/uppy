function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
import { h } from 'preact';
import { UIPlugin } from '@uppy/core';
import getFileTypeExtension from '@uppy/utils/lib/getFileTypeExtension';
import supportsMediaRecorder from "./supportsMediaRecorder.js";
import RecordingScreen from "./RecordingScreen.js";
import PermissionsScreen from "./PermissionsScreen.js";
import locale from "./locale.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore We don't want TS to generate types for the package.json
const packageJson = {
  "version": "1.1.7"
};
var _stream = /*#__PURE__*/_classPrivateFieldLooseKey("stream");
var _audioActive = /*#__PURE__*/_classPrivateFieldLooseKey("audioActive");
var _recordingChunks = /*#__PURE__*/_classPrivateFieldLooseKey("recordingChunks");
var _recorder = /*#__PURE__*/_classPrivateFieldLooseKey("recorder");
var _capturedMediaFile = /*#__PURE__*/_classPrivateFieldLooseKey("capturedMediaFile");
var _mediaDevices = /*#__PURE__*/_classPrivateFieldLooseKey("mediaDevices");
var _supportsUserMedia = /*#__PURE__*/_classPrivateFieldLooseKey("supportsUserMedia");
var _hasAudioCheck = /*#__PURE__*/_classPrivateFieldLooseKey("hasAudioCheck");
var _start = /*#__PURE__*/_classPrivateFieldLooseKey("start");
var _startRecording = /*#__PURE__*/_classPrivateFieldLooseKey("startRecording");
var _stopRecording = /*#__PURE__*/_classPrivateFieldLooseKey("stopRecording");
var _discardRecordedAudio = /*#__PURE__*/_classPrivateFieldLooseKey("discardRecordedAudio");
var _submit = /*#__PURE__*/_classPrivateFieldLooseKey("submit");
var _stop = /*#__PURE__*/_classPrivateFieldLooseKey("stop");
var _getAudio = /*#__PURE__*/_classPrivateFieldLooseKey("getAudio");
var _changeSource = /*#__PURE__*/_classPrivateFieldLooseKey("changeSource");
var _updateSources = /*#__PURE__*/_classPrivateFieldLooseKey("updateSources");
/**
 * Audio recording plugin
 */
export default class Audio extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    Object.defineProperty(this, _getAudio, {
      value: _getAudio2
    });
    Object.defineProperty(this, _hasAudioCheck, {
      value: _hasAudioCheck2
    });
    Object.defineProperty(this, _stream, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _audioActive, {
      writable: true,
      value: false
    });
    Object.defineProperty(this, _recordingChunks, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _recorder, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _capturedMediaFile, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _mediaDevices, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _supportsUserMedia, {
      writable: true,
      value: void 0
    });
    // eslint-disable-next-line consistent-return
    Object.defineProperty(this, _start, {
      writable: true,
      value: options => {
        if (!_classPrivateFieldLooseBase(this, _supportsUserMedia)[_supportsUserMedia]) {
          return Promise.reject(new Error('Microphone access not supported'));
        }
        _classPrivateFieldLooseBase(this, _audioActive)[_audioActive] = true;
        _classPrivateFieldLooseBase(this, _hasAudioCheck)[_hasAudioCheck]().then(hasAudio => {
          this.setPluginState({
            hasAudio
          });

          // ask user for access to their camera
          return _classPrivateFieldLooseBase(this, _mediaDevices)[_mediaDevices].getUserMedia({
            audio: true
          }).then(stream => {
            _classPrivateFieldLooseBase(this, _stream)[_stream] = stream;
            let currentDeviceId = null;
            const tracks = stream.getAudioTracks();
            if (!(options != null && options.deviceId)) {
              currentDeviceId = tracks[0].getSettings().deviceId;
            } else {
              currentDeviceId = tracks.findLast(track => {
                return track.getSettings().deviceId === options.deviceId;
              });
            }

            // Update the sources now, so we can access the names.
            _classPrivateFieldLooseBase(this, _updateSources)[_updateSources]();
            this.setPluginState({
              currentDeviceId,
              audioReady: true
            });
          }).catch(err => {
            this.setPluginState({
              audioReady: false,
              cameraError: err
            });
            this.uppy.info(err.message, 'error');
          });
        });
      }
    });
    Object.defineProperty(this, _startRecording, {
      writable: true,
      value: () => {
        // only used if supportsMediaRecorder() returned true
        // eslint-disable-next-line compat/compat
        _classPrivateFieldLooseBase(this, _recorder)[_recorder] = new MediaRecorder(_classPrivateFieldLooseBase(this, _stream)[_stream]);
        _classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks] = [];
        let stoppingBecauseOfMaxSize = false;
        _classPrivateFieldLooseBase(this, _recorder)[_recorder].addEventListener('dataavailable', event => {
          _classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks].push(event.data);
          const {
            restrictions
          } = this.uppy.opts;
          if (_classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks].length > 1 && restrictions.maxFileSize != null && !stoppingBecauseOfMaxSize) {
            const totalSize = _classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks].reduce((acc, chunk) => acc + chunk.size, 0);
            // Exclude the initial chunk from the average size calculation because it is likely to be a very small outlier
            const averageChunkSize = (totalSize - _classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks][0].size) / (_classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks].length - 1);
            const expectedEndChunkSize = averageChunkSize * 3;
            const maxSize = Math.max(0, restrictions.maxFileSize - expectedEndChunkSize);
            if (totalSize > maxSize) {
              stoppingBecauseOfMaxSize = true;
              this.uppy.info(this.i18n('recordingStoppedMaxSize'), 'warning', 4000);
              _classPrivateFieldLooseBase(this, _stopRecording)[_stopRecording]();
            }
          }
        });

        // use a "time slice" of 500ms: ondataavailable will be called each 500ms
        // smaller time slices mean we can more accurately check the max file size restriction
        _classPrivateFieldLooseBase(this, _recorder)[_recorder].start(500);

        // Start the recordingLengthTimer if we are showing the recording length.
        // TODO: switch this to a private field
        this.recordingLengthTimer = setInterval(() => {
          const currentRecordingLength = this.getPluginState().recordingLengthSeconds;
          this.setPluginState({
            recordingLengthSeconds: currentRecordingLength + 1
          });
        }, 1000);
        this.setPluginState({
          isRecording: true
        });
      }
    });
    Object.defineProperty(this, _stopRecording, {
      writable: true,
      value: () => {
        const stopped = new Promise(resolve => {
          _classPrivateFieldLooseBase(this, _recorder)[_recorder].addEventListener('stop', () => {
            resolve();
          });
          _classPrivateFieldLooseBase(this, _recorder)[_recorder].stop();
          clearInterval(this.recordingLengthTimer);
          this.setPluginState({
            recordingLengthSeconds: 0
          });
        });
        return stopped.then(() => {
          this.setPluginState({
            isRecording: false
          });
          return _classPrivateFieldLooseBase(this, _getAudio)[_getAudio]();
        }).then(file => {
          try {
            _classPrivateFieldLooseBase(this, _capturedMediaFile)[_capturedMediaFile] = file;
            // create object url for capture result preview
            this.setPluginState({
              recordedAudio: URL.createObjectURL(file.data)
            });
          } catch (err) {
            // Logging the error, exept restrictions, which is handled in Core
            if (!err.isRestriction) {
              this.uppy.log(err);
            }
          }
        }).then(() => {
          _classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks] = null;
          _classPrivateFieldLooseBase(this, _recorder)[_recorder] = null;
        }, error => {
          _classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks] = null;
          _classPrivateFieldLooseBase(this, _recorder)[_recorder] = null;
          throw error;
        });
      }
    });
    Object.defineProperty(this, _discardRecordedAudio, {
      writable: true,
      value: () => {
        this.setPluginState({
          recordedAudio: null
        });
        _classPrivateFieldLooseBase(this, _capturedMediaFile)[_capturedMediaFile] = null;
      }
    });
    Object.defineProperty(this, _submit, {
      writable: true,
      value: () => {
        try {
          if (_classPrivateFieldLooseBase(this, _capturedMediaFile)[_capturedMediaFile]) {
            this.uppy.addFile(_classPrivateFieldLooseBase(this, _capturedMediaFile)[_capturedMediaFile]);
          }
        } catch (err) {
          // Logging the error, exept restrictions, which is handled in Core
          if (!err.isRestriction) {
            this.uppy.log(err, 'warning');
          }
        }
      }
    });
    Object.defineProperty(this, _stop, {
      writable: true,
      value: async () => {
        if (_classPrivateFieldLooseBase(this, _stream)[_stream]) {
          const audioTracks = _classPrivateFieldLooseBase(this, _stream)[_stream].getAudioTracks();
          audioTracks.forEach(track => track.stop());
        }
        if (_classPrivateFieldLooseBase(this, _recorder)[_recorder]) {
          await new Promise(resolve => {
            _classPrivateFieldLooseBase(this, _recorder)[_recorder].addEventListener('stop', resolve, {
              once: true
            });
            _classPrivateFieldLooseBase(this, _recorder)[_recorder].stop();
            clearInterval(this.recordingLengthTimer);
          });
        }
        _classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks] = null;
        _classPrivateFieldLooseBase(this, _recorder)[_recorder] = null;
        _classPrivateFieldLooseBase(this, _audioActive)[_audioActive] = false;
        _classPrivateFieldLooseBase(this, _stream)[_stream] = null;
        this.setPluginState({
          recordedAudio: null,
          isRecording: false,
          recordingLengthSeconds: 0
        });
      }
    });
    Object.defineProperty(this, _changeSource, {
      writable: true,
      value: deviceId => {
        _classPrivateFieldLooseBase(this, _stop)[_stop]();
        _classPrivateFieldLooseBase(this, _start)[_start]({
          deviceId
        });
      }
    });
    Object.defineProperty(this, _updateSources, {
      writable: true,
      value: () => {
        _classPrivateFieldLooseBase(this, _mediaDevices)[_mediaDevices].enumerateDevices().then(devices => {
          this.setPluginState({
            audioSources: devices.filter(device => device.kind === 'audioinput')
          });
        });
      }
    });
    _classPrivateFieldLooseBase(this, _mediaDevices)[_mediaDevices] = navigator.mediaDevices;
    _classPrivateFieldLooseBase(this, _supportsUserMedia)[_supportsUserMedia] = _classPrivateFieldLooseBase(this, _mediaDevices)[_mediaDevices] != null;
    this.id = this.opts.id || 'Audio';
    this.type = 'acquirer';
    this.icon = () => h("svg", {
      className: "uppy-DashboardTab-iconAudio",
      "aria-hidden": "true",
      focusable: "false",
      width: "32px",
      height: "32px",
      viewBox: "0 0 32 32"
    }, h("path", {
      d: "M21.143 12.297c.473 0 .857.383.857.857v2.572c0 3.016-2.24 5.513-5.143 5.931v2.64h2.572a.857.857 0 110 1.714H12.57a.857.857 0 110-1.714h2.572v-2.64C12.24 21.24 10 18.742 10 15.726v-2.572a.857.857 0 111.714 0v2.572A4.29 4.29 0 0016 20.01a4.29 4.29 0 004.286-4.285v-2.572c0-.474.384-.857.857-.857zM16 6.5a3 3 0 013 3v6a3 3 0 01-6 0v-6a3 3 0 013-3z",
      fill: "currentcolor",
      "fill-rule": "nonzero"
    }));
    this.defaultLocale = locale;
    this.opts = {
      ...opts
    };
    this.i18nInit();
    this.title = this.i18n('pluginNameAudio');
    this.setPluginState({
      hasAudio: false,
      audioReady: false,
      cameraError: null,
      recordingLengthSeconds: 0,
      audioSources: [],
      currentDeviceId: null
    });
  }
  render() {
    if (!_classPrivateFieldLooseBase(this, _audioActive)[_audioActive]) {
      _classPrivateFieldLooseBase(this, _start)[_start]();
    }
    const audioState = this.getPluginState();
    if (!audioState.audioReady || !audioState.hasAudio) {
      return h(PermissionsScreen, {
        icon: this.icon,
        i18n: this.i18n,
        hasAudio: audioState.hasAudio
      });
    }
    return h(RecordingScreen
    // eslint-disable-next-line react/jsx-props-no-spreading
    , _extends({}, audioState, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore TODO: remove unused
      audioActive: _classPrivateFieldLooseBase(this, _audioActive)[_audioActive],
      onChangeSource: _classPrivateFieldLooseBase(this, _changeSource)[_changeSource],
      onStartRecording: _classPrivateFieldLooseBase(this, _startRecording)[_startRecording],
      onStopRecording: _classPrivateFieldLooseBase(this, _stopRecording)[_stopRecording],
      onDiscardRecordedAudio: _classPrivateFieldLooseBase(this, _discardRecordedAudio)[_discardRecordedAudio],
      onSubmit: _classPrivateFieldLooseBase(this, _submit)[_submit],
      onStop: _classPrivateFieldLooseBase(this, _stop)[_stop],
      i18n: this.i18n,
      showAudioSourceDropdown: this.opts.showAudioSourceDropdown,
      supportsRecording: supportsMediaRecorder(),
      recording: audioState.isRecording,
      stream: _classPrivateFieldLooseBase(this, _stream)[_stream]
    }));
  }
  install() {
    this.setPluginState({
      audioReady: false,
      recordingLengthSeconds: 0
    });
    const {
      target
    } = this.opts;
    if (target) {
      this.mount(target, this);
    }
    if (_classPrivateFieldLooseBase(this, _mediaDevices)[_mediaDevices]) {
      _classPrivateFieldLooseBase(this, _updateSources)[_updateSources]();
      _classPrivateFieldLooseBase(this, _mediaDevices)[_mediaDevices].ondevicechange = () => {
        _classPrivateFieldLooseBase(this, _updateSources)[_updateSources]();
        if (_classPrivateFieldLooseBase(this, _stream)[_stream]) {
          let restartStream = true;
          const {
            audioSources,
            currentDeviceId
          } = this.getPluginState();
          audioSources.forEach(audioSource => {
            if (currentDeviceId === audioSource.deviceId) {
              restartStream = false;
            }
          });
          if (restartStream) {
            _classPrivateFieldLooseBase(this, _stop)[_stop]();
            _classPrivateFieldLooseBase(this, _start)[_start]();
          }
        }
      };
    }
  }
  uninstall() {
    if (_classPrivateFieldLooseBase(this, _stream)[_stream]) {
      _classPrivateFieldLooseBase(this, _stop)[_stop]();
    }
    this.unmount();
  }
}
function _hasAudioCheck2() {
  if (!_classPrivateFieldLooseBase(this, _mediaDevices)[_mediaDevices]) {
    return Promise.resolve(false);
  }
  return _classPrivateFieldLooseBase(this, _mediaDevices)[_mediaDevices].enumerateDevices().then(devices => {
    return devices.some(device => device.kind === 'audioinput');
  });
}
function _getAudio2() {
  // Sometimes in iOS Safari, Blobs (especially the first Blob in the recordingChunks Array)
  // have empty 'type' attributes (e.g. '') so we need to find a Blob that has a defined 'type'
  // attribute in order to determine the correct MIME type.
  const mimeType = _classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks].find(blob => {
    var _blob$type;
    return ((_blob$type = blob.type) == null ? void 0 : _blob$type.length) > 0;
  }).type;
  const fileExtension = getFileTypeExtension(mimeType);
  if (!fileExtension) {
    return Promise.reject(new Error(`Could not retrieve recording: Unsupported media type "${mimeType}"`));
  }
  const name = `audio-${Date.now()}.${fileExtension}`;
  const blob = new Blob(_classPrivateFieldLooseBase(this, _recordingChunks)[_recordingChunks], {
    type: mimeType
  });
  const file = {
    source: this.id,
    name,
    data: new Blob([blob], {
      type: mimeType
    }),
    type: mimeType
  };
  return Promise.resolve(file);
}
Audio.VERSION = packageJson.version;