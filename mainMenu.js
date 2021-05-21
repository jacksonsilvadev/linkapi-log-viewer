const { Menu } = require('electron');
const { dialog } = require('electron');
const electron = require('electron');

const { app } = electron;

const template = [
  {
    label: 'File',
    submenu: [
      {
        role: 'quit'
      }
    ]
  },
  {
    label: 'LinkApi',
    submenu: [
      {
        label: 'Style Guide',
        click() {
          electron.shell.openExternal('https://linkapisolutions.atlassian.net/wiki/spaces/DocDelivery/pages/1364721863/Style+Guide');
        }
      },
      {
        label: 'V5',
        click() {
          electron.shell.openExternal('https://platform.linkapi.solutions/');
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'V4',
        click() {
          electron.shell.openExternal('https://app.linkapi.solutions/');
        }
      },
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Source code',
        click() {
          electron.shell.openExternal('https://github.com/jacksonsilvadev');
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'About',
        click() {
          dialog.showMessageBox({
            type: 'info',
            title: 'About',
            buttons: ['OK'],
            message: 'LinkApi Log Viewer',
            detail: 
              `Developed by Jackson Silva, Matheus Siqueira, Gabriel Santos, Luan Silva and Fillipe Xavier.\n 
               For a better experience in developing with logs in LinkApi.`
          });
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
