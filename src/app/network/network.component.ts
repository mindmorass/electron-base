import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../core/services/electron/electron.service';
import { Router } from '@angular/router';
import { AwsPublicDataService } from '../core/services/aws-public-data/aws-public-data.service'
import { NetworkInterfaces } from './network-interfaces.interface';
import { CmdService } from '../core/services/cmd/cmd.service';
import execa from 'execa';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit {

  public publicIpAddress: string;
  public regions: string[];
  public resolvers: string[];
  public interfaces: NetworkInterfaces[] = [];
  public traceRunning: boolean;
  public result: string;

  constructor(
    private router: Router,
    private electron: ElectronService,
    private awsPublicData: AwsPublicDataService,
    private cmd: CmdService,
  ) {}

  public getLocalNetwork() {
    console.log(this.electron.os.networkInterfaces());
  }

  public getNetworkInfo() {
    const interfaces = this.electron.os.networkInterfaces();

    Object.keys(interfaces).forEach(iface => {
      const vpnInterfaceRex = new RegExp('^utun[0-9]{1,2}');
      const virtualInterfaceRex = new RegExp('^vnic[0-9]{1,2}');

      // identify the private vs vpn ip addresses (as they typically exist)

      interfaces[iface].forEach( item => {
        if (item.family === 'IPv4' &&
            ! item.internal &&
            ! virtualInterfaceRex.test(iface)) {
          if (vpnInterfaceRex.test(iface)) {
            // vpn interface(s)
            this.interfaces.push({
              address: item.address,
              icon: 'vpn_lock',
              title: 'VPN Address',
              subtitle: 'Company Network'
            });
          } else {
            // private interface(s)
            this.interfaces.push({
              address: item.address,
              icon: 'home',
              title: 'Private Address',
              subtitle: 'Local Network'
            });
          }
        }
      });
    });
  }

  public async traceroute() {
    this.traceRunning = true;

    const subprocess = execa.command('docker run -t mindmorass/linux-utilities:1.0.0 mtr google.com');
    subprocess.stdout.pipe(process.stdout);
  }

  ngOnInit(): void {
    (async() => {
      this.getNetworkInfo();
      this.publicIpAddress = await this.awsPublicData.myPublicIpAddress();
      this.regions = await this.awsPublicData.regionList();
      this.resolvers = this.electron.dns.getServers();
    })();
  }
}
