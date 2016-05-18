import {ComponentDescriptor} from "kivi";
import {store} from "../store";
import {Header} from "./header";
import {Main} from "./main";
import {Footer} from "./footer";

export const App = new ComponentDescriptor<void, void>()
  .tagName("section")
  .attached((c) => {
    c.subscribe(store.state.counters.onEntriesChange);
  })
  .update((c) => {
    c.vSync(c.createVRoot().disableChildrenShapeError()
      .children(store.state.counters.entries > 0 ?
        [Header.createVNode().bindOnce(), Main.createVNode().bindOnce(), Footer.createVNode().bindOnce()] :
        [Header.createVNode().bindOnce()]));

  });
