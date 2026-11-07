// Autosave for the document editor. Edits are saved at most once per interval,
// and the status bar shows how things stand ("Unsaved changes", "Saving…", …).

export class Autosave {
  constructor(editor, storage, clock, intervalMs = 3000) {
    this.storage = storage;
    this.clock = clock;
    this.latestText = null;
    this.dirty = false;
    this.saving = false;
    this.lastSavedAt = null;

    editor.on('change', this.handleChange);
    clock.every(intervalMs, () => this.flush());
  }

  handleChange(text) {
    this.latestText = text;
    this.dirty = true;
  }

  // Saves the latest text if anything changed. Returns whether it saved.
  async flush() {
    if (!this.dirty || this.saving) {
      return false;
    }
    const text = this.latestText;
    this.dirty = false;
    this.saving = true;
    try {
      await this.storage.save(text);
      this.lastSavedAt = this.clock.now();
      return true;
    } catch {
      this.dirty = true; // try again on the next interval
      return false;
    } finally {
      this.saving = false;
    }
  }

  status() {
    if (this.saving) {
      return 'Saving…';
    }
    if (this.dirty) {
      return 'Unsaved changes';
    }
    return this.lastSavedAt === null ? 'No changes yet' : 'All changes saved';
  }
}
