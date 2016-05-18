import {ComponentDescriptor, createVElement} from "kivi";
import {store, AddEntryMessage} from "../store";

export const Header = new ComponentDescriptor<void, {inputValue: string}>()
  .tagName("header")
  .createState((c) => ({inputValue: ""}))
  .init((c, props, state) => {
    c.element.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.keyCode === 13 && (e.target as HTMLElement).id === "new-todo") {
        store.send(AddEntryMessage.create(state.inputValue));
        state.inputValue = "";
        c.invalidate();
      }
    });
    c.element.addEventListener("input", (e) => {
      if ((e.target as HTMLElement).id === "new-todo") {
        state.inputValue = (e.target as HTMLInputElement).value;
        c.invalidate();
      }
    });
  })
  .update((c, props, state) => {
    c.vSync(c.createVRoot()
      .children([
        createVElement("h1").children("todos"),
        createVElement("input")
          .props({
            "id": "new-todo",
            "type": "text",
            "placeholder": "What needs to be done",
            "autofocus": true,
          })
          .value(state.inputValue),
      ]));
  });
