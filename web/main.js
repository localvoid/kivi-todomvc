goog.provide('app.main');
goog.require('app.data.EntryStore');
goog.require('app.data.Settings');
goog.require('app.env');
goog.require('app.ui.app');
goog.require('kivi.injectComponent');
goog.require('kivi.router.setup');

app.env.settings = new app.data.Settings();
app.env.entries = new app.data.EntryStore();

kivi.router.setup([
  kivi.router.route('/completed', function() {
    console.log('completed');
    app.env.settings.setDisplay(app.data.DisplaySettings.SHOW_COMPLETED);
  }),
  kivi.router.route('/active', function() {
    console.log('active');
    app.env.settings.setDisplay(app.data.DisplaySettings.SHOW_ACTIVE);
  }),
  kivi.router.route('/', function() {
    console.log('all');
    app.env.settings.setDisplay(app.data.DisplaySettings.SHOW_ALL);
  })],
  '',
  function() {}
);

document.addEventListener('DOMContentLoaded', function() {
  kivi.start(function() {
    kivi.injectComponent(
        app.ui.app.Descriptor,
        null,
        /** @type {!Element} */(document.getElementById('todoapp'))
    );
  });
});
