const Store = window.dependecies.electronStore;

let instance = null;

module.exports = class UserPreferences {
  constructor() {
    if (!instance) {
      instance = this;
    }

    this.store = new Store();

    return instance;
  }

  addFile(fileName, filePath, fileSettings) {
    const files = this.getFiles();

    files.push({ name: fileName, path: filePath, settings: fileSettings });

    this.store.set('files', files);
  }

  removeFile(fileToRemove) {
    let files = this.getFiles();

    files = files.filter((file) => file.path !== fileToRemove);

    this.store.set('files', files);
  }

  getFiles() {
    return this.store.get('files', []);
  }

  saveFileSettings(filePath, settings) {
    const files = this.getFiles().map((file) => {
      if (file.path === filePath) {
        file.settings = Object.assign(file.settings, settings);
      }

      return file;
    });

    this.store.set('files', files);
  }
};
