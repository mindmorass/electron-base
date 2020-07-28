import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { MaterialModule } from '../material.module';

import { SettingsComponent } from './settings.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [SettingsComponent],
  imports: [CommonModule, SharedModule, SettingsRoutingModule, MaterialModule]
})
export class SettingsModule {}
