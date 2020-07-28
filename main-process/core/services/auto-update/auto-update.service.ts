import { BrowserWindow } from 'electron' 
import { autoUpdater } from 'electron-updater';
import { ipcMain } from 'electron-better-ipc';
import { dialog } from 'electron';

import * as path from 'path';
import * as url from 'url'

export class MainProcessAutoUpdateService {

  private _dialog: boolean;

  constructor(win: BrowserWindow) {

    // TODO: make logging a development ONLY option that gets enabled from a method from maint.ts
    // autoUpdater.logger = log;

    autoUpdater.autoDownload = true;

    autoUpdater.on('checking-for-update', () => {
      autoUpdater.logger.debug('checking for update...');
    });

    autoUpdater.on('update-not-available', (info) => {
      if (this.dialog) {
        dialog.showMessageBox(
          {
            message: 'You are running the latest version.',
            buttons: ['OK']
          });
      }
    });

    autoUpdater.on('update-available', (info) => {
      autoUpdater.logger.debug('update available');
      if (this.dialog) {
        dialog.showMessageBox(
          {
            message: 'A new update is available. Download is automatic.',
            buttons: ['OK']
          });
      }
    });

    autoUpdater.on('error', (err) => {
      autoUpdater.logger.debug('error in auto-updater...');
      if (this.dialog) {
        dialog.showMessageBox(
          {
            message: 'There was an error downloading the latest update.',
            buttons: ['OK']
          });
      }
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let percentage = progressObj.percent;
      autoUpdater.logger.debug('downloading');

      win.loadURL(url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true
      }));
      ipcMain.sendToRenderers('renderer-update-service', percentage)
    });

    autoUpdater.on('update-downloaded', (info) => {
      autoUpdater.logger.debug('update downloaded');
      if (this.dialog) {
        dialog.showMessageBox(
          {
            message: 'Download complete.',
            buttons: ['Restart', 'Later']
          });
      }
    });
  }

  public set dialog(b) {
    this._dialog = b;
  }

  public get dialog() {
    return this._dialog;
  }

  public watchForUpdates() {
    return autoUpdater.checkForUpdatesAndNotify();
  }
}