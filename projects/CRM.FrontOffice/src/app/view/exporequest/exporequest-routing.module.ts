import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpoRequestComponent } from './exporequest.component';

const routes: Routes = [{
  path: '',
  component: ExpoRequestComponent,
  pathMatch: 'full'
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpoRequestRoutingModule { }
