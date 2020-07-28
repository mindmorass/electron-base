// Electron Menu
// https://www.electronjs.org/docs/api/menu

import { MainProcessAutoUpdateService } from './services/auto-update/auto-update.service'
import { BrowserWindow } from 'electron'

export class MainProcessMenu {

  constructor(public win: BrowserWindow) {}

  // to return the main menu template to the main process to build the menu

  public getTemplate(app): object[] {
    const update = new MainProcessAutoUpdateService(this.win);
    // app is an import from electron - passing it here from main

    // os independent menu cmdOrCtrl for Windows and OS X
    // menu template: primarily to add copy/paste functionality
    const template: object[] = [{
      label: 'Application',
      submenu: [
        { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
        { label: 'Check for Updates...', accelerator: 'Command+U', click: function() {
          update.dialog = true;
          update.watchForUpdates();
        }},
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: function() { app.quit(); }}
      ]}, {
      label: 'Edit',
      submenu: [
        { label: 'Undo',       accelerator: 'CmdOrCtrl+Z',       selector: 'undo:' },
        { label: 'Redo',       accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut',        accelerator: 'CmdOrCtrl+X',       selector: 'cut:' },
        { label: 'Copy',       accelerator: 'CmdOrCtrl+C',       selector: 'copy:' },
        { label: 'Paste',      accelerator: 'CmdOrCtrl+V',       selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A',       selector: 'selectAll:' }
      ]}
    ];

    return template;
  }

}
