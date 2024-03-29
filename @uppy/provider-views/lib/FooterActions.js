import { h } from 'preact';
export default (_ref => {
  let {
    cancel,
    done,
    i18n,
    selected
  } = _ref;
  return h("div", {
    className: "uppy-ProviderBrowser-footer"
  }, h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary",
    onClick: done,
    type: "button"
  }, i18n('selectX', {
    smart_count: selected
  })), h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-link",
    onClick: cancel,
    type: "button"
  }, i18n('cancel')));
});