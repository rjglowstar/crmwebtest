import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RfidstocktallyitemsComponent } from './rfidstocktallyitems.component';

const routes: Routes = [ {
  path: '',
  component: RfidstocktallyitemsComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfidstocktallyitemsRoutingModule { }
