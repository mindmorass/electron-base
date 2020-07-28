import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NetworkComponent } from './network.component';

const routes: Routes = [
  {
    path: 'network',
    component: NetworkComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NetworkRoutingModule {}
