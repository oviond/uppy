function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
import { AbortController } from '@uppy/utils/lib/AbortController';
const MB = 1024 * 1024;
const defaultOptions = {
  getChunkSize(file) {
    return Math.ceil(file.size / 10000);
  },
  onProgress() {},
  onPartComplete() {},
  onSuccess() {},
  onError(err) {
    throw err;
  }
};
function ensureInt(value) {
  if (typeof value === 'string') {
    return parseInt(value, 10);
  }
  if (typeof value === 'number') {
    return value;
  }
  throw new TypeError('Expected a number');
}
export const pausingUploadReason = Symbol('pausing upload, not an actual error');

/**
 * A MultipartUploader instance is used per file upload to determine whether a
 * upload should be done as multipart or as a regular S3 upload
 * (based on the user-provided `shouldUseMultipart` option value) and to manage
 * the chunk splitting.
 */
var _abortController = /*#__PURE__*/_classPrivateFieldLooseKey("abortController");
var _chunks = /*#__PURE__*/_classPrivateFieldLooseKey("chunks");
var _chunkState = /*#__PURE__*/_classPrivateFieldLooseKey("chunkState");
var _data = /*#__PURE__*/_classPrivateFieldLooseKey("data");
var _file = /*#__PURE__*/_classPrivateFieldLooseKey("file");
var _uploadHasStarted = /*#__PURE__*/_classPrivateFieldLooseKey("uploadHasStarted");
var _onError = /*#__PURE__*/_classPrivateFieldLooseKey("onError");
var _onSuccess = /*#__PURE__*/_classPrivateFieldLooseKey("onSuccess");
var _shouldUseMultipart = /*#__PURE__*/_classPrivateFieldLooseKey("shouldUseMultipart");
var _isRestoring = /*#__PURE__*/_classPrivateFieldLooseKey("isRestoring");
var _onReject = /*#__PURE__*/_classPrivateFieldLooseKey("onReject");
var _maxMultipartParts = /*#__PURE__*/_classPrivateFieldLooseKey("maxMultipartParts");
var _minPartSize = /*#__PURE__*/_classPrivateFieldLooseKey("minPartSize");
var _initChunks = /*#__PURE__*/_classPrivateFieldLooseKey("initChunks");
var _createUpload = /*#__PURE__*/_classPrivateFieldLooseKey("createUpload");
var _resumeUpload = /*#__PURE__*/_classPrivateFieldLooseKey("resumeUpload");
var _onPartProgress = /*#__PURE__*/_classPrivateFieldLooseKey("onPartProgress");
var _onPartComplete = /*#__PURE__*/_classPrivateFieldLooseKey("onPartComplete");
var _abortUpload = /*#__PURE__*/_classPrivateFieldLooseKey("abortUpload");
class MultipartUploader {
  constructor(data, options) {
    var _this$options, _this$options$getChun;
    Object.defineProperty(this, _abortUpload, {
      value: _abortUpload2
    });
    Object.defineProperty(this, _resumeUpload, {
      value: _resumeUpload2
    });
    Object.defineProperty(this, _createUpload, {
      value: _createUpload2
    });
    // initChunks checks the user preference for using multipart uploads (opts.shouldUseMultipart)
    // and calculates the optimal part size. When using multipart part uploads every part except for the last has
    // to be at least 5 MB and there can be no more than 10K parts.
    // This means we sometimes need to change the preferred part size from the user in order to meet these requirements.
    Object.defineProperty(this, _initChunks, {
      value: _initChunks2
    });
    Object.defineProperty(this, _abortController, {
      writable: true,
      value: new AbortController()
    });
    /** @type {import("../types/chunk").Chunk[]} */
    Object.defineProperty(this, _chunks, {
      writable: true,
      value: void 0
    });
    /** @type {{ uploaded: number, etag?: string, done?: boolean }[]} */
    Object.defineProperty(this, _chunkState, {
      writable: true,
      value: void 0
    });
    /**
     * The (un-chunked) data to upload.
     *
     * @type {Blob}
     */
    Object.defineProperty(this, _data, {
      writable: true,
      value: void 0
    });
    /** @type {import("@uppy/core").UppyFile} */
    Object.defineProperty(this, _file, {
      writable: true,
      value: void 0
    });
    /** @type {boolean} */
    Object.defineProperty(this, _uploadHasStarted, {
      writable: true,
      value: false
    });
    /** @type {(err?: Error | any) => void} */
    Object.defineProperty(this, _onError, {
      writable: true,
      value: void 0
    });
    /** @type {() => void} */
    Object.defineProperty(this, _onSuccess, {
      writable: true,
      value: void 0
    });
    /** @type {import('../types/index').AwsS3MultipartOptions["shouldUseMultipart"]} */
    Object.defineProperty(this, _shouldUseMultipart, {
      writable: true,
      value: void 0
    });
    /** @type {boolean} */
    Object.defineProperty(this, _isRestoring, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _onReject, {
      writable: true,
      value: err => (err == null ? void 0 : err.cause) === pausingUploadReason ? null : _classPrivateFieldLooseBase(this, _onError)[_onError](err)
    });
    Object.defineProperty(this, _maxMultipartParts, {
      writable: true,
      value: 10000
    });
    Object.defineProperty(this, _minPartSize, {
      writable: true,
      value: 5 * MB
    });
    Object.defineProperty(this, _onPartProgress, {
      writable: true,
      value: index => ev => {
        if (!ev.lengthComputable) return;
        _classPrivateFieldLooseBase(this, _chunkState)[_chunkState][index].uploaded = ensureInt(ev.loaded);
        const totalUploaded = _classPrivateFieldLooseBase(this, _chunkState)[_chunkState].reduce((n, c) => n + c.uploaded, 0);
        this.options.onProgress(totalUploaded, _classPrivateFieldLooseBase(this, _data)[_data].size);
      }
    });
    Object.defineProperty(this, _onPartComplete, {
      writable: true,
      value: index => etag => {
        // This avoids the net::ERR_OUT_OF_MEMORY in Chromium Browsers.
        _classPrivateFieldLooseBase(this, _chunks)[_chunks][index] = null;
        _classPrivateFieldLooseBase(this, _chunkState)[_chunkState][index].etag = etag;
        _classPrivateFieldLooseBase(this, _chunkState)[_chunkState][index].done = true;
        const part = {
          PartNumber: index + 1,
          ETag: etag
        };
        this.options.onPartComplete(part);
      }
    });
    this.options = {
      ...defaultOptions,
      ...options
    };
    // Use default `getChunkSize` if it was null or something
    (_this$options$getChun = (_this$options = this.options).getChunkSize) != null ? _this$options$getChun : _this$options.getChunkSize = defaultOptions.getChunkSize;
    _classPrivateFieldLooseBase(this, _data)[_data] = data;
    _classPrivateFieldLooseBase(this, _file)[_file] = options.file;
    _classPrivateFieldLooseBase(this, _onSuccess)[_onSuccess] = this.options.onSuccess;
    _classPrivateFieldLooseBase(this, _onError)[_onError] = this.options.onError;
    _classPrivateFieldLooseBase(this, _shouldUseMultipart)[_shouldUseMultipart] = this.options.shouldUseMultipart;

    // When we are restoring an upload, we already have an UploadId and a Key. Otherwise
    // we need to call `createMultipartUpload` to get an `uploadId` and a `key`.
    // Non-multipart uploads are not restorable.
    _classPrivateFieldLooseBase(this, _isRestoring)[_isRestoring] = options.uploadId && options.key;
    _classPrivateFieldLooseBase(this, _initChunks)[_initChunks]();
  }
  start() {
    if (_classPrivateFieldLooseBase(this, _uploadHasStarted)[_uploadHasStarted]) {
      if (!_classPrivateFieldLooseBase(this, _abortController)[_abortController].signal.aborted) _classPrivateFieldLooseBase(this, _abortController)[_abortController].abort(pausingUploadReason);
      _classPrivateFieldLooseBase(this, _abortController)[_abortController] = new AbortController();
      _classPrivateFieldLooseBase(this, _resumeUpload)[_resumeUpload]();
    } else if (_classPrivateFieldLooseBase(this, _isRestoring)[_isRestoring]) {
      this.options.companionComm.restoreUploadFile(_classPrivateFieldLooseBase(this, _file)[_file], {
        uploadId: this.options.uploadId,
        key: this.options.key
      });
      _classPrivateFieldLooseBase(this, _resumeUpload)[_resumeUpload]();
    } else {
      _classPrivateFieldLooseBase(this, _createUpload)[_createUpload]();
    }
  }
  pause() {
    _classPrivateFieldLooseBase(this, _abortController)[_abortController].abort(pausingUploadReason);
    // Swap it out for a new controller, because this instance may be resumed later.
    _classPrivateFieldLooseBase(this, _abortController)[_abortController] = new AbortController();
  }
  abort(opts) {
    var _opts;
    if (opts === void 0) {
      opts = undefined;
    }
    if ((_opts = opts) != null && _opts.really) _classPrivateFieldLooseBase(this, _abortUpload)[_abortUpload]();else this.pause();
  }

