import {ComponentDescriptor, Component, createVElement, VNode, currentFrame} from "kivi";
import {store, DisplaySettings, Entry} from "../store";

declare global {
  interface HTMLElement {
    onfocusout: (ev: MouseEvent) => any;
  }
}

const onFocusOutSupported = HTMLElement.prototype.onfocusout !== undefined;

type EntryViewType = Component<Entry, {toggled: boolean}>;

const EntryView = new ComponentDescriptor<Entry, {toggled: boolean}>()
  .tagName("li")
  .enableBackRef()
  .init((c) => {
    c.state = {toggled: false};
  })
  .attached((c, props) => {
    c.subscribe(props.onChange);
  })
  .update((c, props, state) => {
    const entry = props;
    const isEditing = store.entryEdit.editing === entry;

    const view = createVElement("div").className("view").children([
      createVElement("input").className("toggle").attrs({"type": "checkbox"}).checked(entry.completed),
      createVElement("label").children(entry.title),
      createVElement("button").className("destroy"),
    ]);

    let rootClasses: string;
    let children: VNode[];
    if (isEditing) {
      c.transientSubscribe(store.entryEdit.onChange);
      rootClasses = entry.completed ? "editing completed" : "editing";
      const input = createVElement("input").className("edit").attrs({"type": "text"})
        .value(store.entryEdit.title);
      if (!state.toggled) {
        state.toggled = true;
        currentFrame().focus(input);
      }
      children = [view, input];
    } else {
      state.toggled = false;
      rootClasses = entry.completed ? "completed" : undefined;
      children = [view];
    }

    c.sync(c.createVRoot()
      .className(rootClasses)
      .disableChildrenShapeError()
      .children(children));
  });

const _onClick = EntryView.createDelegatedEventHandler(".destroy", "li", (e, c, props) => {
  store.removeEntry(props);
});

const _onDblClick = EntryView.createDelegatedEventHandler("label", "li", (e, c, props) => {
  store.startEntryEdit(props);
  c.invalidate();
});

const _onFocusOut = EntryView.createDelegatedEventHandler(".edit", "li", () => {
  store.stopEntryEdit();
});

const _onChange = EntryView.createDelegatedEventHandler(".toggle", "li", (e, c, props) => {
  store.toggleEntry(props);
});

const _onInput = EntryView.createDelegatedEventHandler(".edit", "li", (e) => {
  store.updateEntryEditTitle((e.target as HTMLInputElement).value);
});

const _onKeyDown = EntryView.createDelegatedEventHandler(".edit", "li", (e, c, props) => {
  if ((e as KeyboardEvent).keyCode === 13) {
    store.updateTitle(props, store.entryEdit.title);
    store.stopEntryEdit();
  } else if ((e as KeyboardEvent).keyCode === 27) {
    store.stopEntryEdit();
  }
});

export const EntryList = new ComponentDescriptor<void, void>()
  .tagName("ul")
  .init((c) => {
    (c.element as HTMLElement).onkeydown = _onKeyDown;
    (c.element as HTMLElement).onclick = _onClick;
    (c.element as HTMLElement).ondblclick = _onDblClick;
    if (onFocusOutSupported) {
      (c.element as HTMLElement).onfocusout = _onFocusOut;
    } else {
      c.element.addEventListener("blur", _onFocusOut, true);
    }
    (c.element as HTMLElement).onchange = _onChange;
    (c.element as HTMLElement).oninput = _onInput;
  })
  .attached((c) => {
    c.subscribe(store.settings.onChange);
    c.subscribe(store.entryList.onChange);
  })
  .update((c) => {
    const counters = store.counters;
    const showEntries = store.settings.showEntries;
    const entries = store.entryList.items;

    let children: VNode[];
    let entry: Entry;
    let i: number;
    let j: number;

    if (showEntries === DisplaySettings.ShowActive) {
      c.transientSubscribe(store.entryList.onEntryCompletedChanged);
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
      c.transientSubscribe(store.entryList.onEntryCompletedChanged);

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

    c.sync(c.createVRoot()
      .props({"id": "todo-list"})
      .trackByKeyChildren(children));
  });
