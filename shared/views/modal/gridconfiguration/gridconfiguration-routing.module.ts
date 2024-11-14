import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GridconfigurationComponent } from './gridconfiguration.component';

const routes: Routes = [
    {
        path: '',
        component: GridconfigurationComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GridconfigurationRoutingModule {}