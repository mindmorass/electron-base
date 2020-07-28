import { net } from 'electron';
import { ipcMain } from 'electron-better-ipc';
import { MainProcessNotificationService } from '../notifications/notifications.service';
import { MainProcessWebrequestsInterface } from './webrequests.interface';

export class MainProcessWebrequestsService {

  public data: string;
  public notification: MainProcessNotificationService;

  constructor() {
    this.notification = new MainProcessNotificationService();
  }

  public listen() {
    // to initialize a listener in the main process
    ipcMain.answerRenderer('webrequest', async (options: MainProcessWebrequestsInterface) => {
      return await this.client(options);
    });
  }

  private async client(options: MainProcessWebrequestsInterface): Promise<any> {
    const promise = new Promise(function (resolve, reject) {
      let headers: object[] = [];

      if (options.hasOwnProperty('headers')) {
        headers = options.headers;
        delete options.headers;
      }

      // https://nodejs.org/api/http.html

      const sanitized_options: any = options;
      const client = net.request(sanitized_options);
      let webstream = '';

      // extract headers and normalized options to ClientRequest type

      if (headers.length > 0) {
        for (const h of headers) {
          client.setHeader(Object.keys(h)[0], Object.values(h)[0]);
        }
      }

      client.on('error', (e) => {
        this.notification.webNotify({type: 'warn', message: String(e)})
        reject(e.toString());
      });

      client.on('response', (response) => {
        response.on('data', (data) => {
          // appending data because it may come in multiple chunks
          webstream += data;
        });

        response.on('error', (e) => {
          this.notification.webNotify({type: 'warn', message: String(e)})
          reject(e.toString());
        });

        response.on('aborted', (e) => {
          this.notification.webNotify({type: 'warn', message: String(e)})
          reject(e.toString());
        });

        response.on('end', () => {
          resolve(webstream.toString());
        });
      });
      client.end();
    });

    promise.catch((err) => {
      throw err;
    });

    return promise;
  }
}
