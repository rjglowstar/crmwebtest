import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanmakerComponent } from './planmaker.component';

const routes: Routes = [
    {
        path: '',
        component: PlanmakerComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})


export class PlanmakerRoutingModule { }