goog.provide('app.data.DisplaySettings');
goog.provide('app.data.Settings');

/**
 * Display Settings
 *
 * @enum {number}
 */
app.data.DisplaySettings = {
  SHOW_ALL: 0,
  SHOW_ACTIVE: 1,
  SHOW_COMPLETED: 2
};

/**
 * Settings
 *
 * @constructor
 * @struct
 * @final
 */
app.data.Settings = function() {
  this.showEntries = app.data.DisplaySettings.SHOW_ALL;
  this.onChange = new kivi.Invalidator();
};

/**
 * Set Display.
 *
 * @param {app.data.DisplaySettings} v
 */
app.data.Settings.prototype.setDisplay = function(v) {
  this.showEntries = v;
  this.onChange.invalidate();
};
