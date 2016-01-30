goog.provide('app.ui.footer');
goog.provide('app.ui.footer.tags');
goog.require('kivi.CDescriptor');
goog.require('kivi.CTag');
goog.require('kivi.Component');

goog.scope(function() {
  var VNode = kivi.VNode;
  var CTag = kivi.CTag;
  var $e = VNode.createElement;
  var $t = VNode.createText;

  /**
   *
   * @param {app.data.DisplaySettings} showEntries
   * @param {number} completed
   * @param {number} active
   * @constructor
   * @struct
   * @final
   */
  app.ui.footer.Data = function(showEntries, completed, active) {
    this.showEntries = showEntries;
    this.completedCounter = completed;
    this.activeCounter = active;
  };

  /** @typedef {!kivi.Component<?app.ui.footer.Data, null>} */
  app.ui.footer.Type;

  app.ui.footer.tags.filters = CTag.create('ul').props({'id': 'filters'});
  app.ui.footer.tags.allFilter = CTag.create('a').props({'href': '#!/'});
  app.ui.footer.tags.activeFilter = CTag.create('a').props({'href': '#!/active'});
  app.ui.footer.tags.completedFilter = CTag.create('a').props({'href': '#!/completed'});
  app.ui.footer.tags.counter = CTag.create('span').props({'id': 'todo-count'});
  app.ui.footer.tags.clearButton = CTag.create('button').props({'id': 'clear-completed'});

  /** @const {!kivi.CDescriptor<?app.ui.footer.Data, null>} */
  app.ui.footer.Descriptor = kivi.CDescriptor.create('app.ui.footer');
  app.ui.footer.Descriptor.tag = kivi.CTag.create('footer').props({'id': 'footer'});

  /** @param {!app.ui.footer.Type} c */
  app.ui.footer.Descriptor.init = function(c) {
    c.element.onclick = /** @param {Event} e */ function(e) {
      var t = /** @type {!Element} */(e.target);
      if (t.id === 'clear-completed') {
        app.env.entries.clearCompleted();
        e.preventDefault();
        e.stopPropagation();
      }
    };
  };

  /** @param {!app.ui.footer.Type} c */
  app.ui.footer.Descriptor.update = function(c) {
    var children = [];
    var showEntries = c.data.showEntries;
    var completed = c.data.completedCounter;
    var active = c.data.activeCounter;

    children.push($e(app.ui.footer.tags.filters).children([
      $e('li').children([
        $e(app.ui.footer.tags.allFilter)
            .classes(showEntries === app.data.DisplaySettings.SHOW_ALL ? 'selected' : null)
            .children('All')
      ]),
      $t(' '),
      $e('li').children([
        $e(app.ui.footer.tags.activeFilter)
            .classes(showEntries === app.data.DisplaySettings.SHOW_ACTIVE ? 'selected' : null)
            .children('Active')
      ]),
      $t(' '),
      $e('li').children([
        $e(app.ui.footer.tags.completedFilter)
            .classes(showEntries === app.data.DisplaySettings.SHOW_COMPLETED ? 'selected' : null)
            .children('Completed')
      ])
    ]));

    children.push($e(app.ui.footer.tags.counter).children([
      $e('strong').children(active.toString()),
      $t(active > 1 ? ' items left' : ' item left')
    ]));

    if (completed > 0) {
      children.push($e(app.ui.footer.tags.clearButton).children('Clear completed (' + completed + ')'));
    }

    c.syncVRoot(VNode.createRoot().disableChildrenShapeError().children(children));
  };

  /**
   * Create a VNode component for `app.ui.footer`.
   *
   * @param {app.data.DisplaySettings} showEntries
   * @param {number} completed
   * @param {number} active
   * @returns {!kivi.VNode}
   */
  app.ui.footer.createVNode = function(showEntries, completed, active) {
    return VNode.createComponent(app.ui.footer.Descriptor, new app.ui.footer.Data(showEntries, completed, active));
  };
});
