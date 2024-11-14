import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpoInventoryComponent } from './expoinventory.component';

const routes: Routes = [{
  path: '',
  component: ExpoInventoryComponent,
  pathMatch: 'full'
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpoInventoryRoutingModule { }
