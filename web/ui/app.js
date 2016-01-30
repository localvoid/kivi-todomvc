goog.provide('app.ui.app');
goog.require('app.data.EntryStore');
goog.require('app.ui.footer');
goog.require('app.ui.header');
goog.require('app.ui.main');
goog.require('kivi.CDescriptor');
goog.require('kivi.Component');
goog.require('kivi.VNode');

goog.scope(function() {
  var VNode = kivi.VNode;
  var $e = VNode.createElement;
  var $t = VNode.createText;

  /** @typedef {!kivi.Component<null, null>} */
  app.ui.app.Type;

  /** @const {!kivi.CDescriptor<null, null>} */
  app.ui.app.Descriptor = kivi.CDescriptor.create('app.ui.app');
  app.ui.app.Descriptor.tag = kivi.CTag.create('section');

  /** @param {!app.ui.app.Type} c */
  app.ui.app.Descriptor.init = function(c) {
    c.subscribe(app.env.entries.onChange);
    c.subscribe(app.env.settings.onChange);
  };

  /** @param {!app.ui.app.Type} c */
  app.ui.app.Descriptor.update = function(c) {
    var entries = app.env.entries.items;
    var showEntries = app.env.settings.showEntries;
    var entry;
    var i;
    var completed = 0;

    var shownEntries;

    if (showEntries === app.data.DisplaySettings.SHOW_ACTIVE) {
      shownEntries = [];
      for (i = 0; i < entries.length; i++) {
        entry = entries[i];
        if (entry.completed) {
          completed++;
        } else {
          shownEntries.push(entry);
        }
      }
    } else if (showEntries === app.data.DisplaySettings.SHOW_COMPLETED) {
      shownEntries = [];
      for (i = 0; i < entries.length; i++) {
        entry = entries[i];
        if (entry.completed) {
          completed++;
          shownEntries.push(entry);
        }
      }
    } else {
      shownEntries = [];
      for (i = 0; i < entries.length; i++) {
        entry = entries[i];
        shownEntries.push(entry);
        if (entry.completed) {
          completed++;
        }
      }
    }
    var active = entries.length - completed;

    var children = [];
    children.push(app.ui.header.createVNode());
    if (entries.length > 0) {
      children.push(app.ui.main.createVNode(shownEntries, active));
    }
    if (active > 0 || completed > 0) {
      children.push(app.ui.footer.createVNode(showEntries, completed, active));
    }

    c.syncVRoot(VNode.createRoot().disableChildrenShapeError().children(children));
  };

  /**
   * Create a VNode component for `app.ui.app`.
   *
   * @returns {!kivi.VNode}
   */
  app.ui.app.createVNode = function() {
    return VNode.createComponent(app.ui.app.Descriptor);
  };
});
