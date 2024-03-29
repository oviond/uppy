function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
var _uppy = /*#__PURE__*/_classPrivateFieldLooseKey("uppy");
var _events = /*#__PURE__*/_classPrivateFieldLooseKey("events");
/**
 * Create a wrapper around an event emitter with a `remove` method to remove
 * all events that were added using the wrapped emitter.
 */
export default class EventManager {
  constructor(uppy) {
    Object.defineProperty(this, _uppy, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _events, {
      writable: true,
      value: []
    });
    _classPrivateFieldLooseBase(this, _uppy)[_uppy] = uppy;
  }
  on(event, fn) {
    _classPrivateFieldLooseBase(this, _events)[_events].push([event, fn]);
    return _classPrivateFieldLooseBase(this, _uppy)[_uppy].on(event, fn);
  }
  remove() {
    for (const [event, fn] of _classPrivateFieldLooseBase(this, _events)[_events].splice(0)) {
      _classPrivateFieldLooseBase(this, _uppy)[_uppy].off(event, fn);
    }
  }
  onFilePause(fileID, cb) {
    this.on('upload-pause', (targetFileID, isPaused) => {
      if (fileID === targetFileID) {
        cb(isPaused);
      }
    });
  }
  onFileRemove(fileID, cb) {
    this.on('file-removed', file => {
      if (fileID === file.id) cb(file.id);
    });
  }
  onPause(fileID, cb) {
    this.on('upload-pause', (targetFileID, isPaused) => {
      if (fileID === targetFileID) {
        // const isPaused = this.#uppy.pauseResume(fileID)
        cb(isPaused);
      }
    });
  }
  onRetry(fileID, cb) {
    this.on('upload-retry', targetFileID => {
      if (fileID === targetFileID) {
        cb();
      }
    });
  }
  onRetryAll(fileID, cb) {
    this.on('retry-all', () => {
      if (!_classPrivateFieldLooseBase(this, _uppy)[_uppy].getFile(fileID)) return;
      cb();
    });
  }
  onPauseAll(fileID, cb) {
    this.on('pause-all', () => {
      if (!_classPrivateFieldLooseBase(this, _uppy)[_uppy].getFile(fileID)) return;
      cb();
    });
  }
  onCancelAll(fileID, eventHandler) {
    var _this = this;
    this.on('cancel-all', function () {
      if (!_classPrivateFieldLooseBase(_this, _uppy)[_uppy].getFile(fileID)) return;
      eventHandler(...arguments);
    });
  }
  onResumeAll(fileID, cb) {
    this.on('resume-all', () => {
      if (!_classPrivateFieldLooseBase(this, _uppy)[_uppy].getFile(fileID)) return;
      cb();
    });
  }
}