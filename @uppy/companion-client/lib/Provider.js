function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
import RequestClient, { authErrorStatusCode } from "./RequestClient.js";
import * as tokenStorage from "./tokenStorage.js";

// TODO: remove deprecated options in next major release

const getName = id => {
  return id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
};
function getOrigin() {
  // eslint-disable-next-line no-restricted-globals
  return location.origin;
}
function getRegex(value) {
  if (typeof value === 'string') {
    return new RegExp(`^${value}$`);
  }
  if (value instanceof RegExp) {
    return value;
  }
  return undefined;
}
function isOriginAllowed(origin, allowedOrigin) {
  const patterns = Array.isArray(allowedOrigin) ? allowedOrigin.map(getRegex) : [getRegex(allowedOrigin)];
  return patterns.some(pattern => (pattern == null ? void 0 : pattern.test(origin)) || (pattern == null ? void 0 : pattern.test(`${origin}/`))); // allowing for trailing '/'
}
var _refreshingTokenPromise = /*#__PURE__*/_classPrivateFieldLooseKey("refreshingTokenPromise");
var _getAuthToken = /*#__PURE__*/_classPrivateFieldLooseKey("getAuthToken");
var _getPlugin = /*#__PURE__*/_classPrivateFieldLooseKey("getPlugin");
export default class Provider extends RequestClient {
  constructor(uppy, opts) {
    var _opts$supportsRefresh;
    super(uppy, opts);
    Object.defineProperty(this, _getPlugin, {
      value: _getPlugin2
    });
    Object.defineProperty(this, _getAuthToken, {
      value: _getAuthToken2
    });
    Object.defineProperty(this, _refreshingTokenPromise, {
      writable: true,
      value: void 0
    });
    this.provider = opts.provider;
    this.id = this.provider;
    this.name = this.opts.name || getName(this.id);
    this.pluginId = this.opts.pluginId;
    this.tokenKey = `companion-${this.pluginId}-auth-token`;
    this.companionKeysParams = this.opts.companionKeysParams;
    this.preAuthToken = null;
    this.supportsRefreshToken = (_opts$supportsRefresh = opts.supportsRefreshToken) != null ? _opts$supportsRefresh : true; // todo false in next major
  }
  async headers() {
    const [headers, token] = await Promise.all([super.headers(), _classPrivateFieldLooseBase(this, _getAuthToken)[_getAuthToken]()]);
    const authHeaders = {};
    if (token) {
      authHeaders['uppy-auth-token'] = token;
    }
    if (this.companionKeysParams) {
      authHeaders['uppy-credentials-params'] = btoa(JSON.stringify({
        params: this.companionKeysParams
      }));
    }
    return {
      ...headers,
      ...authHeaders
    };
  }
  onReceiveResponse(response) {
    super.onReceiveResponse(response);
    const plugin = _classPrivateFieldLooseBase(this, _getPlugin)[_getPlugin]();
    const oldAuthenticated = plugin.getPluginState().authenticated;
    const authenticated = oldAuthenticated ? response.status !== authErrorStatusCode : response.status < 400;
    plugin.setPluginState({
      authenticated
    });
    return response;
  }
  async setAuthToken(token) {
    return _classPrivateFieldLooseBase(this, _getPlugin)[_getPlugin]().storage.setItem(this.tokenKey, token);
  }
  async removeAuthToken() {
    return _classPrivateFieldLooseBase(this, _getPlugin)[_getPlugin]().storage.removeItem(this.tokenKey);
  }
  /**
   * Ensure we have a preauth token if necessary. Attempts to fetch one if we don't,
   * or rejects if loading one fails.
   */
  async ensurePreAuth() {
    if (this.companionKeysParams && !this.preAuthToken) {
      await this.fetchPreAuthToken();
      if (!this.preAuthToken) {
        throw new Error('Could not load authentication data required for third-party login. Please try again later.');
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  authQuery(data) {
    return {};
  }
  authUrl(_ref) {
    let {
      authFormData,
      query
    } = _ref;
    const params = new URLSearchParams({
      ...query,
      state: btoa(JSON.stringify({
        origin: getOrigin()
      })),
      ...this.authQuery({
        authFormData
      })
    });
    if (this.preAuthToken) {
      params.set('uppyPreAuthToken', this.preAuthToken);
    }
    return `${this.hostname}/${this.id}/connect?${params}`;
  }
  async loginSimpleAuth(_ref2) {
    let {
      uppyVersions,
      authFormData,
      signal
    } = _ref2;
    const response = await this.post(`${this.id}/simple-auth`, {
      form: authFormData
    }, {
      qs: {
        uppyVersions
      },
      signal
    });
    this.setAuthToken(response.uppyAuthToken);
  }
  async loginOAuth(_ref3) {
    let {
      uppyVersions,
      authFormData,
      signal
    } = _ref3;
    await this.ensurePreAuth();
    signal.throwIfAborted();
    return new Promise((resolve, reject) => {
      const link = this.authUrl({
        query: {
          uppyVersions
        },
        authFormData
      });
      const authWindow = window.open(link, '_blank');
      let cleanup;
      const handleToken = e => {
        if (e.source !== authWindow) {
          let jsonData = '';
          try {
            // TODO improve our uppy logger so that it can take an arbitrary number of arguments,
            // each either objects, errors or strings,
            // then we don’t have to manually do these things like json stringify when logging.
            // the logger should never throw an error.
            jsonData = JSON.stringify(e.data);
          } catch (err) {
            // in case JSON.stringify fails (ignored)
          }
          this.uppy.log(`ignoring event from unknown source ${jsonData}`, 'warning');
          return;
        }
        const {
          companionAllowedHosts
        } = _classPrivateFieldLooseBase(this, _getPlugin)[_getPlugin]().opts;
        if (!isOriginAllowed(e.origin, companionAllowedHosts)) {
          reject(new Error(`rejecting event from ${e.origin} vs allowed pattern ${companionAllowedHosts}`));
          return;
        }

        // Check if it's a string before doing the JSON.parse to maintain support
        // for older Companion versions that used object references
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.error) {
          const {
            uppy
          } = this;
          const message = uppy.i18n('authAborted');
          uppy.info({
            message
          }, 'warning', 5000);
          reject(new Error('auth aborted'));
          return;
        }
        if (!data.token) {
          reject(new Error('did not receive token from auth window'));
          return;
        }
        cleanup();
        resolve(this.setAuthToken(data.token));
      };
      cleanup = () => {
        authWindow == null || authWindow.close();
        window.removeEventListener('message', handleToken);
        signal.removeEventListener('abort', cleanup);
      };
      signal.addEventListener('abort', cleanup);
      window.addEventListener('message', handleToken);
    });
  }
  async login(_ref4) {
    let {
      uppyVersions,
      authFormData,
      signal
    } = _ref4;
    return this.loginOAuth({
      uppyVersions,
      authFormData,
      signal
    });
  }
  refreshTokenUrl() {
    return `${this.hostname}/${this.id}/refresh-token`;
  }
  fileUrl(id) {
    return `${this.hostname}/${this.id}/get/${id}`;
  }
  async request() {
    await _classPrivateFieldLooseBase(this, _refreshingTokenPromise)[_refreshingTokenPromise];
    try {
      // to test simulate access token expired (leading to a token token refresh),
      // see mockAccessTokenExpiredError in companion/drive.
      // If you want to test refresh token *and* access token invalid, do this for example with Google Drive:
      // While uploading, go to your google account settings,
      // "Third-party apps & services", then click "Companion" and "Remove access".

      return await super.request(...arguments);
    } catch (err) {
      if (!this.supportsRefreshToken) throw err;
      // only handle auth errors (401 from provider), and only handle them if we have a (refresh) token
      const authTokenAfter = await _classPrivateFieldLooseBase(this, _getAuthToken)[_getAuthToken]();
      if (!err.isAuthError || !authTokenAfter) throw err;
      if (_classPrivateFieldLooseBase(this, _refreshingTokenPromise)[_refreshingTokenPromise] == null) {
        // Many provider requests may be starting at once, however refresh token should only be called once.
        // Once a refresh token operation has started, we need all other request to wait for this operation (atomically)
        _classPrivateFieldLooseBase(this, _refreshingTokenPromise)[_refreshingTokenPromise] = (async () => {
          try {
            this.uppy.log(`[CompanionClient] Refreshing expired auth token`, 'info');
            const response = await super.request({
              path: this.refreshTokenUrl(),
              method: 'POST'
            });
            await this.setAuthToken(response.uppyAuthToken);
          } catch (refreshTokenErr) {
            if (refreshTokenErr.isAuthError) {
              // if refresh-token has failed with auth error, delete token, so we don't keep trying to refresh in future
              await this.removeAuthToken();
            }
            throw err;
          } finally {
            _classPrivateFieldLooseBase(this, _refreshingTokenPromise)[_refreshingTokenPromise] = undefined;
          }
        })();
      }
      await _classPrivateFieldLooseBase(this, _refreshingTokenPromise)[_refreshingTokenPromise];

      // now retry the request with our new refresh token
      return super.request(...arguments);
    }
  }
  async fetchPreAuthToken() {
    if (!this.companionKeysParams) {
      return;
    }
    try {
      const res = await this.post(`${this.id}/preauth/`, {
        params: this.companionKeysParams
      });
      this.preAuthToken = res.token;
    } catch (err) {
      this.uppy.log(`[CompanionClient] unable to fetch preAuthToken ${err}`, 'warning');
    }
  }
  list(directory, options) {
    return this.get(`${this.id}/list/${directory || ''}`, options);
  }
  async logout(options) {
    const response = await this.get(`${this.id}/logout`, options);
    await this.removeAuthToken();
    return response;
  }
  static initPlugin(plugin,
  // any because static methods cannot use class generics
  opts, defaultOpts) {
    /* eslint-disable no-param-reassign */
    plugin.type = 'acquirer';
    plugin.files = [];
    if (defaultOpts) {
      plugin.opts = {
        ...defaultOpts,
        ...opts
      };
    }
    if (opts.serverUrl || opts.serverPattern) {
      throw new Error('`serverUrl` and `serverPattern` have been renamed to `companionUrl` and `companionAllowedHosts` respectively in the 0.30.5 release. Please consult the docs (for example, https://uppy.io/docs/instagram/ for the Instagram plugin) and use the updated options.`');
    }
    if (opts.companionAllowedHosts) {
      const pattern = opts.companionAllowedHosts;
      // validate companionAllowedHosts param
      if (typeof pattern !== 'string' && !Array.isArray(pattern) && !(pattern instanceof RegExp)) {
        throw new TypeError(`${plugin.id}: the option "companionAllowedHosts" must be one of string, Array, RegExp`);
      }
      plugin.opts.companionAllowedHosts = pattern;
    } else if (/^(?!https?:\/\/).*$/i.test(opts.companionUrl)) {
      var _opts$companionUrl;
      // does not start with https://
      plugin.opts.companionAllowedHosts = `https://${(_opts$companionUrl = opts.companionUrl) == null ? void 0 : _opts$companionUrl.replace(/^\/\//, '')}`;
    } else {
      plugin.opts.companionAllowedHosts = new URL(opts.companionUrl).origin;
    }
    plugin.storage = plugin.opts.storage || tokenStorage;
    /* eslint-enable no-param-reassign */
  }
}
async function _getAuthToken2() {
  return _classPrivateFieldLooseBase(this, _getPlugin)[_getPlugin]().storage.getItem(this.tokenKey);
}
function _getPlugin2() {
  const plugin = this.uppy.getPlugin(this.pluginId);
  if (plugin == null) throw new Error('Plugin was nullish');
  return plugin;
}