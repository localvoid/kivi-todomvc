import {MessageGroup, ActorDescriptor, Invalidator} from "kivi";

export const enum DisplaySettings {
  ShowAll       = 0,
  ShowActive    = 1,
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

  setDisplay(v: DisplaySettings): void {
    this.settings.showEntries = v;
    this.settings.onChange.invalidate();
  }

  addEntry(title: string): void {
    title = title.trim();
    if (title !== "") {
      this.entryList.items.push(new Entry(this._nextEntryId++, title, false));
      this.entryList.onChange.invalidate();
      this.counters.entries++;
      this.counters.onEntriesChange.invalidate();
      this.counters.onChange.invalidate();
    }
  }

  removeEntry(entry: Entry): void {
    const items = this.entryList.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item === entry) {
        items.splice(i, 1);
        this.entryList.onChange.invalidate();

        const counters = this.counters;
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

  updateTitle(entry: Entry, newTitle: string): void {
    newTitle = newTitle.trim();
    if (newTitle === "") {
      this.removeEntry(entry);
    } else {
      entry.title = newTitle;
      entry.onChange.invalidate();
    }
  }

  toggleAll(checked: boolean): void {
    const items = this.entryList.items;
    const counters = this.counters;
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
      this.entryList.onEntryCompletedChanged.invalidate();
      counters.entriesCompleted += completedDiff;
      counters.onEntriesCompletedChange.invalidate();
      counters.onChange.invalidate();
    }
  }

  toggleEntry(entry: Entry): void {
    const counters = this.counters;

    if (entry.completed) {
      entry.completed = false;
      counters.entriesCompleted--;
    } else {
      entry.completed = true;
      counters.entriesCompleted++;
    }
    this.entryList.onEntryCompletedChanged.invalidate();
    entry.onChange.invalidate();
    counters.onEntriesCompletedChange.invalidate();
    counters.onChange.invalidate();
  }

  clearCompleted(): void {
    const counters = this.counters;
    if (counters.entriesCompleted > 0) {
      const items = this.entryList.items;
      const newItems = [] as Entry[];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.completed) {
          newItems.push(item);
        }
      }
      this.entryList.items = newItems;
      this.entryList.onChange.invalidate();
      counters.entries -= counters.entriesCompleted;
      counters.entriesCompleted = 0;
      counters.onEntriesCompletedChange.invalidate();
      counters.onEntriesChange.invalidate();
      counters.onChange.invalidate();
    }
  }

  startEntryEdit(entry: Entry): void {
    this.entryEdit.editing = entry;
    this.entryEdit.title = entry.title;
    this.entryEdit.onChange.invalidate();
  }

  stopEntryEdit(): void {
    this.entryEdit.editing = undefined;
    this.entryEdit.title = "";
    this.entryEdit.onChange.invalidate();
  }

  updateEntryEditTitle(newTitle: string): void {
    if (this.entryEdit.title !== newTitle) {
      this.entryEdit.title = newTitle;
      this.entryEdit.onChange.invalidate();
    }
  }
}

export const AppMessages = new MessageGroup("todomvc");
export const SetDisplayMessage = AppMessages.create<DisplaySettings>("setDisplay");
export const AddEntryMessage = AppMessages.create<string>("addEntry");
export const RemoveEntryMessage = AppMessages.create<Entry>("removeEntry");
export const UpdateTitleMessage = AppMessages.create<{entry: Entry, newTitle: string}>("updateTitle");
export const ToggleAllMessage = AppMessages.create<boolean>("toggleAll");
export const ToggleEntryMessage = AppMessages.create<Entry>("toggleEntry");
export const ClearCompletedMessage = AppMessages.create<void>("clearCompleted");
export const StartEntryEditMessage = AppMessages.create<Entry>("startEntryEdit");
export const StopEntryEditMessage = AppMessages.create<void>("stopEntryEdit");
export const UpdateEntryEditTitleMessage = AppMessages.create<string>("updateEntryEdit");

export const AppStore = new ActorDescriptor<AppState>((message, state) => {
  const descriptor = message.descriptor;
  if (descriptor === SetDisplayMessage) {
    state.setDisplay(message.payload as DisplaySettings);
  } else if (descriptor === AddEntryMessage) {
    state.addEntry(message.payload as string);
  } else if (descriptor === RemoveEntryMessage) {
    state.removeEntry(message.payload as Entry);
  } else if (descriptor === UpdateTitleMessage) {
    const payload = message.payload as {entry: Entry, newTitle: string};
    state.updateTitle(payload.entry, payload.newTitle);
  } else if (descriptor === ToggleAllMessage) {
    state.toggleAll(message.payload as boolean);
  } else if (descriptor === ToggleEntryMessage) {
    state.toggleEntry(message.payload as Entry);
  } else if (descriptor === ClearCompletedMessage) {
    state.clearCompleted();
  } else if (descriptor === StartEntryEditMessage) {
    state.startEntryEdit(message.payload as Entry);
  } else if (descriptor === StopEntryEditMessage) {
    state.stopEntryEdit();
  } else if (descriptor === UpdateEntryEditTitleMessage) {
    state.updateEntryEditTitle(message.payload as string);
  }

  return state;
});

export const store = AppStore.create(new AppState());
