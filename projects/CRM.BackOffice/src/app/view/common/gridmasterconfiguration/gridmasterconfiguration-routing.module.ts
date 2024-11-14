import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridmasterconfigurationComponent } from './gridmasterconfiguration.component';

const routes: Routes = [
    {
        path: '',
        component: GridmasterconfigurationComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GridmasterconfigurationRoutingModule { }