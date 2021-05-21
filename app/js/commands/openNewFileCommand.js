const { fs } = window.node;
const { path } = window.node;

const Tab = require('../tab');
const FileSettings = require('../fileSettings');
const FileNotFoundError = require('../exceptions/fileNotFoundError');

module.exports = class OpenNewFileCommand {
  constructor(file, tabs, userPreferences) {
    this.file = file;
    this.tabs = tabs;
    this.userPreferences = userPreferences;
  }

  execute() {
    if (fs.existsSync(this.file)) {
      const filePath = path.resolve(this.file);
      const parsedFile = path.parse(filePath);

      const fileSettings = new FileSettings();
      const tab = new Tab(parsedFile.base, filePath, fileSettings);

      this.tabs.push(tab);

      this.userPreferences.addFile(parsedFile.base, filePath, fileSettings);
    } else {
      throw new FileNotFoundError(this.file);
    }
  }
};
