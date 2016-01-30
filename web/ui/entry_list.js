goog.provide('app.ui.entry_list');
goog.provide('app.ui.entry_list.tags');
goog.require('app.ui.entry');
goog.require('kivi.CDescriptor');
goog.require('kivi.CTag');
goog.require('kivi.Component');
goog.require('kivi.VNode');

goog.scope(function() {
  var VNode = kivi.VNode;
  var CTag = kivi.CTag;
  var $e = VNode.createElement;
  var $t = VNode.createText;

  /** @typedef {!kivi.Component<?Array<!app.data.Entry>, null>} */
  app.ui.entry_list.Type;

  /** @const {!kivi.CDescriptor<?Array<!app.data.Entry>, null>} */
  app.ui.entry_list.Descriptor = kivi.CDescriptor.create('app.ui.entry_list');
  app.ui.entry_list.Descriptor.tag = CTag.create('ul').props({'id': 'todo-list'});

  /** @param {!app.ui.entry_list.Type} c */
  app.ui.entry_list.Descriptor.init = function(c) {
    c.element.onkeydown = /** @param {Event} e */ function(e) {
      var t = /** @type {Element} */(e.target);
      if (t.classList.contains('edit')) {
        var entryElement;
        var entry;
        if (e.keyCode === 13) {
          entryElement = /** @type {{xtag: !app.ui.entry.Type}} */(t.parentNode);
          entry = entryElement.xtag;
          app.env.entries.updateTitle(
              /** @type {!app.data.Entry} */(entry.data),
              /** @type {!HTMLInputElement} */(entry.state.input.ref).value);
          app.ui.entry.stopEdit(entry);
        } else if (e.keyCode === 27) {
          entryElement = /** @type {{xtag: !app.ui.entry.Type}} */(t.parentNode);
          entry = entryElement.xtag;
          app.ui.entry.stopEdit(entry);
        }
      }
    };
    c.element.ondblclick = /** @param {Event} e */ function(e) {
      var t = /** @type {Element} */(e.target);
      if (t.tagName === 'LABEL') {
        var entryElement = /** @type {{xtag: !app.ui.entry.Type}} */(t.parentNode.parentNode);
        var entry = entryElement.xtag;
        app.ui.entry.startEdit(entry);
      }
    };

    c.element.addEventListener('focusout', function(e) {
      var t = /** @type {Element} */(e.target);
      if (t.classList.contains('edit')) {
        var entryElement = /** @type {{xtag: !app.ui.entry.Type}} */(t.parentNode);
        var entry = entryElement.xtag;
        app.ui.entry.stopEdit(entry);
      }
    });

    c.element.onclick = /** @param {Event} e */ function(e) {
      var t = /** @type {Element} */(e.target);
      if (t.classList.contains('destroy')) {
        var entryElement = /** @type {{xtag: !app.ui.entry.Type}} */(t.parentNode.parentNode);
        var entry = entryElement.xtag;
        app.env.entries.removeEntry(/** @type {!app.data.Entry} */(entry.data));
      }
    };

    c.element.onchange = /** @param {Event} e */ function(e) {
      var t = /** @type {Element} */(e.target);
      if (t.classList.contains('toggle')) {
        var entryElement = /** @type {{xtag: !app.ui.entry.Type}} */(t.parentNode.parentNode);
        var entry = entryElement.xtag;
        app.env.entries.toggleEntry(/** @type {!app.data.Entry} */(entry.data));
      }
    };
  };

  /** @param {!app.ui.entry_list.Type} c */
  app.ui.entry_list.Descriptor.update = function(c) {
    var entries = c.data;

    var children = new Array(entries.length);
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      children[i] = app.ui.entry.createVNode(entry).key(entry.id);
    }

    c.syncVRoot(VNode.createRoot().trackByKey().children(children));
  };

  /**
   * Create a VNode component for `app.ui.entry_list`.
   *
   * @param {?Array<!app.data.Entry>} entries
   * @returns {!kivi.VNode}
   */
  app.ui.entry_list.createVNode = function(entries) {
    return VNode.createComponent(app.ui.entry_list.Descriptor, entries);
  };
});
