import { Injectable } from '@angular/core';
import { spawn } from 'child_process';
import { LogsService } from '../logs/logs.service';
import { NotificationService } from '../notifications/notification.service';
import * as execa from 'execa';

@Injectable({
  providedIn: 'root'
})
export class CmdService {

  constructor(private logs: LogsService,
              private notification: NotificationService) { }

  public run(cmdString): void {

    const cmdArray = cmdString.split(' ');
    const command = cmdArray.shift();
    const args = cmdArray;
    let resultStream = ''; // set initial string to empty value

    const cmd = spawn(command, args, {
      // TODO: find a way to get user path here (withouth path issues arrise in packaged version)
      // compiled and developed use different UIDs
      env: { PATH: '/sbin:/bin:/usr/sbin:/usr/bin:/usr/local/sbin:/usr/local/bin' }
    });

    cmd.stdout.on('data', (data) => {
      resultStream += data;
    });

    // return error on fail

    cmd.stdout.on('error', (err) => {
      this.logs.logEvent({
        severity: 'error',
        message: err.toString()
      });

      this.notification.webNotify({
        message: 'Failed to run command',
        type: 'warn'
      });
    });

    // return data on success

   cmd.on('close', (code) => {
      if (code !== 0) {
        this.logs.logEvent({
          severity: 'error',
          message: `Failed to run command: ${cmd}`
        });
      }
    });
  }
}
