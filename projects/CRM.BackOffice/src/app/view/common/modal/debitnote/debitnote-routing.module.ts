import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DebitNoteComponent } from './debitnote.component';

const routes: Routes = [
    {
        path: '',
        component: DebitNoteComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class DebitNoteRoutingModule { }