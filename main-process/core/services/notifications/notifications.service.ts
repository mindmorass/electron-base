import { ipcMain } from 'electron-better-ipc';
import { MainProcessNotificationsInterface } from './notifications.interface';
import { NotificationServiceInterface } from '../../../../src/app/core/services/notifications/notification.interface';
import { Notification } from 'electron';

export class MainProcessNotificationService {

  private notification: Notification;
  private ipc: any;

  constructor() {
    this.ipc = ipcMain;
  }

  public listen() {
    // to initialize a listener in the main process

    ipcMain.answerRenderer('os-notify', async (options: MainProcessNotificationsInterface) => {
      this.osNotify(options);
      return true;
    });
  }

  public webNotify(options: NotificationServiceInterface) {
    // to send to the render notification listener
    this.ipc.answerRenderer('web-notify', options);
  }

  public osNotify(options: MainProcessNotificationsInterface) {
    // send os level notification

    this.notification = new Notification(options);
    this.notification.show();
  }

}
