import { h } from 'preact';
import FilePreview from "../../FilePreview.js";
import MetaErrorMessage from "../MetaErrorMessage.js";
import getFileTypeIcon from "../../../utils/getFileTypeIcon.js";
export default function FilePreviewAndLink(props) {
  const {
    file,
    i18n,
    toggleFileCard,
    metaFields,
    showLinkToFileUploadResult
  } = props;
  const white = 'rgba(255, 255, 255, 0.5)';
  const previewBackgroundColor = file.preview ? white : getFileTypeIcon(props.file.type).color;
  return h("div", {
    className: "uppy-Dashboard-Item-previewInnerWrap",
    style: {
      backgroundColor: previewBackgroundColor
    }
  }, showLinkToFileUploadResult && file.uploadURL && h("a", {
    className: "uppy-Dashboard-Item-previewLink",
    href: file.uploadURL,
    rel: "noreferrer noopener",
    target: "_blank",
    "aria-label": file.meta.name
  }, h("span", {
    hidden: true
  }, file.meta.name)), h(FilePreview, {
    file: file
  }), h(MetaErrorMessage, {
    file: file,
    i18n: i18n,
    toggleFileCard: toggleFileCard,
    metaFields: metaFields
  }));
}