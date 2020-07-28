import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AwsClientRoutingModule } from './aws-client-routing.module';
import { MaterialModule } from '../material.module';

import { AwsClientComponent } from './aws-client.component';
import { SharedModule } from '../shared/shared.module';
import { AwsClientDialogComponent } from './aws-client-dialog.component';

@NgModule({
  declarations: [AwsClientComponent, AwsClientDialogComponent],
  imports: [CommonModule, SharedModule, MaterialModule, AwsClientRoutingModule],
  entryComponents: [AwsClientDialogComponent]
})
export class AwsClientModule {}
