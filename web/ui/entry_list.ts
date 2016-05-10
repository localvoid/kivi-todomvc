import {ComponentDescriptor, Component, createVElement, createVCheckedInput, createVTextInput, VNode,
        getBackRef, scheduler} from "kivi";
import {state, DisplaySettings, Entry} from "../data";

type EntryViewType = Component<Entry, any, boolean>;

const EntryView = new ComponentDescriptor<Entry, any, boolean>()
  .tagName("li")
  .enableBackRef()
  .init((c) => {
    c.data = false;
  })
  .attached((c) => {
    c.subscribe(c.props.onChange);
  })
  .vRender((c, root) => {
    const entry = c.props;
    const isEditing = state.entryEdit.editing === entry;

    const view = createVElement("div").className("view").children([
      createVCheckedInput().className("toggle").attrs({"type": "checkbox"}).checked(entry.completed),
      createVElement("label").children(entry.title),
      createVElement("button").className("destroy"),
    ]);

    let rootClasses: string;
    let children: VNode[];
    if (isEditing) {
      c.transientSubscribe(state.entryEdit.onChange);
      rootClasses = entry.completed ? "editing completed" : "editing";
      const input = createVTextInput().className("edit").attrs({"type": "text"}).value(state.entryEdit.title);
      if (!c.data) {
        c.data = true;
        scheduler.currentFrame().focus(input);
      }
      children = [view, input];
    } else {
      c.data = false;
      rootClasses = entry.completed ? "completed" : undefined;
      children = [view];
    }

    root.className(rootClasses)
      .disableChildrenShapeError()
      .children(children);
  });

export const EntryList = new ComponentDescriptor()
  .tagName("ul")
  .init((c) => {
    c.element.addEventListener("keydown", (e: KeyboardEvent) => {
      let entry: Entry;

      if ((e.target as HTMLElement).classList.contains("edit")) {
        if (e.keyCode === 13) {
          entry = getBackRef<EntryViewType>((e.target as HTMLElement).parentNode).props;
          state.updateTitle(entry, state.entryEdit.title);
          state.stopEntryEdit();
        } else if (e.keyCode === 27) {
          entry = getBackRef<EntryViewType>((e.target as HTMLElement).parentNode).props;
          state.stopEntryEdit();
        }
      }
    });

    c.element.addEventListener("dblclick", (e) => {
      if ((e.target as HTMLElement).tagName === "LABEL") {
        const backRef = getBackRef<EntryViewType>((e.target as Element).parentNode.parentNode);
        state.startEntryEdit(backRef.props);
        backRef.invalidate();
      }
    });

    c.element.addEventListener("focusout", (e) => {
      if ((e.target as HTMLElement).classList.contains("edit")) {
        state.stopEntryEdit();
      }
    });

    c.element.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).classList.contains("destroy")) {
        state.removeEntry(getBackRef<EntryViewType>((e.target as Element).parentNode.parentNode).props);
      }
    });

    c.element.addEventListener("change", (e) => {
      if ((e.target as HTMLElement).classList.contains("toggle")) {
        state.toggleEntry(getBackRef<EntryViewType>((e.target as Element).parentNode.parentNode).props);
      }
    });

    c.element.addEventListener("input", (e) => {
      if ((e.target as HTMLElement).classList.contains("edit")) {
        state.updateEntryEditTitle((e.target as HTMLInputElement).value);
      }
    });
  })
  .attached((c) => {
    c.subscribe(state.settings.onChange);
    c.subscribe(state.entryList.onChange);
  })
  .vRender((c, root) => {
    const counters = state.counters;
    const showEntries = state.settings.showEntries;
    const entries = state.entryList.items;

    let children: VNode[];
    let entry: Entry;
    let i: number;
    let j: number;

    if (showEntries === DisplaySettings.ShowActive) {
      c.transientSubscribe(state.entryList.onEntryCompletedChanged);
      const entriesActive = counters.entries - counters.entriesCompleted;

      if (entriesActive === 0) {
        children = [];
      } else {
        children = new Array(entriesActive);
        j = 0;
        for (i = 0; i < entries.length; i++) {
          entry = entries[i];
          if (!entry.completed) {
            children[j++] = EntryView.createVNode(entry).key(entry.id).bindOnce();
          }
        }
      }
    } else if (showEntries === DisplaySettings.ShowCompleted) {
      c.transientSubscribe(state.entryList.onEntryCompletedChanged);

      if (counters.entriesCompleted === 0) {
        children = [];
      } else {
        children = new Array(counters.entriesCompleted);
        j = 0;
        for (i = 0; i < entries.length; i++) {
          entry = entries[i];
          if (entry.completed) {
            children[j++] = EntryView.createVNode(entry).key(entry.id).bindOnce();
          }
        }
      }
    } else {
      children = new Array(entries.length);
      for (i = 0; i < entries.length; i++) {
        entry = entries[i];
        children[i] = EntryView.createVNode(entry).key(entry.id).bindOnce();
      }
    }

    root.props({"id": "todo-list"})
      .trackByKeyChildren(children);
  });
