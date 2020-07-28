import { Component } from '@angular/core';
import { shell } from 'electron';
import { NotificationService } from '../core/services/notifications/notification.service';
import { ElectronService } from '../core/services/electron/electron.service';
import { ConfigService } from '../core/services/config/config.service';
import { CmdService } from '../core/services/cmd/cmd.service';
import { DEPENDENCIES } from './dependencies.list';

@Component({
  selector: 'app-dependencies',
  templateUrl: './dependencies.component.html',
  styleUrls: ['./dependencies.component.scss']
})
export class DependenciesComponent {
  public name: string;
  public pre_install: string;
  public package_name: string;
  public command: string;
  public manager: string;
  public installed: string;
  public installing: string;
  public show: string;
  public dependenciesList = DEPENDENCIES;

  constructor(electronService: ElectronService,
              private electron: ElectronService,
              private notification: NotificationService,
              private cmd: CmdService,
              private config: ConfigService) {
                this.getDependencyStates();
              }

  private getDependencyStates() {
    for (let dependency of this.dependenciesList) {
      console.log(dependency);
    }
  }

  public async install(pkg_name: string, pkg_preinstall: string, pkg_manager: string) {
    let proceed = false;
    this.installing = 'yes';
    if (pkg_preinstall !== '') {
      const result = await this.cmd.run(pkg_preinstall);
      if(result !== undefined) {
          proceed = true;
      } else {
        this.notification.webNotify({
          message:`Pre-Installation for ${this.package_name} failed.`,
          type: 'warn'
        });
      }
    } else {
      proceed = true;
    }

    if (proceed) {
      switch (pkg_manager) {
        case 'homebrew':
          this.run_install('brew', pkg_name, 1);
          break;
        case 'npm':
          this.run_install('npm', pkg_name, 1);
          break;
        case 'website':
          break;
        default:
          this.notification.webNotify({
            message: `Illegal package manager provided.`,
            type: 'warn'
          });
      }
    }
  }

  // run_install is broken out of install to do some minor pkg manager value assurance and recursion for retries

  private async run_install(pkgMgrCmd: string, pkg: string, count: number) {
    const npmGlobal = pkgMgrCmd === 'npm' ? '-g' : ' ';
    const result = await this.cmd.run(`${pkgMgrCmd} install${npmGlobal}${this.package_name}`);
    if(result !== undefined) {
        this.installed = 'yes';
        this.installing = 'no';
        this.notification.webNotify({
          message: `Successfully installed ${this.package_name} via ${pkgMgrCmd}.`,
          type: 'warn'
        });
      } else {
        if (count > 1) {
          this.installing = 'no';
          this.config.write(`packages.${this.package_name}`, false);
          this.notification.webNotify({
            message: `Failed to install ${this.package_name} via ${pkgMgrCmd}.`,
            type: 'warn'
          });
        } else {
          this.run_install(pkgMgrCmd, pkg, (count + 1));
        }
     }
  }
}
