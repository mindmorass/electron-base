import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { NotificationService } from './core/services/notifications/notification.service';
import { OnlineStatusService } from './core/services/online-status/online-status.service';
import { LogsService } from './core/services/logs/logs.service';
import { ConfigService } from './core/services/config/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public online = true;
  public projects = false;
  public onlineMessage = 'Network Online';
  public depdendenciesMet: boolean;
  public policies: any;

  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    public logService: LogsService,
    private onlineStatusService: OnlineStatusService,
    private config: ConfigService
  ) {
    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);
    this.notificationService.listen();

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  ngOnInit() {
    this.electronService.ipcRenderer.send('online');
    this.onlineStatusService.onlineStatusListener();
    this.onlineStatusService.subject.subscribe(onlineState => {
      if (onlineState === 'online') {
        this.online = true;
        this.onlineMessage = 'Network Online';
      } else {
        this.online = false;
        this.onlineMessage = 'Network Offline';
        this.notificationService.webNotify({
          message: 'A network issue was detected.',
          type: 'warn'
        });
      }
    });
  }



  ngOnDestroy() {
    this.onlineStatusService.destroyOnlineListener();
  }

}