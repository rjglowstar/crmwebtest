import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CraftsmanshipComponent } from './craftsmanship.component';

const routes: Routes = [
  {
    path: '',
    component: CraftsmanshipComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CraftsmanshipRoutingModule { }
