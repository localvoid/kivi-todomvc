goog.provide('app.data.Entry');
goog.provide('app.data.EntryStore');

/**
 * Entry
 *
 * @param {number} id
 * @param {string} title
 * @param {boolean} completed
 * @constructor
 * @struct
 * @final
 */
app.data.Entry = function(id, title, completed) {
  this.id = id.toString();
  this.title = title;
  this.completed = completed;
};

/**
 * Entry Store
 *
 * @constructor
 * @struct
 * @final
 */
app.data.EntryStore = function() {
  this._nextEntryId = 0;

  /** @type {!Array<!app.data.Entry>} */
  this.items = [];
  this.onChange = new kivi.Invalidator();
};

/**
 * Create a new Entry object.
 *
 * @param {string} title
 * @returns {!app.data.Entry}
 */
app.data.EntryStore.prototype.createEntry = function(title) {
  return new app.data.Entry(this._nextEntryId++, title, false)
};

/**
 * Add new Entry.
 *
 * @param {string} title
 */
app.data.EntryStore.prototype.addEntry = function(title) {
  title = title.trim();
  if (title !== '') {
    this.items.push(this.createEntry(title));
  }
  this.onChange.invalidate();
};

/**
 * Update title of the Entry.
 *
 * @param {!app.data.Entry} entry
 * @param {string} title
 */
app.data.EntryStore.prototype.updateTitle = function(entry, title) {
  title = title.trim();
  if (title === '') {
    this.removeEntry(entry);
  } else {
    entry.title = title;
    this.onChange.invalidate();
  }
};

/**
 * Remove Entry.
 *
 * @param {!app.data.Entry} entry
 */
app.data.EntryStore.prototype.removeEntry = function(entry) {
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (item === entry) {
      this.items.splice(i, 1);
      this.onChange.invalidate();
      return;
    }
  }
};

/**
 * Toggle "completed" status for all entries.
 *
 * @param {boolean} checked
 */
app.data.EntryStore.prototype.toggleAll = function(checked) {
  for (var i = 0; i < this.items.length; i++) {
    this.items[i].completed = checked;
  }
  this.onChange.invalidate();
};

/**
 * Toggle "completed" status of the Entry.
 *
 * @param {!app.data.Entry} entry
 */
app.data.EntryStore.prototype.toggleEntry = function(entry) {
  entry.completed = !entry.completed;
  this.onChange.invalidate();
};

/**
 * Remove entries with "completed" status toggled "on".
 */
app.data.EntryStore.prototype.clearCompleted = function() {
  var newItems = [];
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (!item.completed) {
      newItems.push(item);
    }
  }
  this.items = newItems;
  this.onChange.invalidate();
};
