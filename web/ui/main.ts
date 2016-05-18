import {ComponentDescriptor, createVElement} from "kivi";
import {store, ToggleAllMessage} from "../store";
import {EntryList} from "./entry_list";

export const Main = new ComponentDescriptor<void, void>()
  .tagName("section")
  .init((c) => {
    c.element.addEventListener("change", (e) => {
      if ((e.target as Element).id === "toggle-all") {
        store.send(ToggleAllMessage.create(store.state.counters.entriesCompleted !== store.state.counters.entries));
      }
      e.stopPropagation();
      e.preventDefault();
    });
  })
  .attached((c) => {
    c.subscribe(store.state.counters.onChange);
  })
  .update((c) => {
    c.vSync(c.createVRoot()
      .props({"id": "main"})
      .children([
        createVElement("input")
          .props({"type": "checkbox", "id": "toggle-all"})
          .checked(store.state.counters.entriesCompleted === store.state.counters.entries),
        EntryList.createVNode().bindOnce(),
      ]));
  });
