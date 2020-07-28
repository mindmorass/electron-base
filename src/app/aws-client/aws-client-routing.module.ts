import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AwsClientComponent } from './aws-client.component';

const routes: Routes = [
  {
    path: 'awsclient',
    component: AwsClientComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AwsClientRoutingModule {}