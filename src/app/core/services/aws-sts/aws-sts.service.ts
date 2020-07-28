import { Injectable } from '@angular/core';
import { MainProcessAwsStsInterface } from '../../../../../main-process/core/services/aws-sts/aws-sts.interface';
import { ElectronService } from '../electron/electron.service';

@Injectable({
  providedIn: 'root'
})
export class AwsStsService {

  private options: MainProcessAwsStsInterface;

  constructor(private electron: ElectronService) { }

  public async getCallerIdentity(profileName = 'default'): Promise<string|unknown> {
    this.options = {call: 'getCallerIdentity', argument: profileName};
    const callerId = await this.electron.ipcRenderer.callMain('aws-sts', this.options);
    return callerId;
  }
}
