import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PriceAnalyticsComponent } from './priceanalytic.component';

const routes: Routes = [{ path: '', component: PriceAnalyticsComponent, pathMatch: 'full' }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriceAnalyticsRoutingModule { }
