import * as log from 'electron-log';
import { LogServiceInterface } from '../../../../src/app/core/services/logs/logs.interface';

export class MainProcessLogsService {

  constructor() { }

  public logEvent(event: LogServiceInterface) {
    if (log[event.severity]) {
      log[event.severity](event.message);
    }
  }
}