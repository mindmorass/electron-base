import { Injectable } from '@angular/core';
import { LogServiceInterface } from './logs.interface';
import * as log from 'electron-log';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  constructor() { }

  public logEvent(event: LogServiceInterface) {
    if (log[event.severity]) {
      log[event.severity](event.message);
    }
  }
}
