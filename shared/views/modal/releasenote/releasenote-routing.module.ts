import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReleasenoteComponent } from './releasenote.component';

const routes: Routes = [
    {
        path: '',
        component: ReleasenoteComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReleasenoteRoutingModule {}