window.electron = {
  app: require('electron').remote.app,
  remote: require('electron').remote
};

window.node = {
  fs: require('fs'),
  path: require('path')
};

window.dependecies = {
  electronStore: require('electron-store')
};
