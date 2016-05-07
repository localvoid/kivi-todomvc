import {ComponentDescriptor, createVRoot} from "kivi";
import {state} from "../data";
import {Header} from "./header";
import {Main} from "./main";
import {Footer} from "./footer";

export const App = new ComponentDescriptor()
  .tagName("section")
  .init((c) => {
    c.subscribe(state.counters.onEntriesChange);
  })
  .update((c) => {
    const counters = state.counters;

    c.sync(createVRoot()
      .disableChildrenShapeError()
      .children(counters.entries > 0 ?
        [Header.createVNode(), Main.createVNode(), Footer.createVNode()] :
        [Header.createVNode()]));
  });