  // TODO: remove this in the next major
  get chunkState() {
    return _classPrivateFieldLooseBase(this, _chunkState)[_chunkState];
  }
}
function _initChunks2() {
  const fileSize = _classPrivateFieldLooseBase(this, _data)[_data].size;
  const shouldUseMultipart = typeof _classPrivateFieldLooseBase(this, _shouldUseMultipart)[_shouldUseMultipart] === 'function' ? _classPrivateFieldLooseBase(this, _shouldUseMultipart)[_shouldUseMultipart](_classPrivateFieldLooseBase(this, _file)[_file]) : Boolean(_classPrivateFieldLooseBase(this, _shouldUseMultipart)[_shouldUseMultipart]);
  if (shouldUseMultipart && fileSize > _classPrivateFieldLooseBase(this, _minPartSize)[_minPartSize]) {
    // At least 5MB per request:
    let chunkSize = Math.max(this.options.getChunkSize(_classPrivateFieldLooseBase(this, _data)[_data]), _classPrivateFieldLooseBase(this, _minPartSize)[_minPartSize]);
    let arraySize = Math.floor(fileSize / chunkSize);

    // At most 10k requests per file:
    if (arraySize > _classPrivateFieldLooseBase(this, _maxMultipartParts)[_maxMultipartParts]) {
      arraySize = _classPrivateFieldLooseBase(this, _maxMultipartParts)[_maxMultipartParts];
      chunkSize = fileSize / _classPrivateFieldLooseBase(this, _maxMultipartParts)[_maxMultipartParts];
    }
    _classPrivateFieldLooseBase(this, _chunks)[_chunks] = Array(arraySize);
    for (let offset = 0, j = 0; offset < fileSize; offset += chunkSize, j++) {
      const end = Math.min(fileSize, offset + chunkSize);

      // Defer data fetching/slicing until we actually need the data, because it's slow if we have a lot of files
      const getData = () => {
        const i2 = offset;
        return _classPrivateFieldLooseBase(this, _data)[_data].slice(i2, end);
      };
      _classPrivateFieldLooseBase(this, _chunks)[_chunks][j] = {
        getData,
        onProgress: _classPrivateFieldLooseBase(this, _onPartProgress)[_onPartProgress](j),
        onComplete: _classPrivateFieldLooseBase(this, _onPartComplete)[_onPartComplete](j),
        shouldUseMultipart
      };
      if (_classPrivateFieldLooseBase(this, _isRestoring)[_isRestoring]) {
        const size = offset + chunkSize > fileSize ? fileSize - offset : chunkSize;
        // setAsUploaded is called by listPart, to keep up-to-date the
        // quantity of data that is left to actually upload.
        _classPrivateFieldLooseBase(this, _chunks)[_chunks][j].setAsUploaded = () => {
          _classPrivateFieldLooseBase(this, _chunks)[_chunks][j] = null;
          _classPrivateFieldLooseBase(this, _chunkState)[_chunkState][j].uploaded = size;
        };
      }
    }
  } else {
    _classPrivateFieldLooseBase(this, _chunks)[_chunks] = [{
      getData: () => _classPrivateFieldLooseBase(this, _data)[_data],
      onProgress: _classPrivateFieldLooseBase(this, _onPartProgress)[_onPartProgress](0),
      onComplete: _classPrivateFieldLooseBase(this, _onPartComplete)[_onPartComplete](0),
      shouldUseMultipart
    }];
  }
  _classPrivateFieldLooseBase(this, _chunkState)[_chunkState] = _classPrivateFieldLooseBase(this, _chunks)[_chunks].map(() => ({
    uploaded: 0
  }));
}
function _createUpload2() {
  this.options.companionComm.uploadFile(_classPrivateFieldLooseBase(this, _file)[_file], _classPrivateFieldLooseBase(this, _chunks)[_chunks], _classPrivateFieldLooseBase(this, _abortController)[_abortController].signal).then(_classPrivateFieldLooseBase(this, _onSuccess)[_onSuccess], _classPrivateFieldLooseBase(this, _onReject)[_onReject]);
  _classPrivateFieldLooseBase(this, _uploadHasStarted)[_uploadHasStarted] = true;
}
function _resumeUpload2() {
  this.options.companionComm.resumeUploadFile(_classPrivateFieldLooseBase(this, _file)[_file], _classPrivateFieldLooseBase(this, _chunks)[_chunks], _classPrivateFieldLooseBase(this, _abortController)[_abortController].signal).then(_classPrivateFieldLooseBase(this, _onSuccess)[_onSuccess], _classPrivateFieldLooseBase(this, _onReject)[_onReject]);
}
function _abortUpload2() {
  _classPrivateFieldLooseBase(this, _abortController)[_abortController].abort();
  this.options.companionComm.abortFileUpload(_classPrivateFieldLooseBase(this, _file)[_file]).catch(err => this.options.log(err));
}
export default MultipartUploader;