import { IniLoader } from 'aws-sdk';
import { ipcMain } from 'electron-better-ipc';

export class MainProcessAwsCliService {

  private ini: IniLoader;
  
  constructor() {}

  public listen() {
    // to initialize a listener in the main process
    ipcMain.answerRenderer('aws-cli', (methodName: 'loadConfig' | 'loadCredentials') => {
      return this[methodName]();
    });
  }

  private loadConfig(): string {
    this.ini = new IniLoader();
    return JSON.stringify(this.ini.loadFrom({isConfig: true}));
  }

  private loadCredentials(): string {
    return JSON.stringify(this.ini.loadFrom({isConfig: false}));
  }

}