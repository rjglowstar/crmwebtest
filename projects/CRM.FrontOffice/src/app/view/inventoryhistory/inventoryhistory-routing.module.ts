import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryhistoryComponent } from './inventoryhistory.component';

const routes: Routes = [
  {
    path: '',
    component: InventoryhistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryhistoryRoutingModule { }
