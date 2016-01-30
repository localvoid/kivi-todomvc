goog.provide('app.ui.header');
goog.provide('app.ui.header.tags');
goog.require('kivi.CDescriptor');
goog.require('kivi.Component');
goog.require('kivi.VNode');

goog.scope(function() {
  var VNode = kivi.VNode;

  /** @typedef {!kivi.Component<null, string>} */
  app.ui.header.Type;

  /** @const {!kivi.CDescriptor<null, string>} */
  app.ui.header.Descriptor = kivi.CDescriptor.create('app.ui.header');
  app.ui.header.Descriptor.tag = 'header';

  app.ui.header.tags.input = kivi.CTag.create('input').props({
    'id': 'new-todo',
    'type': 'text',
    'placeholder': 'What needs to be done',
    'autofocus': true
  });

  /** @param {!app.ui.header.Type} c */
  app.ui.header.Descriptor.init = function(c) {
    c.state = '';
    c.element.xtag = c;

    c.element.onkeydown = /** @param {Event} e */ function(e) {
      var c = /** @type {{xtag:!app.ui.header.Type}} */(e.currentTarget).xtag;

      if (e.keyCode === 13 && /** @type {Element} */(e.target).id === 'new-todo') {
        app.env.entries.addEntry(c.state);
        c.state = '';
        c.invalidate();
        e.preventDefault();
      }
    };

    c.element.oninput = /** @param {Event} e */ function(e) {
      var c = /** @type {{xtag:!app.ui.header.Type}} */(e.currentTarget).xtag;

      var t = /** @type {HTMLInputElement} */(e.target);
      if (t.id === 'new-todo') {
        c.state = t.value;
        c.invalidate();
      }
    };
  };

  /** @param {!app.ui.header.Type} c */
  app.ui.header.Descriptor.update = function(c) {
    c.syncVRoot(VNode.createRoot().children([
        VNode.createElement('h1').children('todos'),
        VNode.createElement(app.ui.header.tags.input).props({'value': c.state})
    ]));
  };

  /**
   * Create a VNode component for `app.ui.header`.
   *
   * @returns {!kivi.VNode}
   */
  app.ui.header.createVNode = function() {
    return VNode.createComponent(app.ui.header.Descriptor);
  };
});
