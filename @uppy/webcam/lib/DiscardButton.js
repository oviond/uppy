import { h } from 'preact';
function DiscardButton(_ref) {
  let {
    onDiscard,
    i18n
  } = _ref;
  return h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-Webcam-button uppy-Webcam-button--discard",
    type: "button",
    title: i18n('discardRecordedFile'),
    "aria-label": i18n('discardRecordedFile'),
    onClick: onDiscard,
    "data-uppy-super-focusable": true
  }, h("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 13 13",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon"
  }, h("g", {
    fill: "#FFF",
    fillRule: "evenodd"
  }, h("path", {
    d: "M.496 11.367L11.103.76l1.414 1.414L1.911 12.781z"
  }), h("path", {
    d: "M11.104 12.782L.497 2.175 1.911.76l10.607 10.606z"
  }))));
}
export default DiscardButton;