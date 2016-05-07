import {injectComponent} from "kivi";
import {Route, initRouter} from "./router";
import {state, DisplaySettings} from "./data";
import {App} from "./ui/app";

initRouter([
  new Route("/completed", () => {
    state.setDisplay(DisplaySettings.ShowCompleted);
  }),
  new Route("/active", () => {
    state.setDisplay(DisplaySettings.ShowActive);
  }),
  new Route("/", () => {
    state.setDisplay(DisplaySettings.ShowAll);
  }),
]);

document.addEventListener("DOMContentLoaded", () => {
  injectComponent(App, document.getElementById("todoapp"));
});
