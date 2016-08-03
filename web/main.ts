import {injectComponent} from "kivi";
import {Route, initRouter} from "./router";
import {store, DisplaySettings} from "./store";
import {App} from "./ui/app";

initRouter([
  new Route("/completed", () => {
    store.setDisplay(DisplaySettings.ShowCompleted);
  }),
  new Route("/active", () => {
    store.setDisplay(DisplaySettings.ShowActive);
  }),
  new Route("/", () => {
    store.setDisplay(DisplaySettings.ShowAll);
  }),
]);

document.addEventListener("DOMContentLoaded", () => {
  injectComponent(App, document.getElementById("todoapp"));
});
