function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
import { h } from 'preact';
import { UIPlugin } from '@uppy/core';
import getFileTypeExtension from '@uppy/utils/lib/getFileTypeExtension';
import mimeTypes from '@uppy/utils/lib/mimeTypes';
import isMobile from 'is-mobile';
import canvasToBlob from '@uppy/utils/lib/canvasToBlob';
import supportsMediaRecorder from './supportsMediaRecorder.js';
import CameraIcon from "./CameraIcon.js";
import CameraScreen from "./CameraScreen.js";
import PermissionsScreen from "./PermissionsScreen.js";
const packageJson = {
  "version": "3.3.6"
};
import locale from './locale.js';

/**
 * Normalize a MIME type or file extension into a MIME type.
 *
 * @param {string} fileType - MIME type or a file extension prefixed with `.`.
 * @returns {string|undefined} The MIME type or `undefined` if the fileType is an extension and is not known.
 */
function toMimeType(fileType) {
  if (fileType[0] === '.') {
    return mimeTypes[fileType.slice(1)];
  }
  return fileType;
}

/**
 * Is this MIME type a video?
 *
 * @param {string} mimeType - MIME type.
 * @returns {boolean}
 */
function isVideoMimeType(mimeType) {
  return /^video\/[^*]+$/.test(mimeType);
}

/**
 * Is this MIME type an image?
 *
 * @param {string} mimeType - MIME type.
 * @returns {boolean}
 */
function isImageMimeType(mimeType) {
  return /^image\/[^*]+$/.test(mimeType);
}
function getMediaDevices() {
  // bug in the compatibility data
  // eslint-disable-next-line compat/compat
  return navigator.mediaDevices;
}
function isModeAvailable(modes, mode) {
  return modes.includes(mode);
}

/**
 * Webcam
 */
