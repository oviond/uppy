import { h } from 'preact';
import { useEffect, useState, useCallback } from 'preact/hooks';
import classNames from 'classnames';
import { nanoid } from 'nanoid/non-secure';
import getFileTypeIcon from "../../utils/getFileTypeIcon.js";
import ignoreEvent from '../../utils/ignoreEvent.js';
import FilePreview from "../FilePreview.js";
import RenderMetaFields from "./RenderMetaFields.js";
export default function FileCard(props) {
  var _getMetaFields;
  const {
    files,
    fileCardFor,
    toggleFileCard,
    saveFileCard,
    metaFields,
    requiredMetaFields,
    openFileEditor,
    i18n,
    i18nArray,
    className,
    canEditFile
  } = props;
  const getMetaFields = () => {
    return typeof metaFields === 'function' ? metaFields(files[fileCardFor]) : metaFields;
  };
  const file = files[fileCardFor];
  const computedMetaFields = (_getMetaFields = getMetaFields()) != null ? _getMetaFields : [];
  const showEditButton = canEditFile(file);
  const storedMetaData = {};
  computedMetaFields.forEach(field => {
    var _file$meta$field$id;
    storedMetaData[field.id] = (_file$meta$field$id = file.meta[field.id]) != null ? _file$meta$field$id : '';
  });
  const [formState, setFormState] = useState(storedMetaData);
  const handleSave = useCallback(ev => {
    ev.preventDefault();
    saveFileCard(formState, fileCardFor);
  }, [saveFileCard, formState, fileCardFor]);
  const updateMeta = (newVal, name) => {
    setFormState({
      ...formState,
      [name]: newVal
    });
  };
  const handleCancel = () => {
    toggleFileCard(false);
  };
  const [form] = useState(() => {
    const formEl = document.createElement('form');
    formEl.setAttribute('tabindex', '-1');
    formEl.id = nanoid();
    return formEl;
  });
  useEffect(() => {
    document.body.appendChild(form);
    form.addEventListener('submit', handleSave);
    return () => {
      form.removeEventListener('submit', handleSave);
      document.body.removeChild(form);
    };
  }, [form, handleSave]);
  return h("div", {
    className: classNames('uppy-Dashboard-FileCard', className),
    "data-uppy-panelType": "FileCard",
    onDragOver: ignoreEvent,
    onDragLeave: ignoreEvent,
    onDrop: ignoreEvent,
    onPaste: ignoreEvent
  }, h("div", {
    className: "uppy-DashboardContent-bar"
  }, h("div", {
    className: "uppy-DashboardContent-title",
    role: "heading",
    "aria-level": "1"
  }, i18nArray('editing', {
    file: h("span", {
      className: "uppy-DashboardContent-titleFile"
    }, file.meta ? file.meta.name : file.name)
  })), h("button", {
    className: "uppy-DashboardContent-back",
    type: "button",
    form: form.id,
    title: i18n('finishEditingFile'),
    onClick: handleCancel
  }, i18n('cancel'))), h("div", {
    className: "uppy-Dashboard-FileCard-inner"
  }, h("div", {
    className: "uppy-Dashboard-FileCard-preview",
    style: {
      backgroundColor: getFileTypeIcon(file.type).color
    }
  }, h(FilePreview, {
    file: file
  }), showEditButton && h("button", {
    type: "button",
    className: "uppy-u-reset uppy-c-btn uppy-Dashboard-FileCard-edit",
    onClick: event => {
      // When opening the image editor we want to save any meta fields changes.
      // Otherwise it's confusing for the user to click save in the editor,
      // but the changes here are discarded. This bypasses validation,
      // but we are okay with that.
      handleSave(event);
      openFileEditor(file);
    }
  }, i18n('editImage'))), h("div", {
    className: "uppy-Dashboard-FileCard-info"
  }, h(RenderMetaFields, {
    computedMetaFields: computedMetaFields,
    requiredMetaFields: requiredMetaFields,
    updateMeta: updateMeta,
    form: form,
    formState: formState
  })), h("div", {
    className: "uppy-Dashboard-FileCard-actions"
  }, h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Dashboard-FileCard-actionsBtn"
    // If `form` attribute is supported, we want a submit button to trigger the form validation.
    // Otherwise, fallback to a classic button with a onClick event handler.
    ,
    type: "submit",
    form: form.id
  }, i18n('saveChanges')), h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-link uppy-Dashboard-FileCard-actionsBtn",
    type: "button",
    onClick: handleCancel,
    form: form.id
  }, i18n('cancel')))));
}