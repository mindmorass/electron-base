import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../core/services/electron/electron.service';
import { AwsPublicDataService } from '../core/services/aws-public-data/aws-public-data.service';
import { ConfigService } from '../core/services/config/config.service';
import { NotificationService } from '../core/services/notifications/notification.service';
import { SettingsInterface } from './ssettings.interface';

import { fromEvent, interval } from 'rxjs';
import { debounce } from 'rxjs/operators';

@Component({
  selector: 'app-configuration',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public ipc: any;
  public ipRangeJson: string;
  public devToolsStatus: boolean;
  public defaultRegion: string;
  public regions: string[];
  public path: string;
  public lastDebounce: string[];
  public pathRegexPattern = '(\/?([^\/]*[\/])*)([^\/:]+)$';
  public debugging: boolean;

  private pathRegex = new RegExp(this.pathRegexPattern);
  // TODO: move these to their own data file
  private settingVariables: SettingsInterface[] = [
    {
      name: 'path',
      placeholder: 'PATH',
      regex: '(\/?([^\/]*[\/])*)([^\/:]+)$',
      path: 'settings.path',
      default: '/usr/local/bin:/usr/bin'
    },
    {
      name: 'sso_service_url',
      placeholder: 'SSO Service Url',
      regex: 'https:\/\/.*',
      path: 'settings.sso_service_url',
      default: 'https://localhost'
    },
    {
      name: 'aws_identity_provider_name',
      placeholder: 'AWS Identity Provider',
      regex: '.*',
      path: 'settings.aws_identity_provider_name',
      default: ''
    },
    {
      name: 'aws_saml_signin_url',
      placeholder: 'AWS SAML Signin URL',
      regex: 'https:\/\/.*',
      path: 'settings.aws_saml_signin_url',
      default: 'https://signin.aws.amazon.com/saml'
    }
  ];

  constructor(
    private router: Router,
    private awsPublicData: AwsPublicDataService,
    private config: ConfigService,
    private electron: ElectronService,
    private notification: NotificationService,
  ) {
    this.ipc = this.electron.ipcRenderer;
  }

  public async devToolsState() {
    let state: boolean;
    state = this.config.read('preferences.developer_tools', false);
    if (! state) {
      state = await this.ipc.callMain('developer-tools');
    }
    return state;
  }

  public async toggleDevTools() {
    if (await this.ipc.callMain('developer-tools')) {
      this.devToolsStatus = false;
      this.ipc.callMain('developer-tools', 'off');
      this.config.write('preferences.developer_tools', false);
    } else {
      this.devToolsStatus = true;
      this.ipc.callMain('developer-tools', 'on');
      this.config.write('preferences.developer_tools', true);
    }
  }

  public saveDefaultRegion(regionName: string): void {
    this.config.write('settings.default_region', regionName);
    this.notification.webNotify({type: 'accent', message: `Set default region to ${regionName}`});
  }

  public savePath(): void {
    const keyup = fromEvent(document, 'keyup');
    const result = keyup.pipe(debounce(() => 
      interval(1000),
    ));
    result.subscribe(x => {
      if (this.pathRegex.test(this.path)) {
        this.config.write('settings.path', this.path);
        this.notification.webNotify({type: 'accent', message: 'PATH updated'});
      }
    });
  }

  public saveVariable(index: number, value: string): void {
    if (this.settingVariables[index]) {
      const keyup = fromEvent(document, 'keyup');
      const result = keyup.pipe(debounce(() => 
        interval(1000),
      ));
      result.subscribe(x => {
        const regex = new RegExp(this.settingVariables[index].regex);
        if (regex.test(value)) {
          this.config.write(this.settingVariables[index].path, value);
          this.notification.webNotify({type: 'accent', message: `${this.settingVariables[index].name} updated`});
        }
      });
    } else {
      this.notification.webNotify({ type: 'warn',
                                    message: 'Invalid variables specified!'});
    }
  }

  public readVariables() {
    for (let k in this.settingVariables) {
      this.settingVariables[k].value = this.config.read(this.settingVariables[k].path, this.settingVariables[k].default);
    }
  }

  ngOnInit(): void {
    this.debugging = this.config.read('settings.debug', 'false');
    (async() => {
      this.devToolsStatus = await this.devToolsState();
      this.defaultRegion = this.config.read('settings.default_region', 'us-east-1')
      this.regions = await this.awsPublicData.regionList();
      this.path = this.config.read('settings.path', '/usr/local/bin:/usr/bin')
      this.readVariables();
    })();
  }

}