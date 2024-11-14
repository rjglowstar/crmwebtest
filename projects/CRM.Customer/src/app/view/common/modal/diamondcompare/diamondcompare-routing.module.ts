import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiamondCompareComponent } from './diamondcompare.component';

const routes: Routes = [
  {
    path: '',
    component: DiamondCompareComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiamondCompareRoutingModule { }
