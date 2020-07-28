import { Injectable } from '@angular/core';
import { ElectronService } from '../electron/electron.service';
import * as ini from 'ini';

@Injectable({
  providedIn: 'root'
})
export class AwsCliService {

  public awsConfig: object;
  public awsCredentials: object;

  constructor(private electron: ElectronService) {}

  public async getAwsCliConfig() {
    return this.awsConfig = JSON.parse(await this.electron.ipcRenderer.callMain('aws-cli', 'loadConfig'));
  }

  public async getAwsCliCredentials() {
    return this.awsCredentials = JSON.parse(await this.electron.ipcRenderer.callMain('aws-cli', 'loadCredentials'));
  }

  public saveAwsCliCredentials(credentials: object) {
    this.electron.fs.writeFileSync(`${this.electron.os.homedir()}/.aws/credentials`, ini.stringify(credentials));
  }

  public saveAwsCliConfig(config: object) {
    let properlyFormattedConfig = {};

    for (let profileName in config) {
      if (profileName === 'default') {
        properlyFormattedConfig[profileName] = config[profileName]; 
      } else {
        properlyFormattedConfig[`profile ${profileName}`] = config[profileName]; 
      }
    }
    this.electron.fs.writeFileSync(`${this.electron.os.homedir()}/.aws/config`, ini.stringify(properlyFormattedConfig));
  }
}
