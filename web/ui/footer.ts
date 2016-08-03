import {ComponentDescriptor, createVElement, createVText, VNode} from "kivi";
import {DisplaySettings, store} from "../store";


export const Footer = new ComponentDescriptor<void, void>()
  .enableBackRef()
  .tagName("footer");

const _onClickClearCompleted = Footer.createDelegatedEventHandler("#clear-completed", false, (e) => {
  store.clearCompleted();
  e.preventDefault();
  e.stopPropagation();
});

Footer
  .init((c) => {
    (c.element as HTMLElement).onclick = _onClickClearCompleted;
  })
  .attached((c) => {
    c.subscribe(store.settings.onChange);
    c.subscribe(store.counters.onChange);
  })
  .update((c) => {
    const showEntries = store.settings.showEntries;

    const children = [] as VNode[];
    children.push(createVElement("ul").props({"id": "filters"}).children([
      createVElement("li").children([
        createVElement("a")
          .props({"href": "#!/"})
          .className(showEntries === DisplaySettings.ShowAll ? "selected" : null)
          .children("All"),
      ]),
      createVText(" "),
      createVElement("li").children([
        createVElement("a")
          .props({"href": "#!/active"})
          .className(showEntries === DisplaySettings.ShowActive ? "selected" : null)
          .children("Active"),
      ]),
      createVText(" "),
      createVElement("li").children([
        createVElement("a")
          .props({"href": "#!/completed"})
          .className(showEntries === DisplaySettings.ShowCompleted ? "selected" : null)
          .children("Completed"),
      ]),
    ]));

    const entries = store.counters.entries;
    const entriesCompleted = store.counters.entriesCompleted;
    const entriesActive = entries - entriesCompleted;

    children.push(createVElement("span").props({"id": "todo-count"}).children([
      createVElement("strong").children(entriesActive.toString()),
      createVText(entriesActive > 1 ? " items left" : " item left"),
    ]));

    if (entriesCompleted > 0) {
      children.push(createVElement("button")
        .props({"id": "clear-completed"})
        .children(`Clear completed (${entriesCompleted})`));
    }

    c.sync(c.createVRoot()
      .props({"id": "footer"})
      .disableChildrenShapeError()
      .children(children));
  });
