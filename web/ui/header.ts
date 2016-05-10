import {ComponentDescriptor, createVElement, createVTextInput} from "kivi";
import {state} from "../data";

export const Header = new ComponentDescriptor<any, string, any>()
  .tagName("header")
  .init((c) => {
    c.state = "";

    c.element.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.keyCode === 13 && (e.target as HTMLElement).id === "new-todo") {
        state.addEntry(c.state);
        c.setState("");
      }
    });
    c.element.addEventListener("input", (e) => {
      if ((e.target as HTMLElement).id === "new-todo") {
        c.setState((e.target as HTMLInputElement).value);
      }
    });
  })
  .vRender((c, root) => {
    root.children([
      createVElement("h1").children("todos"),
      createVTextInput()
        .props({
          "id": "new-todo",
          "type": "text",
          "placeholder": "What needs to be done",
          "autofocus": true,
        })
        .value(c.state),
    ]);
  });
