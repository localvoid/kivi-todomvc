import {ComponentDescriptor, createVCheckedInput} from "kivi";
import {state} from "../data";
import {EntryList} from "./entry_list";

export const Main = new ComponentDescriptor()
  .tagName("section")
  .init((c) => {
    c.element.addEventListener("change", (e) => {
      if ((e.target as Element).id === "toggle-all") {
        state.toggleAll(state.counters.entriesCompleted !== state.counters.entries);
      }
      e.stopPropagation();
      e.preventDefault();
    });
  })
  .attached((c) => {
    c.subscribe(state.counters.onChange);
  })
  .vRender((c, root) => {
    root.props({"id": "main"})
      .children([
        createVCheckedInput()
          .props({"type": "checkbox", "id": "toggle-all"})
          .checked(state.counters.entriesCompleted === state.counters.entries),
        EntryList.createVNode().bindOnce(),
      ]);
  });
