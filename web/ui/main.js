goog.provide('app.ui.main');
goog.provide('app.ui.main.tags');
goog.require('app.ui.entry_list');
goog.require('kivi.CDescriptor');
goog.require('kivi.CTag');
goog.require('kivi.Component');
goog.require('kivi.VNode');

goog.scope(function() {
  var VNode = kivi.VNode;
  var CTag = kivi.CTag;
  var $e = VNode.createElement;
  var $t = VNode.createText;

  /**
   *
   * @param {!Array<!app.data.Entry>} entries
   * @param {number} activeCount
   * @constructor
   * @struct
   * @final
   */
  app.ui.main.Data = function(entries, activeCount) {
    this.entries = entries;
    this.activeCount = activeCount;
  };

  /** @typedef {!kivi.Component<?app.ui.main.Data, null>} */
  app.ui.main.Type;

  /** @const {!kivi.CDescriptor<?app.ui.main.Data, null>} */
  app.ui.main.Descriptor = kivi.CDescriptor.create('app.ui.main');
  app.ui.main.Descriptor.tag = CTag.create('section').props({'id': 'main'});
  app.ui.main.tags.toggle = CTag.create('input').props({'type': 'checkbox', 'id': 'toggle-all'});

  /** @param {!app.ui.main.Type} c */
  app.ui.main.Descriptor.init = function(c) {
    c.element.onchange = /** @param {Event} e */ function(e) {
      var t = /** @type {Element} */(e.target);
      if (t.id === 'toggle-all') {
        app.env.entries.toggleAll(!(c.data.activeCount === 0));
      }
      e.stopPropagation();
      e.preventDefault();
    };
  };

  /** @param {!app.ui.main.Type} c */
  app.ui.main.Descriptor.update = function(c) {
    c.syncVRoot(VNode.createRoot().children([
        VNode.createCheckedInput(app.ui.main.tags.toggle).checked(c.data.activeCount === 0),
        app.ui.entry_list.createVNode(c.data.entries)
    ]));
  };

  /**
   * Create a VNode component for `app.ui.main`.
   *
   * @param {!Array<!app.data.Entry>} entries
   * @param {number} activeCount
   * @returns {!kivi.VNode}
   */
  app.ui.main.createVNode = function(entries, activeCount) {
    return VNode.createComponent(app.ui.main.Descriptor, new app.ui.main.Data(entries, activeCount));
  };
});
