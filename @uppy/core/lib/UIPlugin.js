function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
/* eslint-disable class-methods-use-this */
import { render } from 'preact';
import findDOMElement from '@uppy/utils/lib/findDOMElement';
import getTextDirection from '@uppy/utils/lib/getTextDirection';
import BasePlugin from "./BasePlugin.js";
/**
 * Defer a frequent call to the microtask queue.
 */
function debounce(fn) {
  let calling = null;
  let latestArgs;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    latestArgs = args;
    if (!calling) {
      calling = Promise.resolve().then(() => {
        calling = null;
        // At this point `args` may be different from the most
        // recent state, if multiple calls happened since this task
        // was queued. So we use the `latestArgs`, which definitely
        // is the most recent call.
        return fn(...latestArgs);
      });
    }
    return calling;
  };
}

/**
 * UIPlugin is the extended version of BasePlugin to incorporate rendering with Preact.
 * Use this for plugins that need a user interface.
 *
 * For plugins without an user interface, see BasePlugin.
 */
var _updateUI = /*#__PURE__*/_classPrivateFieldLooseKey("updateUI");
class UIPlugin extends BasePlugin {
  constructor() {
    super(...arguments);
    Object.defineProperty(this, _updateUI, {
      writable: true,
      value: void 0
    });
  }
  getTargetPlugin(target // eslint-disable-line no-use-before-define
  ) {
    let targetPlugin;
    if (typeof (target == null ? void 0 : target.addTarget) === 'function') {
      // Targeting a plugin *instance*
      targetPlugin = target;
      if (!(targetPlugin instanceof UIPlugin)) {
        // eslint-disable-next-line no-console
        console.warn(new Error('The provided plugin is not an instance of UIPlugin. This is an indication of a bug with the way Uppy is bundled.', {
          cause: {
            targetPlugin,
            UIPlugin
          }
        }));
      }
    } else if (typeof target === 'function') {
      // Targeting a plugin type
      const Target = target;
      // Find the target plugin instance.
      this.uppy.iteratePlugins(p => {
        if (p instanceof Target) {
          targetPlugin = p;
        }
      });
    }
    return targetPlugin;
  }

  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   */
  mount(target,
  // eslint-disable-line no-use-before-define
  plugin) {
    const callerPluginName = plugin.id;
    const targetElement = findDOMElement(target);
    if (targetElement) {
      this.isTargetDOMEl = true;
      // When target is <body> with a single <div> element,
      // Preact thinks it’s the Uppy root element in there when doing a diff,
      // and destroys it. So we are creating a fragment (could be empty div)
      const uppyRootElement = document.createElement('div');
      uppyRootElement.classList.add('uppy-Root');

      // API for plugins that require a synchronous rerender.
      _classPrivateFieldLooseBase(this, _updateUI)[_updateUI] = debounce(state => {
        // plugin could be removed, but this.rerender is debounced below,
        // so it could still be called even after uppy.removePlugin or uppy.close
        // hence the check
        if (!this.uppy.getPlugin(this.id)) return;
        render(this.render(state), uppyRootElement);
        this.afterUpdate();
      });
      this.uppy.log(`Installing ${callerPluginName} to a DOM element '${target}'`);
      if (this.opts.replaceTargetContent) {
        // Doing render(h(null), targetElement), which should have been
        // a better way, since because the component might need to do additional cleanup when it is removed,
        // stopped working — Preact just adds null into target, not replacing
        targetElement.innerHTML = '';
      }
      render(this.render(this.uppy.getState()), uppyRootElement);
      this.el = uppyRootElement;
      targetElement.appendChild(uppyRootElement);

      // Set the text direction if the page has not defined one.
      uppyRootElement.dir = this.opts.direction || getTextDirection(uppyRootElement) || 'ltr';
      this.onMount();
      return this.el;
    }
    const targetPlugin = this.getTargetPlugin(target);
    if (targetPlugin) {
      this.uppy.log(`Installing ${callerPluginName} to ${targetPlugin.id}`);
      this.parent = targetPlugin;
      this.el = targetPlugin.addTarget(plugin);
      this.onMount();
      return this.el;
    }
    this.uppy.log(`Not installing ${callerPluginName}`);
    let message = `Invalid target option given to ${callerPluginName}.`;
    if (typeof target === 'function') {
      message += ' The given target is not a Plugin class. ' + "Please check that you're not specifying a React Component instead of a plugin. " + 'If you are using @uppy/* packages directly, make sure you have only 1 version of @uppy/core installed: ' + 'run `npm ls @uppy/core` on the command line and verify that all the versions match and are deduped correctly.';
    } else {
      message += 'If you meant to target an HTML element, please make sure that the element exists. ' + 'Check that the <script> tag initializing Uppy is right before the closing </body> tag at the end of the page. ' + '(see https://github.com/transloadit/uppy/issues/1042)\n\n' + 'If you meant to target a plugin, please confirm that your `import` statements or `require` calls are correct.';
    }
    throw new Error(message);
  }

  /**
   * Called when plugin is mounted, whether in DOM or into another plugin.
   * Needed because sometimes plugins are mounted separately/after `install`,
   * so this.el and this.parent might not be available in `install`.
   * This is the case with @uppy/react plugins, for example.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(state) {
    throw new Error('Extend the render method to add your plugin to a DOM element');
  }
  update(state) {
    if (this.el != null) {
      var _classPrivateFieldLoo, _classPrivateFieldLoo2;
      (_classPrivateFieldLoo = (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(this, _updateUI))[_updateUI]) == null || _classPrivateFieldLoo.call(_classPrivateFieldLoo2, state);
    }
  }
  unmount() {
    if (this.isTargetDOMEl) {
      var _this$el;
      (_this$el = this.el) == null || _this$el.remove();
    }
    this.onUnmount();
  }
  onMount() {}
  onUnmount() {}
}
export default UIPlugin;