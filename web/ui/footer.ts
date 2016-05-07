import {ComponentDescriptor, createVRoot, createVElement, createVText, VNode} from "kivi";
import {DisplaySettings, state} from "../data";

export const Footer = new ComponentDescriptor()
  .tagName("footer")
  .init((c) => {
    c.subscribe(state.settings.onChange);
    c.subscribe(state.counters.onChange);

    c.element.addEventListener("click", (e) => {
      if ((e.target as Element).id === "clear-completed") {
        state.clearCompleted();
        e.preventDefault();
        e.stopPropagation();
      }
    });
  })
  .update((c) => {
    const showEntries = state.settings.showEntries;

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

    const entries = state.counters.entries;
    const entriesCompleted = state.counters.entriesCompleted;
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

    c.sync(createVRoot()
      .props({"id": "footer"})
      .disableChildrenShapeError()
      .children(children));
  });
