import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinkExpireComponent } from './link-expire.component';

const routes: Routes = [
    {
        path: '', component: LinkExpireComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LinkExpireRoutingModule {
}