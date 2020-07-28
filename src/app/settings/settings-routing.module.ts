import { NgModule, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { DependenciesComponent } from '../dependencies/dependencies.component';

const routes: Routes = [
  {
    path: 'settings',
    component: SettingsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {
  @Input('DEPENDENCIES') data: DependenciesComponent;
}
