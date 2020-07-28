import { Injectable } from '@angular/core';
import { ElectronService } from '../../electron/electron.service';
import { ConfigService } from '../../config/config.service';
import { STS } from 'aws-sdk';
// import { EnvVarsAwsSts } from '../../environments/environment';
import { URL } from 'url';
import { BrowserWindow } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationSaml20Service {
  public awsRole: string;
  public browserWindow: any;

  private _windowOpen = false;
  private _stsDuration = 900;
  private _window: any;
  private _awsAccountId: string;
  private _roleName: string;

  constructor(private electron: ElectronService,
              private config: ConfigService) {
    this.browserWindow = this.electron.remote.BrowserWindow;
  }

  public set roleName(value: string) {
    this._roleName = value;
  }

  public get roleName() {
    return this._roleName;
  }

  public get ssoServiceUrl() {
    return this.config.read('settings.sso_service_url', 'https://localhost');
  }

  public get awsIdentityProviderName() {
    return this.config.read('settings.aws_identity_provider_name', '');
  }

  public get awsSamlSigninUrl() {
    return this.config.read('settings.aws_saml_signin_url', 'https://signin.aws.amazon.com/saml');
  }

  public set windowOpen(state: boolean) {
    this._windowOpen = state;
  }

  public get windowOpen() {
    return this._windowOpen;
  }

  public newLoginWindow(): BrowserWindow {

    this._window = new this.browserWindow({
      width: 800,
      height: 600,
      center: true,
      alwaysOnTop: false,
      webPreferences: {
        nodeIntegration: false,
      }
    });

    // call the SP url that redirets to IDP for SAML login

    this._window.loadURL(this.ssoServiceUrl);
    // this._window.openDevTools();
    this.windowOpen = true;

    // dereference the window when the user closes

    this._window.on('closed', () => {
      this.LoginWindow.destroy();
      this.windowOpen = false;
    });

    return this._window;
  }

  public get LoginWindow() {
    return this._window;
  }


  private get awsAccountId(): string {
    return this._awsAccountId;
  }

  public set stsDuration(v: number) {
    this._stsDuration = v;
  }

  public get stsDuration() {
    return this._stsDuration;
  }

  public async assumeRoleWithSaml(parameters: STS.AssumeRoleWithSAMLRequest) {
    return JSON.parse(await this.electron.ipcRenderer.callMain('aws-sts', {call: 'assumeRoleWithSAML', argument: parameters}));
  }

  public async captureSamlData(window: BrowserWindow): Promise<any> {
    return new Promise((resolve, reject) => {
      const session = window.webContents.session;
      session.webRequest.onBeforeRequest({urls: [this.awsSamlSigninUrl]}, (details, callback) => {

        // Url and referer must match with an HTTP POST
        if (details.url === this.awsSamlSigninUrl &&
          details.method === 'POST' &&
          details['referrer'] === this.awsSamlSigninUrl) {
          // loop throught the byte stream elements and concatenate then into a string

          let responseData: string;
          details.uploadData.forEach(function(element) {
            responseData += element.bytes.toString('utf8');
          });

          console.log('Collecting STS Role & Credentials');

          // rebuild the saml url for URL lib parsing

          try {
            const awsSamlUrl = new URL(this.awsSamlSigninUrl + '?' + responseData);
            const awsRole = awsSamlUrl.searchParams.get('roleIndex');
            const awsAccountId = awsRole.split(':')[4];
            this.roleName = awsRole.split('/')[1];
          
            const data: STS.AssumeRoleWithSAMLRequest = {
              DurationSeconds: this.stsDuration,
              SAMLAssertion: awsSamlUrl.searchParams.get('SAMLResponse').toString().split(' ').join('+'),
              RoleArn: `arn:aws:iam::${awsAccountId}:role/${this.roleName}`,
              PrincipalArn: `arn:aws:iam::${awsAccountId}:saml-provider/${this.awsIdentityProviderName}`
            };

            callback({cancel: true});
            resolve(data);
          } catch(err) {
            reject(err);
          }
        } else {
          // ensure all other requests load normally
          callback({cancel: false});
        }
      });
    });
  }
}
