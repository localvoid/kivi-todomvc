import {injectComponent} from "kivi";
import {Route, initRouter} from "./router";
import {store, DisplaySettings, SetDisplayMessage} from "./store";
import {App} from "./ui/app";

initRouter([
  new Route("/completed", () => {
    store.send(SetDisplayMessage.create(DisplaySettings.ShowCompleted));
  }),
  new Route("/active", () => {
    store.send(SetDisplayMessage.create(DisplaySettings.ShowActive));
  }),
  new Route("/", () => {
    store.send(SetDisplayMessage.create(DisplaySettings.ShowAll));
  }),
]);

document.addEventListener("DOMContentLoaded", () => {
  injectComponent(App, document.getElementById("todoapp"));
});
