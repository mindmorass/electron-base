import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkRoutingModule } from './network-routing.module';
import { NetworkComponent } from './network.component';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [NetworkComponent],
  imports: [CommonModule, SharedModule, NetworkRoutingModule, MaterialModule]
})
export class NetworkModule {}
