import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../core/services/electron/electron.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {

  private ipc: any;
  public downloadPercent: number;

  constructor(private router: Router,
              private electron: ElectronService) { 
    this.ipc = electron.ipcRenderer;
  }

  ngOnInit(): void {
    this.ipc.on('renderer-update-service', (value: number) => {
      this.downloadPercent = value;
    });
  }

}
