import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AwsPublicDataService } from '../core/services/aws-public-data/aws-public-data.service';
import { AwsCliService } from '../core/services/aws-cli/aws-cli.service';
import { ConfigService } from '../core/services/config/config.service';
import { NotificationService } from '../core/services/notifications/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { AwsClientDialogComponent } from './aws-client-dialog.component';
import { AwsStsService } from '../core/services/aws-sts/aws-sts.service';
import { ElectronService } from '../core/services/electron/electron.service';
import { AwsClientInterface } from './aws-client.interface';
import { AuthenticationService } from '../core/services/authentication/authentication.service';

@Component({
  selector: 'app-aws-client',
  templateUrl: './aws-client.component.html',
  styleUrls: ['./aws-client.component.scss']
})
export class AwsClientComponent implements OnInit {

  public awsCliConfig: object;
  public awsCliCredentials: object;
  public awsCliOutputs = ['text', 'table', 'json'];
  public profileValid: boolean;
  public callerIdentity: AwsClientInterface[] = [];
  public regions: string[];
  public loader: boolean;
  public cliCommand: string;
  public showCliEquivilent: boolean;
  public progressValue: number;
  public displayedColumns: string[] = ['key', 'value'];

  private _profile: string;
  private _region: string;
  private _output: string;
  private defaultProfileName = 'default';
  private interval: any;

  constructor(private router: Router,
              private awsPublicData: AwsPublicDataService,
              private awsClient: AwsCliService,
              private config: ConfigService,
              private dialog: MatDialog,
              private notification: NotificationService,
              private electron: ElectronService,
              private authentication: AuthenticationService,
              private sts: AwsStsService) {}

  public get region(): string {
    return this._region;
  }

  public set region(value: string) {
    this._region = value;
  }

  public get output(): string {
    return this._output;
  }

  public set output(value: string) {
    this._output = value;
  }

  private async getRegions() {
    this.regions = await this.awsPublicData.regionList();
  }

  private async getConfig() {
    this.awsCliConfig = await this.awsClient.getAwsCliConfig()
  }

  private async getCredentials() {
    this.awsCliCredentials = await this.awsClient.getAwsCliCredentials()
  }

  public saveProfiles() {
    this.awsClient.saveAwsCliConfig(this.awsCliConfig);
    (async() => {
      await this.getConfig();
      console.log(this.awsCliConfig);
    });
  }

  public get profile(): string {
    return this._profile;
  }

  public set profile(value: string) {
    this._profile = value;
  }

  public changeOutput(outputValue: string) {
    this.awsCliConfig[this.profile]['output'] = outputValue;
    this.output = outputValue;
    this.saveProfiles();
    this.showCliCommand(`aws configure set output ${outputValue}`);
    this.notification.webNotify(
      {type: 'accent', message: `Updated output for ${this.profile} profile.`}
    );
  }

  public changeRegion(regionValue: string) {
    this.awsCliConfig[this.profile]['region'] = regionValue;
    this.region = regionValue;
    this.saveProfiles();
    this.showCliCommand(`aws configure set region ${regionValue}`);
    this.notification.webNotify(
      {type: 'accent', message: `Updated region for ${this.profile} profile.`}
    );
  }

  public changeProfile(profileName: string) {
    this.profile = profileName;
    this.output = this.awsCliConfig[this.profile]['output'];
    this.region = this.awsCliConfig[this.profile]['region'];
    this.showCliCommand('aws sts get-caller-identity');
    this.config.write('aws_client.profile', this.profile)
    this.loader = true;
    this.isProfileValid();
  }

  private showCliCommand(awsCliCommand: string) {
    this.showCliEquivilent = true;
    this.progressValue =  100;
    this.cliCommand = awsCliCommand;

    if (this.profile !== 'default') {
      this.cliCommand += ` --profile ${this.profile}`;
    }

    clearInterval(this.interval);
    this.progressValue = 100;
    const counterSeconds = 5;
    const endCount = -5;
    const timer = counterSeconds * 10;

    this.interval = setInterval(() => {
      this.progressValue -= 1;
      if (this.progressValue <= endCount) {
          this.showCliEquivilent = false;
          clearInterval(this.interval);
      } 
    }, timer);
  }

