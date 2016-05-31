import {MessageGroup, ActorDescriptor, Invalidator} from "kivi";

export const enum DisplaySettings {
  ShowAll = 0,
  ShowActive = 1,
  ShowCompleted = 2,
};

export class Settings {
  showEntries = DisplaySettings.ShowAll;
  onChange = new Invalidator();
}

export class Entry {
  id: string;
  title: string;
  completed: boolean;
  onChange: Invalidator;

  constructor(id: number, title: string, completed: boolean) {
    this.id = id.toString();
    this.title = title;
    this.completed = completed;
    this.onChange = new Invalidator();
  }
}

export class EntryEdit {
  editing: Entry = undefined;
  title = "";
  onChange = new Invalidator();
}

export class EntryList {
  items = [] as Entry[];
  onEntryCompletedChanged = new Invalidator();
  onChange = new Invalidator();
}

export class Counters {
  entries = 0;
  entriesCompleted = 0;
  onEntriesChange = new Invalidator();
  onEntriesCompletedChange = new Invalidator();
  onChange = new Invalidator();
}

export class AppState {
  settings = new Settings();
  counters = new Counters();
  entryList = new EntryList();
  entryEdit = new EntryEdit();

  _nextEntryId = 0;
}

export const AppMessages = new MessageGroup("todomvc");
export const SetDisplayMessage = AppMessages.create<DisplaySettings>("setDisplay");
export const AddEntryMessage = AppMessages.create<string>("addEntry");
export const RemoveEntryMessage = AppMessages.create<Entry>("removeEntry");
export const UpdateTitleMessage = AppMessages.create<{ entry: Entry, newTitle: string }>("updateTitle");
export const ToggleAllMessage = AppMessages.create<boolean>("toggleAll");
export const ToggleEntryMessage = AppMessages.create<Entry>("toggleEntry");
export const ClearCompletedMessage = AppMessages.create<void>("clearCompleted");
export const StartEntryEditMessage = AppMessages.create<Entry>("startEntryEdit");
export const StopEntryEditMessage = AppMessages.create<void>("stopEntryEdit");
export const UpdateEntryEditTitleMessage = AppMessages.create<string>("updateEntryEdit");

export const AppStore = new ActorDescriptor<void, AppState>()
  .createState((actor, props) => new AppState())
  .handleMessage((actor, message, props, state) => {
    const descriptor = message.descriptor;
    if (descriptor === SetDisplayMessage) {
      setDisplay(state, message.payload as DisplaySettings);
    } else if (descriptor === AddEntryMessage) {
      addEntry(state, message.payload as string);
    } else if (descriptor === RemoveEntryMessage) {
      removeEntry(state, message.payload as Entry);
    } else if (descriptor === UpdateTitleMessage) {
      const payload = message.payload as { entry: Entry, newTitle: string };
      updateTitle(state, payload.entry, payload.newTitle);
    } else if (descriptor === ToggleAllMessage) {
      toggleAll(state, message.payload as boolean);
    } else if (descriptor === ToggleEntryMessage) {
      toggleEntry(state, message.payload as Entry);
    } else if (descriptor === ClearCompletedMessage) {
      clearCompleted(state);
    } else if (descriptor === StartEntryEditMessage) {
      startEntryEdit(state, message.payload as Entry);
    } else if (descriptor === StopEntryEditMessage) {
      stopEntryEdit(state);
    } else if (descriptor === UpdateEntryEditTitleMessage) {
      updateEntryEditTitle(state, message.payload as string);
    }

    return state;
  });

function setDisplay(state: AppState, v: DisplaySettings): void {
  state.settings.showEntries = v;
  state.settings.onChange.invalidate();
}

function addEntry(state: AppState, title: string): void {
  title = title.trim();
  if (title !== "") {
    state.entryList.items.push(new Entry(state._nextEntryId++, title, false));
    state.entryList.onChange.invalidate();
    state.counters.entries++;
    state.counters.onEntriesChange.invalidate();
    state.counters.onChange.invalidate();
  }
}

function removeEntry(state: AppState, entry: Entry): void {
  const items = state.entryList.items;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item === entry) {
      items.splice(i, 1);
      state.entryList.onChange.invalidate();

      const counters = state.counters;
      counters.entries--;
      counters.onEntriesChange.invalidate();
      if (item.completed) {
        counters.entriesCompleted--;
        counters.onEntriesCompletedChange.invalidate();
      }
      counters.onChange.invalidate();
      return;
    }
  }
}

function updateTitle(state: AppState, entry: Entry, newTitle: string): void {
  newTitle = newTitle.trim();
  if (newTitle === "") {
    removeEntry(state, entry);
  } else {
    entry.title = newTitle;
    entry.onChange.invalidate();
  }
}

function toggleAll(state: AppState, checked: boolean): void {
  const items = state.entryList.items;
  const counters = state.counters;
  let completedDiff = 0;
  let i: number;
  let entry: Entry;

  if (checked) {
    for (i = 0; i < items.length; i++) {
      entry = items[i];
      if (!entry.completed) {
        entry.completed = true;
        entry.onChange.invalidate();
        completedDiff++;
      }
    }
  } else {
    for (i = 0; i < items.length; i++) {
      entry = items[i];
      if (entry.completed) {
        entry.completed = false;
        entry.onChange.invalidate();
        completedDiff--;
      }
    }
  }
  if (completedDiff !== 0) {
    state.entryList.onEntryCompletedChanged.invalidate();
    counters.entriesCompleted += completedDiff;
    counters.onEntriesCompletedChange.invalidate();
    counters.onChange.invalidate();
  }
}

function toggleEntry(state: AppState, entry: Entry): void {
  const counters = state.counters;

  if (entry.completed) {
    entry.completed = false;
    counters.entriesCompleted--;
  } else {
    entry.completed = true;
    counters.entriesCompleted++;
  }
  state.entryList.onEntryCompletedChanged.invalidate();
  entry.onChange.invalidate();
  counters.onEntriesCompletedChange.invalidate();
  counters.onChange.invalidate();
}

function clearCompleted(state: AppState): void {
  const counters = state.counters;
  if (counters.entriesCompleted > 0) {
    const items = state.entryList.items;
    const newItems = [] as Entry[];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.completed) {
        newItems.push(item);
      }
    }
    state.entryList.items = newItems;
    state.entryList.onChange.invalidate();
    counters.entries -= counters.entriesCompleted;
    counters.entriesCompleted = 0;
    counters.onEntriesCompletedChange.invalidate();
    counters.onEntriesChange.invalidate();
    counters.onChange.invalidate();
  }
}

function startEntryEdit(state: AppState, entry: Entry): void {
  state.entryEdit.editing = entry;
  state.entryEdit.title = entry.title;
  state.entryEdit.onChange.invalidate();
}

function stopEntryEdit(state: AppState): void {
  state.entryEdit.editing = undefined;
  state.entryEdit.title = "";
  state.entryEdit.onChange.invalidate();
}

function updateEntryEditTitle(state: AppState, newTitle: string): void {
  if (state.entryEdit.title !== newTitle) {
    state.entryEdit.title = newTitle;
    state.entryEdit.onChange.invalidate();
  }
}


export const store = AppStore.create();
