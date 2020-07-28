import AWS from 'aws-sdk';
import { ipcMain } from 'electron-better-ipc';
import { MainProcessAwsIamInterface } from './aws-iam.interface';

export class MainProcessAwsIamService {

  private iam: AWS.IAM;

  constructor() {}

  public listen() {
    // to initialize a listener in the main process
    ipcMain.answerRenderer('aws-iam', (options: MainProcessAwsIamInterface) => {
      return this[options.call](options);
    });
  }

  public getRole(options: MainProcessAwsIamInterface): Promise<string|unknown> {
    return new Promise((resolve, reject) => {
      const credentials = new AWS.SharedIniFileCredentials({profile: options['profile']})
      this.iam = new AWS.IAM;
      this.iam.getRole({ RoleName: options['rolename']}, function(err, data) {
        if (err) { reject(err); }
        if (data) { resolve(JSON.stringify(data)); }
      });
    }).catch((err) => {
      throw err;
    });
  }
}