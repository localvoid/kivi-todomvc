import {ComponentDescriptor, Component, createVElement, VNode, getBackRef, scheduler} from "kivi";
import {store, UpdateTitleMessage, StopEntryEditMessage, StartEntryEditMessage, ToggleEntryMessage,
  RemoveEntryMessage, UpdateEntryEditTitleMessage, DisplaySettings, Entry} from "../store";

type EntryViewType = Component<Entry, {toggled: boolean}>;

const EntryView = new ComponentDescriptor<Entry, {toggled: boolean}>()
  .tagName("li")
  .enableBackRef()
  .createState((c) => ({toggled: false}))
  .attached((c, props) => {
    c.subscribe(props.onChange);
  })
  .update((c, props, state) => {
    const entry = props;
    const isEditing = store.state.entryEdit.editing === entry;

    const view = createVElement("div").className("view").children([
      createVElement("input").className("toggle").attrs({"type": "checkbox"}).checked(entry.completed),
      createVElement("label").children(entry.title),
      createVElement("button").className("destroy"),
    ]);

    let rootClasses: string;
    let children: VNode[];
    if (isEditing) {
      c.transientSubscribe(store.state.entryEdit.onChange);
      rootClasses = entry.completed ? "editing completed" : "editing";
      const input = createVElement("input").className("edit").attrs({"type": "text"})
        .value(store.state.entryEdit.title);
      if (!state.toggled) {
        state.toggled = true;
        scheduler.currentFrame().focus(input);
      }
      children = [view, input];
    } else {
      state.toggled = false;
      rootClasses = entry.completed ? "completed" : undefined;
      children = [view];
    }

    c.vSync(c.createVRoot()
      .className(rootClasses)
      .disableChildrenShapeError()
      .children(children));
  });

export const EntryList = new ComponentDescriptor<void, void>()
  .tagName("ul")
  .init((c) => {
    c.element.addEventListener("keydown", (e: KeyboardEvent) => {
      let entry: Entry;

      if ((e.target as HTMLElement).classList.contains("edit")) {
        if (e.keyCode === 13) {
          entry = getBackRef<EntryViewType>((e.target as HTMLElement).parentNode)._props;
          store.send(UpdateTitleMessage.create({entry: entry, newTitle: store.state.entryEdit.title}));
          store.send(StopEntryEditMessage.create(null));
        } else if (e.keyCode === 27) {
          entry = getBackRef<EntryViewType>((e.target as HTMLElement).parentNode)._props;
          store.send(StopEntryEditMessage.create(null));
        }
      }
    });

    c.element.addEventListener("dblclick", (e) => {
      if ((e.target as HTMLElement).tagName === "LABEL") {
        const backRef = getBackRef<EntryViewType>((e.target as Element).parentNode.parentNode);
        store.send(StartEntryEditMessage.create(backRef._props));
        backRef.invalidate();
      }
    });

    c.element.addEventListener("focusout", (e) => {
      if ((e.target as HTMLElement).classList.contains("edit")) {
        store.send(StopEntryEditMessage.create(null));
      }
    });

    c.element.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).classList.contains("destroy")) {
        store.send(
          RemoveEntryMessage.create(getBackRef<EntryViewType>((e.target as Element).parentNode.parentNode)._props));
      }
    });

    c.element.addEventListener("change", (e) => {
      if ((e.target as HTMLElement).classList.contains("toggle")) {
        store.send(
          ToggleEntryMessage.create(getBackRef<EntryViewType>((e.target as Element).parentNode.parentNode)._props));
      }
    });

    c.element.addEventListener("input", (e) => {
      if ((e.target as HTMLElement).classList.contains("edit")) {
        store.send(UpdateEntryEditTitleMessage.create((e.target as HTMLInputElement).value));
      }
    });
  })
  .attached((c) => {
    c.subscribe(store.state.settings.onChange);
    c.subscribe(store.state.entryList.onChange);
  })
  .update((c) => {
    const counters = store.state.counters;
    const showEntries = store.state.settings.showEntries;
    const entries = store.state.entryList.items;

    let children: VNode[];
    let entry: Entry;
    let i: number;
    let j: number;

    if (showEntries === DisplaySettings.ShowActive) {
      c.transientSubscribe(store.state.entryList.onEntryCompletedChanged);
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
      c.transientSubscribe(store.state.entryList.onEntryCompletedChanged);

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

    c.vSync(c.createVRoot()
      .props({"id": "todo-list"})
      .trackByKeyChildren(children));
  });
