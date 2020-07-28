import { Injectable } from '@angular/core';
import { ElectronService } from '../electron/electron.service';

@Injectable({
  providedIn: 'root'
})
export class AwsPublicDataService {

  constructor(private electron: ElectronService) { }

  public async myPublicIpAddress() {
    const publicIp = await this.electron.ipcRenderer.callMain('webrequest',
      {url: 'https://checkip.amazonaws.com'});
    return publicIp.toString();
  }

  public async regionList() {
    let regions = [];
    const clientJson = await this.electron.ipcRenderer.callMain('webrequest', 
      {url: 'https://ip-ranges.amazonaws.com/ip-ranges.json'});
    const clientObject = JSON.parse(clientJson.toString());

    for (let i of clientObject['prefixes']) {
      let region = i['region'];
      if ((! regions.includes(region)) && (region != 'GLOBAL')) {
        regions.push(region)
      }
    }

    return regions.sort().reverse();
  }

}
