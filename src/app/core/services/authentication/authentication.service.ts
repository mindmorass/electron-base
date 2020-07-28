import { Injectable, OnDestroy } from '@angular/core';
import { AuthenticationSaml20Service } from './saml20/saml20.service';
import { ConfigService } from '../../services/config/config.service';
import { ElectronService } from '../../services/electron/electron.service';
import { AwsCliService } from '../../services/aws-cli/aws-cli.service';
import { NotificationService } from '../../services/notifications/notification.service';
import { BrowserWindow } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements OnDestroy{
  private window: BrowserWindow;
  private windowOpen: boolean;

  constructor(private electron: ElectronService,
              private config: ConfigService,
              private notificaiton: NotificationService,
              private awscli: AwsCliService,
              private saml20: AuthenticationSaml20Service) {}

  public get profile() {
    return this.config.read('aws_client.profile', 'default');
  }

  private async getRoleLifeTime(roleName: string) {
    const jsonStr = await this.electron.ipcRenderer.callMain('aws-iam', {call: 'getRole', rolename: roleName, profile: this.profile});
    return JSON.parse(String(jsonStr))['Role']['MaxSessionDuration'];
  }

  private async saveCredentials(data: JSON): Promise<boolean> {
    const credentials = await this.awscli.getAwsCliCredentials();
    credentials[this.profile] = {};
    credentials[this.profile].aws_access_key_id = data['Credentials']['AccessKeyId'];
    credentials[this.profile].aws_secret_access_key =  data['Credentials']['SecretAccessKey']
    credentials[this.profile].aws_session_token = data['Credentials']['SessionToken']
    this.awscli.saveAwsCliCredentials(credentials);
    return true;
  }

  public async saml20Authentication(): Promise<boolean> {
    if (! this.windowOpen) {
      this.window = this.saml20.newLoginWindow(); 
      this.window.on('close', () => {
        this.windowOpen = false;
        this.window.destroy();
      });
      this.windowOpen = true;

      const data = await this.saml20.captureSamlData(this.window);
      const assumedData = await this.saml20.assumeRoleWithSaml(data);
      const finished = await this.saveCredentials(assumedData);

      if (finished) {
        const maxSesssionDuration =  Number(await this.getRoleLifeTime(this.saml20.roleName));
        data['DurationSeconds'] = maxSesssionDuration;
        const maxDurationAssumedData = await this.saml20.assumeRoleWithSaml(data);
        await this.saveCredentials(maxDurationAssumedData);
        this.window.destroy();
        this.windowOpen = false;
        this.notificaiton.webNotify({ type: 'accent',
                                      message: `Credentials valid for ${maxSesssionDuration} seconds`});
      }
    } else {
      this.notificaiton.webNotify({ type: 'warn',
                                    message: 'Authentication Window already open'});
    }
    return true;
  }

  ngOnDestroy(): void {
    if (this.windowOpen) {
      this.window.destroy();
      this.windowOpen = false;
    }
  }

}
