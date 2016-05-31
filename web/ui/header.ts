import {ComponentDescriptor, createVElement} from "kivi";
import {store, AddEntryMessage} from "../store";

export const Header = new ComponentDescriptor<void, {inputValue: string}>()
  .enableBackRef()
  .tagName("header");

const _onKeyDown = Header.createDelegatedEventHandler("#new-todo", false, (e, c, props, state) => {
  if ((e as KeyboardEvent).keyCode === 13) {
    store.send(AddEntryMessage.create(state.inputValue));
    state.inputValue = "";
    c.invalidate();
  }
});

const _onInput = Header.createDelegatedEventHandler("#new-todo", false, (e, c, props, state) => {
  state.inputValue = (e.target as HTMLInputElement).value;
  c.invalidate();
});

Header
  .createState((c) => ({inputValue: ""}))
  .init((c, props, state) => {
    (c.element as HTMLElement).onkeydown = _onKeyDown;
    (c.element as HTMLElement).oninput = _onInput;
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
