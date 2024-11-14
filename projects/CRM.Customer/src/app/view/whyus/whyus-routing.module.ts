import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WhyusComponent } from './whyus.component';

const routes: Routes = [
    {
        path: '',
        component: WhyusComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WhyusRoutingModule { }