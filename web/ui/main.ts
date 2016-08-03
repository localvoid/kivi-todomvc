import {ComponentDescriptor, createVElement} from "kivi";
import {store} from "../store";
import {EntryList} from "./entry_list";

export const Main = new ComponentDescriptor<void, void>()
  .enableBackRef()
  .tagName("section");

const _onChange = Main.createDelegatedEventHandler("#toggle-all", false, (e) => {
  store.toggleAll(store.counters.entriesCompleted !== store.counters.entries);
  e.stopPropagation();
  e.preventDefault();
});

Main
  .init((c) => {
    (c.element as HTMLElement).onchange = _onChange;
  })
  .attached((c) => {
    c.subscribe(store.counters.onChange);
  })
  .update((c) => {
    c.sync(c.createVRoot()
      .props({"id": "main"})
      .children([
        createVElement("input")
          .props({"type": "checkbox", "id": "toggle-all"})
          .checked(store.counters.entriesCompleted === store.counters.entries),
        EntryList.createImmutableVNode(),
      ]));
  });
