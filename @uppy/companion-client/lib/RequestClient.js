let _Symbol$for;
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
import UserFacingApiError from '@uppy/utils/lib/UserFacingApiError';
// eslint-disable-next-line import/no-extraneous-dependencies
import pRetry, { AbortError } from 'p-retry';
import fetchWithNetworkError from '@uppy/utils/lib/fetchWithNetworkError';
import ErrorWithCause from '@uppy/utils/lib/ErrorWithCause';
import emitSocketProgress from '@uppy/utils/lib/emitSocketProgress';
import getSocketHost from '@uppy/utils/lib/getSocketHost';
import AuthError from "./AuthError.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore We don't want TS to generate types for the package.json
const packageJson = {
  "version": "3.7.3"
};
// Remove the trailing slash so we can always safely append /xyz.
function stripSlash(url) {
  return url.replace(/\/$/, '');
}
const retryCount = 10; // set to a low number, like 2 to test manual user retries
const socketActivityTimeoutMs = 5 * 60 * 1000; // set to a low number like 10000 to test this

export const authErrorStatusCode = 401;
class HttpError extends Error {
  constructor(_ref) {
    let {
      statusCode,
      message
    } = _ref;
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}
async function handleJSONResponse(res) {
  if (res.status === authErrorStatusCode) {
    throw new AuthError();
  }
  if (res.ok) {
    return res.json();
  }
  let errMsg = `Failed request with status: ${res.status}. ${res.statusText}`;
  let errData;
  try {
    errData = await res.json();
    if (errData.message) errMsg = `${errMsg} message: ${errData.message}`;
    if (errData.requestId) errMsg = `${errMsg} request-Id: ${errData.requestId}`;
  } catch (cause) {
    // if the response contains invalid JSON, let's ignore the error data
    throw new Error(errMsg, {
      cause
    });
  }
  if (res.status >= 400 && res.status <= 499 && errData.message) {
    throw new UserFacingApiError(errData.message);
  }
  throw new HttpError({
    statusCode: res.status,
    message: errMsg
  });
}
var _companionHeaders = /*#__PURE__*/_classPrivateFieldLooseKey("companionHeaders");
var _getUrl = /*#__PURE__*/_classPrivateFieldLooseKey("getUrl");
var _requestSocketToken = /*#__PURE__*/_classPrivateFieldLooseKey("requestSocketToken");
var _awaitRemoteFileUpload = /*#__PURE__*/_classPrivateFieldLooseKey("awaitRemoteFileUpload");
_Symbol$for = Symbol.for('uppy test: getCompanionHeaders');
export default class RequestClient {
  constructor(uppy, opts) {
    /**
     * This method will ensure a websocket for the specified file and returns a promise that resolves
     * when the file has finished downloading, or rejects if it fails.
     * It will retry if the websocket gets disconnected
     */
    Object.defineProperty(this, _awaitRemoteFileUpload, {
      value: _awaitRemoteFileUpload2
    });
    Object.defineProperty(this, _getUrl, {
      value: _getUrl2
    });
    Object.defineProperty(this, _companionHeaders, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _requestSocketToken, {
      writable: true,
      value: async _ref2 => {
        var _file$remote;
        let {
          file,
          postBody,
          signal
        } = _ref2;
        if (((_file$remote = file.remote) == null ? void 0 : _file$remote.url) == null) {
          throw new Error('Cannot connect to an undefined URL');
        }
        const res = await this.post(file.remote.url, {
          ...file.remote.body,
          ...postBody
        }, {
          signal
        });
        return res.token;
      }
    });
    this.uppy = uppy;
    this.opts = opts;
    this.onReceiveResponse = this.onReceiveResponse.bind(this);
    // TODO: Remove optional chaining
    _classPrivateFieldLooseBase(this, _companionHeaders)[_companionHeaders] = opts == null ? void 0 : opts.companionHeaders;
  }
  setCompanionHeaders(headers) {
    _classPrivateFieldLooseBase(this, _companionHeaders)[_companionHeaders] = headers;
  }
  [_Symbol$for]() {
    return _classPrivateFieldLooseBase(this, _companionHeaders)[_companionHeaders];
  }
  get hostname() {
    const {
      companion
    } = this.uppy.getState();
    const host = this.opts.companionUrl;
    return stripSlash(companion && companion[host] ? companion[host] : host);
  }
  async headers(emptyBody) {
    if (emptyBody === void 0) {
      emptyBody = false;
    }
    const defaultHeaders = {
      Accept: 'application/json',
      ...(emptyBody ? undefined : {
        // Passing those headers on requests with no data forces browsers to first make a preflight request.
        'Content-Type': 'application/json'
      })
    };
    return {
      ...defaultHeaders,
      ..._classPrivateFieldLooseBase(this, _companionHeaders)[_companionHeaders]
    };
  }
  onReceiveResponse(res) {
    const {
      headers
    } = res;
    const state = this.uppy.getState();
    const companion = state.companion || {};
    const host = this.opts.companionUrl;

    // Store the self-identified domain name for the Companion instance we just hit.
    if (headers.has('i-am') && headers.get('i-am') !== companion[host]) {
      this.uppy.setState({
        companion: {
          ...companion,
          [host]: headers.get('i-am')
        }
      });
    }
  }
  async request(_ref3) {
    let {
      path,
      method = 'GET',
      data,
      skipPostResponse,
      signal
    } = _ref3;
    try {
      const headers = await this.headers(!data);
      const response = await fetchWithNetworkError(_classPrivateFieldLooseBase(this, _getUrl)[_getUrl](path), {
        method,
        signal,
        headers,
        credentials: this.opts.companionCookiesRule || 'same-origin',
        body: data ? JSON.stringify(data) : null
      });
      if (!skipPostResponse) this.onReceiveResponse(response);
      return await handleJSONResponse(response);
    } catch (err) {
      // pass these through
      if (err.isAuthError || err.name === 'UserFacingApiError' || err.name === 'AbortError') throw err;
      throw new ErrorWithCause(`Could not ${method} ${_classPrivateFieldLooseBase(this, _getUrl)[_getUrl](path)}`, {
        cause: err
      });
    }
  }
  async get(path, options) {
    // TODO: remove boolean support for options that was added for backward compatibility.
    // eslint-disable-next-line no-param-reassign
    if (typeof options === 'boolean') options = {
      skipPostResponse: options
    };
    return this.request({
      ...options,
      path
    });
  }
  async post(path, data, options) {
    // TODO: remove boolean support for options that was added for backward compatibility.
    // eslint-disable-next-line no-param-reassign
    if (typeof options === 'boolean') options = {
      skipPostResponse: options
    };
    return this.request({
      ...options,
      path,
      method: 'POST',
      data
    });
  }
  async delete(path, data, options) {
    // TODO: remove boolean support for options that was added for backward compatibility.
    // eslint-disable-next-line no-param-reassign
    if (typeof options === 'boolean') options = {
      skipPostResponse: options
    };
    return this.request({
      ...options,
      path,
      method: 'DELETE',
      data
    });
  }

