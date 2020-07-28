import { Injectable } from '@angular/core';
import { ElectronService } from '../electron/electron.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineStatusService {
  private _status;
  private _subject: Subject<string>;
  private _listenerName = 'online-status-service';

  constructor(private electronService: ElectronService) {
    this._subject = new Subject();
  }

  public get subject() {
    return this._subject;
  }

  public get listenerName() {
    return this._listenerName;
  }

  public set status(s: string) {
    this._status = s;
  }

  public get status() {
    return this._status;
  }

  public onlineStatusListener() {
    this.electronService.ipcRenderer.on(this.listenerName, (_, status) => {
      this.status = status;
      this.subject.next(status);
    });
  }

  public destroyOnlineListener() {
    this.electronService.ipcRenderer.removeAllListeners(this.listenerName);
  }
}