var _enableMirror = /*#__PURE__*/_classPrivateFieldLooseKey("enableMirror");
export default class Webcam extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    // enableMirror is used to toggle mirroring, for instance when discarding the video,
    // while `opts.mirror` is used to remember the initial user setting
    Object.defineProperty(this, _enableMirror, {
      writable: true,
      value: void 0
    });
    this.mediaDevices = getMediaDevices();
    this.supportsUserMedia = !!this.mediaDevices;
    // eslint-disable-next-line no-restricted-globals
    this.protocol = location.protocol.match(/https/i) ? 'https' : 'http';
    this.id = this.opts.id || 'Webcam';
    this.type = 'acquirer';
    this.capturedMediaFile = null;
    this.icon = () => h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      width: "32",
      height: "32",
      viewBox: "0 0 32 32"
    }, h("path", {
      d: "M23.5 9.5c1.417 0 2.5 1.083 2.5 2.5v9.167c0 1.416-1.083 2.5-2.5 2.5h-15c-1.417 0-2.5-1.084-2.5-2.5V12c0-1.417 1.083-2.5 2.5-2.5h2.917l1.416-2.167C13 7.167 13.25 7 13.5 7h5c.25 0 .5.167.667.333L20.583 9.5H23.5zM16 11.417a4.706 4.706 0 00-4.75 4.75 4.704 4.704 0 004.75 4.75 4.703 4.703 0 004.75-4.75c0-2.663-2.09-4.75-4.75-4.75zm0 7.825c-1.744 0-3.076-1.332-3.076-3.074 0-1.745 1.333-3.077 3.076-3.077 1.744 0 3.074 1.333 3.074 3.076s-1.33 3.075-3.074 3.075z",
      fill: "#02B383",
      fillRule: "nonzero"
    }));
    this.defaultLocale = locale;

    // set default options
    const defaultOptions = {
      onBeforeSnapshot: () => Promise.resolve(),
      countdown: false,
      modes: ['video-audio', 'video-only', 'audio-only', 'picture'],
      mirror: true,
      showVideoSourceDropdown: false,
      facingMode: 'user',
      // @TODO: remove in the next major
      videoConstraints: undefined,
      preferredImageMimeType: null,
      preferredVideoMimeType: null,
      showRecordingLength: false,
      mobileNativeCamera: isMobile({
        tablet: true
      })
    };
    this.opts = {
      ...defaultOptions,
      ...opts
    };
    this.i18nInit();
    this.title = this.i18n('pluginNameCamera');
    _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror] = this.opts.mirror;
    this.install = this.install.bind(this);
    this.setPluginState = this.setPluginState.bind(this);
    this.render = this.render.bind(this);

    // Camera controls
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.takeSnapshot = this.takeSnapshot.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.discardRecordedVideo = this.discardRecordedVideo.bind(this);
    this.submit = this.submit.bind(this);
    this.oneTwoThreeSmile = this.oneTwoThreeSmile.bind(this);
    this.focus = this.focus.bind(this);
    this.changeVideoSource = this.changeVideoSource.bind(this);
    this.webcamActive = false;
    if (this.opts.countdown) {
      this.opts.onBeforeSnapshot = this.oneTwoThreeSmile;
    }
    this.setPluginState({
      hasCamera: false,
      cameraReady: false,
      cameraError: null,
      recordingLengthSeconds: 0,
      videoSources: [],
      currentDeviceId: null
    });
  }
  setOptions(newOpts) {
    super.setOptions({
      ...newOpts,
      videoConstraints: {
        // May be undefined but ... handles that
        ...this.opts.videoConstraints,
        ...(newOpts == null ? void 0 : newOpts.videoConstraints)
      }
    });
  }
  hasCameraCheck() {
    if (!this.mediaDevices) {
      return Promise.resolve(false);
    }
    return this.mediaDevices.enumerateDevices().then(devices => {
      return devices.some(device => device.kind === 'videoinput');
    });
  }
  isAudioOnly() {
    return this.opts.modes.length === 1 && this.opts.modes[0] === 'audio-only';
  }
  getConstraints(deviceId) {
    if (deviceId === void 0) {
      deviceId = null;
    }
    const acceptsAudio = this.opts.modes.indexOf('video-audio') !== -1 || this.opts.modes.indexOf('audio-only') !== -1;
    const acceptsVideo = !this.isAudioOnly() && (this.opts.modes.indexOf('video-audio') !== -1 || this.opts.modes.indexOf('video-only') !== -1 || this.opts.modes.indexOf('picture') !== -1);
    const videoConstraints = {
      ...(this.opts.videoConstraints || {
        facingMode: this.opts.facingMode
      }),
      // facingMode takes precedence over deviceId, and not needed
      // when specific device is selected
      ...(deviceId ? {
        deviceId,
        facingMode: null
      } : {})
    };
    return {
      audio: acceptsAudio,
      video: acceptsVideo ? videoConstraints : false
    };
  }

  // eslint-disable-next-line consistent-return
  start(options) {
    if (options === void 0) {
      options = null;
    }
    if (!this.supportsUserMedia) {
      return Promise.reject(new Error('Webcam access not supported'));
    }
    this.webcamActive = true;
    if (this.opts.mirror) {
      _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror] = true;
    }
    const constraints = this.getConstraints(options && options.deviceId ? options.deviceId : null);
    this.hasCameraCheck().then(hasCamera => {
      this.setPluginState({
        hasCamera
      });

      // ask user for access to their camera
      return this.mediaDevices.getUserMedia(constraints).then(stream => {
        this.stream = stream;
        let currentDeviceId = null;
        const tracks = this.isAudioOnly() ? stream.getAudioTracks() : stream.getVideoTracks();
        if (!options || !options.deviceId) {
          currentDeviceId = tracks[0].getSettings().deviceId;
        } else {
          tracks.forEach(track => {
            if (track.getSettings().deviceId === options.deviceId) {
              currentDeviceId = track.getSettings().deviceId;
            }
          });
        }

        // Update the sources now, so we can access the names.
        this.updateVideoSources();
        this.setPluginState({
          currentDeviceId,
          cameraReady: true
        });
      }).catch(err => {
        this.setPluginState({
          cameraReady: false,
          cameraError: err
        });
        this.uppy.info(err.message, 'error');
      });
    });
  }

  /**
   * @returns {object}
   */
  getMediaRecorderOptions() {
    const options = {};

    // Try to use the `opts.preferredVideoMimeType` or one of the `allowedFileTypes` for the recording.
    // If the browser doesn't support it, we'll fall back to the browser default instead.
    // Safari doesn't have the `isTypeSupported` API.
    if (MediaRecorder.isTypeSupported) {
      const {
        restrictions
      } = this.uppy.opts;
      let preferredVideoMimeTypes = [];
      if (this.opts.preferredVideoMimeType) {
        preferredVideoMimeTypes = [this.opts.preferredVideoMimeType];
      } else if (restrictions.allowedFileTypes) {
        preferredVideoMimeTypes = restrictions.allowedFileTypes.map(toMimeType).filter(isVideoMimeType);
      }
      const filterSupportedTypes = candidateType => MediaRecorder.isTypeSupported(candidateType) && getFileTypeExtension(candidateType);
      const acceptableMimeTypes = preferredVideoMimeTypes.filter(filterSupportedTypes);
      if (acceptableMimeTypes.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        options.mimeType = acceptableMimeTypes[0];
      }
    }
    return options;
  }
  startRecording() {
    // only used if supportsMediaRecorder() returned true
    // eslint-disable-next-line compat/compat
    this.recorder = new MediaRecorder(this.stream, this.getMediaRecorderOptions());
    this.recordingChunks = [];
    let stoppingBecauseOfMaxSize = false;
    this.recorder.addEventListener('dataavailable', event => {
      this.recordingChunks.push(event.data);
      const {
        restrictions
      } = this.uppy.opts;
      if (this.recordingChunks.length > 1 && restrictions.maxFileSize != null && !stoppingBecauseOfMaxSize) {
        const totalSize = this.recordingChunks.reduce((acc, chunk) => acc + chunk.size, 0);
        // Exclude the initial chunk from the average size calculation because it is likely to be a very small outlier
        const averageChunkSize = (totalSize - this.recordingChunks[0].size) / (this.recordingChunks.length - 1);
        const expectedEndChunkSize = averageChunkSize * 3;
        const maxSize = Math.max(0, restrictions.maxFileSize - expectedEndChunkSize);
        if (totalSize > maxSize) {
          stoppingBecauseOfMaxSize = true;
          this.uppy.info(this.i18n('recordingStoppedMaxSize'), 'warning', 4000);
          this.stopRecording();
        }
      }
    });

    // use a "time slice" of 500ms: ondataavailable will be called each 500ms
    // smaller time slices mean we can more accurately check the max file size restriction
    this.recorder.start(500);
    if (this.opts.showRecordingLength) {
      // Start the recordingLengthTimer if we are showing the recording length.
      this.recordingLengthTimer = setInterval(() => {
        const currentRecordingLength = this.getPluginState().recordingLengthSeconds;
        this.setPluginState({
          recordingLengthSeconds: currentRecordingLength + 1
        });
      }, 1000);
    }
    this.setPluginState({
      isRecording: true
    });
  }
  stopRecording() {
    const stopped = new Promise(resolve => {
      this.recorder.addEventListener('stop', () => {
        resolve();
      });
      this.recorder.stop();
      if (this.opts.showRecordingLength) {
        // Stop the recordingLengthTimer if we are showing the recording length.
        clearInterval(this.recordingLengthTimer);
        this.setPluginState({
          recordingLengthSeconds: 0
        });
      }
    });
    return stopped.then(() => {
      this.setPluginState({
        isRecording: false
      });
      return this.getVideo();
    }).then(file => {
      try {
        this.capturedMediaFile = file;
        // create object url for capture result preview
        this.setPluginState({
          // eslint-disable-next-line compat/compat
          recordedVideo: URL.createObjectURL(file.data)
        });
        _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror] = false;
      } catch (err) {
        // Logging the error, exept restrictions, which is handled in Core
        if (!err.isRestriction) {
          this.uppy.log(err);
        }
      }
    }).then(() => {
      this.recordingChunks = null;
      this.recorder = null;
    }, error => {
      this.recordingChunks = null;
      this.recorder = null;
      throw error;
    });
  }
  discardRecordedVideo() {
    this.setPluginState({
      recordedVideo: null
    });
    if (this.opts.mirror) {
      _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror] = true;
    }
    this.capturedMediaFile = null;
  }
  submit() {
    try {
      if (this.capturedMediaFile) {
        this.uppy.addFile(this.capturedMediaFile);
      }
    } catch (err) {
      // Logging the error, exept restrictions, which is handled in Core
      if (!err.isRestriction) {
        this.uppy.log(err, 'error');
      }
    }
  }
  async stop() {
    if (this.stream) {
      const audioTracks = this.stream.getAudioTracks();
      const videoTracks = this.stream.getVideoTracks();
      audioTracks.concat(videoTracks).forEach(track => track.stop());
    }
    if (this.recorder) {
      await new Promise(resolve => {
        this.recorder.addEventListener('stop', resolve, {
          once: true
        });
        this.recorder.stop();
        if (this.opts.showRecordingLength) {
          clearInterval(this.recordingLengthTimer);
        }
      });
    }
    this.recordingChunks = null;
    this.recorder = null;
    this.webcamActive = false;
    this.stream = null;
    this.setPluginState({
      recordedVideo: null,
      isRecording: false,
      recordingLengthSeconds: 0
    });
  }
  getVideoElement() {
    return this.el.querySelector('.uppy-Webcam-video');
  }
  oneTwoThreeSmile() {
    return new Promise((resolve, reject) => {
      let count = this.opts.countdown;

      // eslint-disable-next-line consistent-return
      const countDown = setInterval(() => {
        if (!this.webcamActive) {
          clearInterval(countDown);
          this.captureInProgress = false;
          return reject(new Error('Webcam is not active'));
        }
        if (count > 0) {
          this.uppy.info(`${count}...`, 'warning', 800);
          count--;
        } else {
          clearInterval(countDown);
          this.uppy.info(this.i18n('smile'), 'success', 1500);
          setTimeout(() => resolve(), 1500);
        }
      }, 1000);
    });
  }
  takeSnapshot() {
    if (this.captureInProgress) return;
    this.captureInProgress = true;
    this.opts.onBeforeSnapshot().catch(err => {
      const message = typeof err === 'object' ? err.message : err;
      this.uppy.info(message, 'error', 5000);
      return Promise.reject(new Error(`onBeforeSnapshot: ${message}`));
    }).then(() => {
      return this.getImage();
    }).then(tagFile => {
      this.captureInProgress = false;
      try {
        this.uppy.addFile(tagFile);
      } catch (err) {
        // Logging the error, except restrictions, which is handled in Core
        if (!err.isRestriction) {
          this.uppy.log(err);
        }
      }
    }, error => {
      this.captureInProgress = false;
      throw error;
    });
  }
  getImage() {
    const video = this.getVideoElement();
    if (!video) {
      return Promise.reject(new Error('No video element found, likely due to the Webcam tab being closed.'));
    }
    const width = video.videoWidth;
    const height = video.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const {
      restrictions
    } = this.uppy.opts;
    let preferredImageMimeTypes = [];
    if (this.opts.preferredImageMimeType) {
      preferredImageMimeTypes = [this.opts.preferredImageMimeType];
    } else if (restrictions.allowedFileTypes) {
      preferredImageMimeTypes = restrictions.allowedFileTypes.map(toMimeType).filter(isImageMimeType);
    }
    const mimeType = preferredImageMimeTypes[0] || 'image/jpeg';
    const ext = getFileTypeExtension(mimeType) || 'jpg';
    const name = `cam-${Date.now()}.${ext}`;
    return canvasToBlob(canvas, mimeType).then(blob => {
      return {
        source: this.id,
        name,
        data: new Blob([blob], {
          type: mimeType
        }),
        type: mimeType
      };
    });
  }
  getVideo() {
    // Sometimes in iOS Safari, Blobs (especially the first Blob in the recordingChunks Array)
    // have empty 'type' attributes (e.g. '') so we need to find a Blob that has a defined 'type'
    // attribute in order to determine the correct MIME type.
    const mimeType = this.recordingChunks.find(blob => {
      var _blob$type;
      return ((_blob$type = blob.type) == null ? void 0 : _blob$type.length) > 0;
    }).type;
    const fileExtension = getFileTypeExtension(mimeType);
    if (!fileExtension) {
      return Promise.reject(new Error(`Could not retrieve recording: Unsupported media type "${mimeType}"`));
    }
    const name = `webcam-${Date.now()}.${fileExtension}`;
    const blob = new Blob(this.recordingChunks, {
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
  focus() {
    if (!this.opts.countdown) return;
    setTimeout(() => {
      this.uppy.info(this.i18n('smile'), 'success', 1500);
    }, 1000);
  }
  changeVideoSource(deviceId) {
    this.stop();
    this.start({
      deviceId
    });
  }
  updateVideoSources() {
    this.mediaDevices.enumerateDevices().then(devices => {
      this.setPluginState({
        videoSources: devices.filter(device => device.kind === 'videoinput')
      });
    });
  }
  render() {
    if (!this.webcamActive) {
      this.start();
    }
    const webcamState = this.getPluginState();
    if (!webcamState.cameraReady || !webcamState.hasCamera) {
      return h(PermissionsScreen, {
        icon: CameraIcon,
        i18n: this.i18n,
        hasCamera: webcamState.hasCamera
      });
    }
    return h(CameraScreen
    // eslint-disable-next-line react/jsx-props-no-spreading
    , _extends({}, webcamState, {
      onChangeVideoSource: this.changeVideoSource,
      onSnapshot: this.takeSnapshot,
      onStartRecording: this.startRecording,
      onStopRecording: this.stopRecording,
      onDiscardRecordedVideo: this.discardRecordedVideo,
      onSubmit: this.submit,
      onFocus: this.focus,
      onStop: this.stop,
      i18n: this.i18n,
      modes: this.opts.modes,
      showRecordingLength: this.opts.showRecordingLength,
      showVideoSourceDropdown: this.opts.showVideoSourceDropdown,
      supportsRecording: supportsMediaRecorder(),
      recording: webcamState.isRecording,
      mirror: _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror],
      src: this.stream
    }));
  }
  install() {
    const {
      mobileNativeCamera,
      modes,
      facingMode,
      videoConstraints
    } = this.opts;
    const {
      target
    } = this.opts;
    if (mobileNativeCamera && target) {
      var _this$getTargetPlugin;
      (_this$getTargetPlugin = this.getTargetPlugin(target)) == null || _this$getTargetPlugin.setOptions({
        showNativeVideoCameraButton: isModeAvailable(modes, 'video-only') || isModeAvailable(modes, 'video-audio'),
        showNativePhotoCameraButton: isModeAvailable(modes, 'picture'),
        nativeCameraFacingMode: (videoConstraints == null ? void 0 : videoConstraints.facingMode) || facingMode
      });
      return;
    }
    this.setPluginState({
      cameraReady: false,
      recordingLengthSeconds: 0
    });
    if (target) {
      this.mount(target, this);
    }
    if (this.mediaDevices) {
      this.updateVideoSources();
      this.mediaDevices.ondevicechange = () => {
        this.updateVideoSources();
        if (this.stream) {
          let restartStream = true;
          const {
            videoSources,
            currentDeviceId
          } = this.getPluginState();
          videoSources.forEach(videoSource => {
            if (currentDeviceId === videoSource.deviceId) {
              restartStream = false;
            }
          });
          if (restartStream) {
            this.stop();
            this.start();
          }
        }
      };
    }
  }
  uninstall() {
    this.stop();
    this.unmount();
  }
  onUnmount() {
    this.stop();
  }
}
Webcam.VERSION = packageJson.version;