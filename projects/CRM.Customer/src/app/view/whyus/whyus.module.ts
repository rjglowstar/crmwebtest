import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhyusComponent } from './whyus.component';
import { WhyusRoutingModule } from './whyus-routing.module';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        DialogsModule,
        WhyusRoutingModule,
        TranslateModule
    ],
    providers: [],
    declarations: [WhyusComponent]
})
export class WhyusModule { }