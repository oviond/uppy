import { h } from 'preact';
import { useCallback } from 'preact/hooks';
function GoogleIcon() {
  return h("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 26 26",
    xmlns: "http://www.w3.org/2000/svg"
  }, h("g", {
    fill: "none",
    "fill-rule": "evenodd"
  }, h("circle", {
    fill: "#FFF",
    cx: "13",
    cy: "13",
    r: "13"
  }), h("path", {
    d: "M21.64 13.205c0-.639-.057-1.252-.164-1.841H13v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z",
    fill: "#4285F4",
    "fill-rule": "nonzero"
  }), h("path", {
    d: "M13 22c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H4.957v2.332A8.997 8.997 0 0013 22z",
    fill: "#34A853",
    "fill-rule": "nonzero"
  }), h("path", {
    d: "M7.964 14.71A5.41 5.41 0 017.682 13c0-.593.102-1.17.282-1.71V8.958H4.957A8.996 8.996 0 004 13c0 1.452.348 2.827.957 4.042l3.007-2.332z",
    fill: "#FBBC05",
    "fill-rule": "nonzero"
  }), h("path", {
    d: "M13 7.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C17.463 4.891 15.426 4 13 4a8.997 8.997 0 00-8.043 4.958l3.007 2.332C8.672 9.163 10.656 7.58 13 7.58z",
    fill: "#EA4335",
    "fill-rule": "nonzero"
  }), h("path", {
    d: "M4 4h18v18H4z"
  })));
}
const DefaultForm = _ref => {
  let {
    pluginName,
    i18n,
    onAuth
  } = _ref;
  // In order to comply with Google's brand we need to create a different button
  // for the Google Drive plugin
  const isGoogleDrive = pluginName === 'Google Drive';
  const onSubmit = useCallback(e => {
    e.preventDefault();
    onAuth();
  }, [onAuth]);
  return h("form", {
    onSubmit: onSubmit
  }, isGoogleDrive ? h("button", {
    type: "submit",
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Provider-authBtn uppy-Provider-btn-google",
    "data-uppy-super-focusable": true
  }, h(GoogleIcon, null), i18n('signInWithGoogle')) : h("button", {
    type: "submit",
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Provider-authBtn",
    "data-uppy-super-focusable": true
  }, i18n('authenticateWith', {
    pluginName
  })));
};
const defaultRenderForm = _ref2 => {
  let {
    pluginName,
    i18n,
    onAuth
  } = _ref2;
  return h(DefaultForm, {
    pluginName: pluginName,
    i18n: i18n,
    onAuth: onAuth
  });
};
function AuthView(props) {
  const {
    loading,
    pluginName,
    pluginIcon,
    i18n,
    handleAuth,
    renderForm = defaultRenderForm
  } = props;
  const pluginNameComponent = h("span", {
    className: "uppy-Provider-authTitleName"
  }, pluginName, h("br", null));
  return h("div", {
    className: "uppy-Provider-auth"
  }, h("div", {
    className: "uppy-Provider-authIcon"
  }, pluginIcon()), h("div", {
    className: "uppy-Provider-authTitle"
  }, i18n('authenticateWithTitle', {
    pluginName: pluginNameComponent
  })), h("div", {
    className: "uppy-Provider-authForm"
  }, renderForm({
    pluginName,
    i18n,
    loading,
    onAuth: handleAuth
  })));
}
export default AuthView;