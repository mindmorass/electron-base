import { Injectable } from '@angular/core';
import { ElectronService } from '../electron/electron.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationServiceInterface } from './notification.interface';
import { MainProcessNotificationsInterface } from '../../../../../main-process/core/services/notifications/notifications.interface';
import { LogsService } from '../logs/logs.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private ipc: any;
  private notificationDuration = 3000; // milliseconds (3 seconds)

  constructor(private electron: ElectronService,
              private snackbar: MatSnackBar,
              private log: LogsService) {
  }

  public listen() {
    this.ipc = this.electron.ipcRenderer;
    this.ipc.on('web-notify', (_, options: NotificationServiceInterface) => {
      this.notify({type: options.type, message: options.message, action: options.action, duration: options.duration});
    })
  }

  private notify(options: NotificationServiceInterface) {
    let timeMs = this.notificationDuration;
    if (options.hasOwnProperty('duration')) {
      timeMs = options.duration
    }

    this.snackbar.open(options.message, options.action, {
      duration: timeMs,
      panelClass: ['mat-toolbar', `mat-${options.type}`]
    });
  }

  osNotify(options: MainProcessNotificationsInterface) {
    let response: boolean = this.ipc.callMain('os-notify', options);
    if (! response) {
      this.log.logEvent({severity: 'error',
                         message: `OS Notification (unknown error) - message { title: ${options.title}, body: ${options.body}}`});
    }
  }

  public webNotify(options: NotificationServiceInterface) {
    this.notify(options);
  }

}
