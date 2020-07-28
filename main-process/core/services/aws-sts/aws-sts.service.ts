import { MainProcessAwsStsInterface } from './aws-sts.interface';
import AWS from 'aws-sdk';
import { ipcMain } from 'electron-better-ipc';

export class MainProcessAwsStsService {

  private sts: AWS.STS;

  constructor() {}

  public listen() {
    // to initialize a listener in the main process
    ipcMain.answerRenderer('aws-sts', (options: MainProcessAwsStsInterface) => {
      return this[options.call](options.argument);
    });
  }

  public getCallerIdentity(profileName: string): Promise<string|unknown> {
    return new Promise((resolve, _) => {
      const credentials = new AWS.SharedIniFileCredentials({profile: profileName});
      AWS.config.credentials = credentials;
      this.sts = new AWS.STS();
      this.sts.getCallerIdentity({}, (_, data) => {
        if (_) resolve('invalid');
        resolve(JSON.stringify(data, null, 2));
      });
    }).catch((err) => {
      throw err;
    });
  }

  public assumeRoleWithSAML(params: AWS.STS.AssumeRoleWithSAMLRequest): Promise<string|unknown> {
    return new Promise((resolve, reject) => {
      this.sts = new AWS.STS();
      this.sts.assumeRoleWithSAML(params, function(err, data) {
        if (err) reject(err);
        resolve(JSON.stringify(data, null, 2));
      });
    }).catch((err) => {
      throw err;
    });
  }

}