  /**
   * Remote uploading consists of two steps:
   * 1. #requestSocketToken which starts the download/upload in companion and returns a unique token for the upload.
   * Then companion will halt the upload until:
   * 2. #awaitRemoteFileUpload is called, which will open/ensure a websocket connection towards companion, with the
   * previously generated token provided. It returns a promise that will resolve/reject once the file has finished
   * uploading or is otherwise done (failed, canceled)
   */
  async uploadRemoteFile(file, reqBody, options) {
    var _this = this;
    try {
      const {
        signal,
        getQueue
      } = options || {};
      return await pRetry(async () => {
        var _this$uppy$getFile;
        // if we already have a serverToken, assume that we are resuming the existing server upload id
        const existingServerToken = (_this$uppy$getFile = this.uppy.getFile(file.id)) == null ? void 0 : _this$uppy$getFile.serverToken;
        if (existingServerToken != null) {
          this.uppy.log(`Connecting to exiting websocket ${existingServerToken}`);
          return _classPrivateFieldLooseBase(this, _awaitRemoteFileUpload)[_awaitRemoteFileUpload]({
            file,
            queue: getQueue(),
            signal
          });
        }
        const queueRequestSocketToken = getQueue().wrapPromiseFunction(async function () {
          try {
            return await _classPrivateFieldLooseBase(_this, _requestSocketToken)[_requestSocketToken](...arguments);
          } catch (outerErr) {
            // throwing AbortError will cause p-retry to stop retrying
            if (outerErr.isAuthError) throw new AbortError(outerErr);
            if (outerErr.cause == null) throw outerErr;
            const err = outerErr.cause;
            const isRetryableHttpError = () => [408, 409, 429, 418, 423].includes(err.statusCode) || err.statusCode >= 500 && err.statusCode <= 599 && ![501, 505].includes(err.statusCode);
            if (err.name === 'HttpError' && !isRetryableHttpError()) throw new AbortError(err);

            // p-retry will retry most other errors,
            // but it will not retry TypeError (except network error TypeErrors)
            throw err;
          }
        }, {
          priority: -1
        });
        const serverToken = await queueRequestSocketToken({
          file,
          postBody: reqBody,
          signal
        }).abortOn(signal);
        if (!this.uppy.getFile(file.id)) return undefined; // has file since been removed?

        this.uppy.setFileState(file.id, {
          serverToken
        });
        return _classPrivateFieldLooseBase(this, _awaitRemoteFileUpload)[_awaitRemoteFileUpload]({
          file: this.uppy.getFile(file.id),
          // re-fetching file because it might have changed in the meantime
          queue: getQueue(),
          signal
        });
      }, {
        retries: retryCount,
        signal,
        onFailedAttempt: err => this.uppy.log(`Retrying upload due to: ${err.message}`, 'warning')
      });
    } catch (err) {
      // this is a bit confusing, but note that an error with the `name` prop set to 'AbortError' (from AbortController)
      // is not the same as `p-retry` `AbortError`
      if (err.name === 'AbortError') {
        // The file upload was aborted, it’s not an error
        return undefined;
      }
      this.uppy.emit('upload-error', file, err);
      throw err;
    }
  }
}
function _getUrl2(url) {
  if (/^(https?:|)\/\//.test(url)) {
    return url;
  }
  return `${this.hostname}/${url}`;
}
async function _awaitRemoteFileUpload2(_ref4) {
  let {
    file,
    queue,
    signal
  } = _ref4;
  let removeEventHandlers;
  const {
    capabilities
  } = this.uppy.getState();
  try {
    return await new Promise((resolve, reject) => {
      const token = file.serverToken;
      const host = getSocketHost(file.remote.companionUrl);
      let socket;
      let socketAbortController;
      let activityTimeout;
      let {
        isPaused
      } = file;
      const socketSend = (action, payload) => {
        if (socket == null || socket.readyState !== socket.OPEN) {
          var _socket;
          this.uppy.log(`Cannot send "${action}" to socket ${file.id} because the socket state was ${String((_socket = socket) == null ? void 0 : _socket.readyState)}`, 'warning');
          return;
        }
        socket.send(JSON.stringify({
          action,
          payload: payload != null ? payload : {}
        }));
      };
      function sendState() {
        if (!capabilities.resumableUploads) return;
        if (isPaused) socketSend('pause');else socketSend('resume');
      }
      const createWebsocket = async () => {
        if (socketAbortController) socketAbortController.abort();
        socketAbortController = new AbortController();
        const onFatalError = err => {
          var _socketAbortControlle;
          // Remove the serverToken so that a new one will be created for the retry.
          this.uppy.setFileState(file.id, {
            serverToken: null
          });
          (_socketAbortControlle = socketAbortController) == null || _socketAbortControlle.abort == null || _socketAbortControlle.abort();
          reject(err);
        };

        // todo instead implement the ability for users to cancel / retry *currently uploading files* in the UI
        function resetActivityTimeout() {
          clearTimeout(activityTimeout);
          if (isPaused) return;
          activityTimeout = setTimeout(() => onFatalError(new Error('Timeout waiting for message from Companion socket')), socketActivityTimeoutMs);
        }
        try {
          await queue.wrapPromiseFunction(async () => {
            const reconnectWebsocket = async () =>
            // eslint-disable-next-line promise/param-names
            new Promise((_, rejectSocket) => {
              socket = new WebSocket(`${host}/api/${token}`);
              resetActivityTimeout();
              socket.addEventListener('close', () => {
                socket = undefined;
                rejectSocket(new Error('Socket closed unexpectedly'));
              });
              socket.addEventListener('error', error => {
                var _socket2;
                this.uppy.log(`Companion socket error ${JSON.stringify(error)}, closing socket`, 'warning');
                (_socket2 = socket) == null || _socket2.close(); // will 'close' event to be emitted
              });
              socket.addEventListener('open', () => {
                sendState();
              });
              socket.addEventListener('message', e => {
                resetActivityTimeout();
                try {
                  const {
                    action,
                    payload
                  } = JSON.parse(e.data);
                  switch (action) {
                    case 'progress':
                      {
                        emitSocketProgress(this, payload, this.uppy.getFile(file.id));
                        break;
                      }
                    case 'success':
                      {
                        var _payload$response, _payload$response$sta, _payload$response2, _socketAbortControlle2;
                        // payload.response exists for xhr-upload but not for tus/transloadit
                        const text = (_payload$response = payload.response) == null ? void 0 : _payload$response.responseText;
                        this.uppy.emit('upload-success', this.uppy.getFile(file.id), {
                          uploadURL: payload.url,
                          status: (_payload$response$sta = (_payload$response2 = payload.response) == null ? void 0 : _payload$response2.status) != null ? _payload$response$sta : 200,
                          body: text ? JSON.parse(text) : undefined
                        });
                        (_socketAbortControlle2 = socketAbortController) == null || _socketAbortControlle2.abort == null || _socketAbortControlle2.abort();
                        resolve();
                        break;
                      }
                    case 'error':
                      {
                        const {
                          message
                        } = payload.error;
                        throw Object.assign(new Error(message), {
                          cause: payload.error
                        });
                      }
                    default:
                      this.uppy.log(`Companion socket unknown action ${action}`, 'warning');
                  }
                } catch (err) {
                  onFatalError(err);
                }
              });
              const closeSocket = () => {
                this.uppy.log(`Closing socket ${file.id}`, 'info');
                clearTimeout(activityTimeout);
                if (socket) socket.close();
                socket = undefined;
              };
              socketAbortController.signal.addEventListener('abort', () => {
                closeSocket();
              });
            });
            await pRetry(reconnectWebsocket, {
              retries: retryCount,
              signal: socketAbortController.signal,
              onFailedAttempt: () => {
                if (socketAbortController.signal.aborted) return; // don't log in this case
                this.uppy.log(`Retrying websocket ${file.id}`, 'info');
              }
            });
          })().abortOn(socketAbortController.signal);
        } catch (err) {
          if (socketAbortController.signal.aborted) return;
          onFatalError(err);
        }
      };
      const pause = newPausedState => {
        if (!capabilities.resumableUploads) return;
        isPaused = newPausedState;
        if (socket) sendState();
        if (newPausedState) {
          var _socketAbortControlle3;
          // Remove this file from the queue so another file can start in its place.
          (_socketAbortControlle3 = socketAbortController) == null || _socketAbortControlle3.abort == null || _socketAbortControlle3.abort(); // close socket to free up the request for other uploads
        } else {
          // Resuming an upload should be queued, else you could pause and then
          // resume a queued upload to make it skip the queue.
          createWebsocket();
        }
      };
      const onFileRemove = targetFile => {
        var _socketAbortControlle4;
        if (!capabilities.individualCancellation) return;
        if (targetFile.id !== file.id) return;
        socketSend('cancel');
        (_socketAbortControlle4 = socketAbortController) == null || _socketAbortControlle4.abort == null || _socketAbortControlle4.abort();
        this.uppy.log(`upload ${file.id} was removed`, 'info');
        resolve();
      };
      const onCancelAll = _ref5 => {
        var _socketAbortControlle5;
        let {
          reason
        } = _ref5;
        if (reason === 'user') {
          socketSend('cancel');
        }
        (_socketAbortControlle5 = socketAbortController) == null || _socketAbortControlle5.abort == null || _socketAbortControlle5.abort();
        this.uppy.log(`upload ${file.id} was canceled`, 'info');
        resolve();
      };
      const onFilePausedChange = (targetFileId, newPausedState) => {
        if (targetFileId !== file.id) return;
        pause(newPausedState);
      };
      const onPauseAll = () => pause(true);
      const onResumeAll = () => pause(false);
      this.uppy.on('file-removed', onFileRemove);
      this.uppy.on('cancel-all', onCancelAll);
      this.uppy.on('upload-pause', onFilePausedChange);
      this.uppy.on('pause-all', onPauseAll);
      this.uppy.on('resume-all', onResumeAll);
      removeEventHandlers = () => {
        this.uppy.off('file-removed', onFileRemove);
        this.uppy.off('cancel-all', onCancelAll);
        this.uppy.off('upload-pause', onFilePausedChange);
        this.uppy.off('pause-all', onPauseAll);
        this.uppy.off('resume-all', onResumeAll);
      };
      signal.addEventListener('abort', () => {
        var _socketAbortControlle6;
        (_socketAbortControlle6 = socketAbortController) == null || _socketAbortControlle6.abort();
      });
      createWebsocket();
    });
  } finally {
    // @ts-expect-error used before defined
    removeEventHandlers == null || removeEventHandlers();
  }
}
RequestClient.VERSION = packageJson.version;