import { Injectable } from '@angular/core';
import { webFrame, remote } from 'electron';
import { ipcRenderer } from 'electron-better-ipc';
import * as childProcess from 'child_process';
import * as process from 'process';
import * as fs from 'fs';
import * as os from 'os';
import * as dns from 'dns';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  os: typeof os;
  dns: typeof dns;
  process: typeof process;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron-better-ipc').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.os = window.require('os');
      this.dns = window.require('dns');
      this.process = window.require('process');
    }
  }
}