  private formatCallerIdentity(callerIdentity: JSON): AwsClientInterface[] {
    const arn = callerIdentity['Arn'];
    const userId = callerIdentity['UserId'];
    const re = new RegExp('^arn:aws:(?<resource>sts|iam)::(?<account>[^:]+):((?<entity>[^\/]+)\/)?((?<role>.+)\/)?(?<id>.+)');
    const result = re.exec(arn);
    let formattedOutput: AwsClientInterface[];

    formattedOutput = [
      { key: 'Arn', value: arn },
      { key: 'AccountId', value: result.groups.account },
      { key: 'UserId', value: userId },
    ];

    if (result.groups.resource === 'sts') {
      formattedOutput.push({ key: 'SessionId', value: result.groups.id });
      formattedOutput.push({ key: 'Role', value: result.groups.role});
    } else {
      formattedOutput.push({ key: 'User', value: result.groups.id});
    }

    return formattedOutput;
  }

  private async isProfileValid() {
    const callerId = await this.sts.getCallerIdentity(this.profile);

    if (callerId === 'invalid' || typeof callerId !== 'string') {
      this.profileValid = false;
      this.callerIdentity = undefined;
    } else {
      const callerIdJson = JSON.parse(callerId);
      this.callerIdentity = this.formatCallerIdentity(callerIdJson);
      this.profileValid = true;
    }

    this.loader = false;
  }

  confirmRemoval(): void {
    const dialogRef = this.dialog.open(AwsClientDialogComponent, {
      width: '400px',
      data: {
        action: 'delete',
        profile: this.profile
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // call delete profile ONLY when the user confirms removal
      if (result) {
        this.deleteProfile(result.profile);
      }
    });
  }

  public deleteProfileCredentials() {
    delete this.awsCliCredentials[this.profile];
    this.callerIdentity = undefined;
    this.awsClient.saveAwsCliCredentials(this.awsCliCredentials);
    this.awsCliCredentials = this.getCredentials();
    this.changeProfile(this.profile);
    this.notification.webNotify({ type: 'accent',
                                  message: `Cleared credentials for profile ${this.profile}`});
  }

  public deleteProfile(profile: string) {
    delete this.awsCliConfig[profile];
    console.log(this.awsCliConfig);
    this.saveProfiles();
    this.notification.webNotify({ type: 'accent', 
                                  message: `Deleted ${profile} profile.` })
    this.changeProfile('default');
  }

  public async addProfile() {
   const dialogRef = this.dialog.open(AwsClientDialogComponent, {
     width: '400px',
     data: {
       action: 'add',
       awsRegions: this.regions,
       awsOutputs: this.awsCliOutputs,
       profile: '',
       region: this.config.read('settings.default_region', 'us-east-1'),
       output: 'json'
     }
   });

   dialogRef.afterClosed().subscribe(result => {
     if (result) {
       const regexp = /^[a-zA-Z0-9\-]+$/;
       if (regexp.test(result.profile)) {
         this.awsCliConfig[result.profile] = {};
         this.awsCliConfig[result.profile]['region'] = result.region;
         this.awsCliConfig[result.profile]['output'] = result.output;
         this.saveProfiles();
         this.notification.webNotify({ type: 'accent',
                                       message: `Profile ${result.profile} created successfully.`,
                                       action: 'close' });
         this.changeProfile(result.profile);
       } else {
         this.notification.webNotify({ type: 'warn',
                                       message: 'Invalid profile name! (Letters and Numbers Only)' });
       }
     }
   });
  }

  public async authenticate() {
    this.loader = true;
    if (await this.authentication.saml20Authentication()) {
      this.loader = false;
      const callerId = await this.sts.getCallerIdentity(this.profile);
      const callerIdJson = JSON.parse(String(callerId));
      this.callerIdentity = this.formatCallerIdentity(callerIdJson)
    } else {
      this.notification.webNotify({ type: 'warn',
                                    message: 'Failed to gather AWS and SAML data' });
    }
  }
     
  ngOnInit(): void {
    (async() => {
      await this.getConfig();
      await this.getCredentials();
      await this.getRegions();
    })().then(
      (_success) => {
        this.changeProfile(this.config.read('aws_client.profile', this.defaultProfileName));
      },
      (_error) => {
        this.notification.webNotify({type: 'warn',
                                     message: 'Failed to get AWS Cli profiles'});
    });
  }

}
