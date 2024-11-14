import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SustainabilityComponent } from './sustainability.component';

const routes: Routes = [
    {
        path: '',
        component: SustainabilityComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SustainabilityRoutingModule { }
