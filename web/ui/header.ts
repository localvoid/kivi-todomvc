import {ComponentDescriptor, createVElement} from "kivi";
import {store} from "../store";

export const Header = new ComponentDescriptor<void, {inputValue: string}>()
  .enableBackRef()
  .tagName("header");

const _onKeyDown = Header.createDelegatedEventHandler("#new-todo", false, (e, c, props, state) => {
  if ((e as KeyboardEvent).keyCode === 13) {
    store.addEntry(state.inputValue);
    state.inputValue = "";
    c.invalidate();
  }
});

const _onInput = Header.createDelegatedEventHandler("#new-todo", false, (e, c, props, state) => {
  state.inputValue = (e.target as HTMLInputElement).value;
  c.invalidate();
});

Header
  .init((c, props) => {
    c.state = {inputValue: ""};
    (c.element as HTMLElement).onkeydown = _onKeyDown;
    (c.element as HTMLElement).oninput = _onInput;
  })
  .update((c, props, state) => {
    c.sync(c.createVRoot()
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
