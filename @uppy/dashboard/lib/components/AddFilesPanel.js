import { h } from 'preact';
import classNames from 'classnames';
import AddFiles from "./AddFiles.js";
const AddFilesPanel = props => {
  return h("div", {
    className: classNames('uppy-Dashboard-AddFilesPanel', props.className),
    "data-uppy-panelType": "AddFiles",
    "aria-hidden": !props.showAddFilesPanel
  }, h("div", {
    className: "uppy-DashboardContent-bar"
  }, h("div", {
    className: "uppy-DashboardContent-title",
    role: "heading",
    "aria-level": "1"
  }, props.i18n('addingMoreFiles')), h("button", {
    className: "uppy-DashboardContent-back",
    type: "button",
    onClick: () => props.toggleAddFilesPanel(false)
  }, props.i18n('back'))), h(AddFiles, props));
};
export default AddFilesPanel;