goog.provide('app.ui.entry');
goog.provide('app.ui.entry.tags');
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
   * @constructor
   * @struct
   * @final
   */
  app.ui.entry.State = function() {
    this.editing = false;
    /** @type {?string} */
    this.editingTitle = null;
    /** @type {?VNode} */
    this.input = null;
  };

  /** @typedef {!kivi.Component<?app.data.Entry, ?app.ui.entry.State>} */
  app.ui.entry.Type;

  /** @const {!kivi.CDescriptor<?app.data.Entry, ?app.ui.entry.State>} */
  app.ui.entry.Descriptor = kivi.CDescriptor.create('app.ui.entry');
  app.ui.entry.Descriptor.tag = CTag.create('li');
  app.ui.entry.tags.input = CTag.create('input').classes('edit').props({'type': 'text'});
  app.ui.entry.tags.toggle = CTag.create('input').props({'type': 'checkbox'}).classes('toggle');

  /** @param {!app.ui.entry.Type} c */
  app.ui.entry.Descriptor.init = function(c) {
    c.state = new app.ui.entry.State();
    c.element.xtag = c;
  };

  /**
   * @param {!app.ui.entry.Type} c
   * @param {?app.data.Entry} newData
   */
  app.ui.entry.Descriptor.setData = function(c, newData) {
    c.data = newData;
    c.markDirty();
  };

  /** @param {!app.ui.entry.Type} c */
  app.ui.entry.Descriptor.update = function(c) {
    var entry = c.data;

    var rootClasses;
    if (c.state.editing) {
      rootClasses = entry.completed ? 'editing completed' : 'editing';
    } else {
      rootClasses = entry.completed ? 'completed' : null;
    }

    var view = $e('div').classes('view').children([
        VNode.createCheckedInput(app.ui.entry.tags.toggle).checked(entry.completed),
        $e('label').children(entry.title),
        $e('button').classes('destroy')
    ]);

    var children;
    if (c.state.editing) {
      var input = c.state.input = $e(app.ui.entry.tags.input).props({'value': c.state.editingTitle});
      children = [view, input];
    } else {
      children = [view];
      c.state.input = null;
    }


    c.syncVRoot(VNode.createRoot().classes(rootClasses).disableChildrenShapeError().children(children));
  };

  /**
   * Create a VNode component for `app.ui.entry`.
   *
   * @param {!app.data.Entry} item
   * @returns {!kivi.VNode}
   */
  app.ui.entry.createVNode = function(item) {
    return VNode.createComponent(app.ui.entry.Descriptor, item);
  };

  /**
   *
   * @param {!app.ui.entry.Type} entry
   */
  app.ui.entry.startEdit = function(entry) {
    entry.state.editing = true;
    entry.state.editingTitle = entry.data.title;
    kivi.nextFrame().after(function() {
      /** @type {!HTMLInputElement} */(entry.state.input.ref).focus()
    });
    entry.invalidate();
  };

  /**
   *
   * @param {!app.ui.entry.Type} entry
   */
  app.ui.entry.stopEdit = function(entry) {
    entry.state.editing = false;
    entry.state.editingTitle = null;
    entry.invalidate();
  };
});
