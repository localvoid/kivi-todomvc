import {ComponentDescriptor} from "kivi";
import {state} from "../data";
import {Header} from "./header";
import {Main} from "./main";
import {Footer} from "./footer";

export const App = new ComponentDescriptor()
  .tagName("section")
  .attached((c) => {
    c.subscribe(state.counters.onEntriesChange);
  })
  .vRender((c, root) => {
    root.disableChildrenShapeError()
      .children(state.counters.entries > 0 ?
        [Header.createVNode().bindOnce(), Main.createVNode().bindOnce(), Footer.createVNode().bindOnce()] :
        [Header.createVNode().bindOnce()]);
  });
