import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuggestionlistComponent } from './suggestionlist.component';

const routes: Routes = [{ path: '', component: SuggestionlistComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuggestionlistRoutingModule { }
