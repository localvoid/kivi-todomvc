import {ComponentDescriptor} from "kivi";
import {store} from "../store";
import {Header} from "./header";
import {Main} from "./main";
import {Footer} from "./footer";

export const App = new ComponentDescriptor<void, void>()
  .tagName("section")
  .attached((c) => {
    c.subscribe(store.counters.onEntriesChange);
  })
  .update((c) => {
    c.sync(c.createVRoot().disableChildrenShapeError()
      .children(store.counters.entries > 0 ?
        [Header.createImmutableVNode(), Main.createImmutableVNode(), Footer.createImmutableVNode()] :
        [Header.createImmutableVNode()]));
  });
