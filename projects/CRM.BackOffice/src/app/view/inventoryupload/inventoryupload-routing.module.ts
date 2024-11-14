import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryuploadComponent } from './inventoryupload.component';

const routes: Routes = [{
  path: '',
  component: InventoryuploadComponent,
  pathMatch: 'full'
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryuploadRoutingModule { }
