import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CartmodalComponent } from './cartmodal.component';

const routes: Routes = [{
  path: '',
  component: CartmodalComponent,
  pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartmodalRoutingModule { }
