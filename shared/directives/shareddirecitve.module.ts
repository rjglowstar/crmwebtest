import { NgModule } from '@angular/core';
import { CheckPasswordDirective } from './check-password.directive';
import { DateAgoPipe } from './dateago.pipe';
import { DragModalDirective } from './dragmodaldirective';
import { NumberFilterPipe } from './numberfilter.pipe';
import { NumberToWordsPipe } from './numbertowords.pipe';
import { Ng2TriStateCheckboxComponent } from './tristate-checkbox.component';
import { TypeFilterPipe } from './typefilter.pipe';
import { AlphanumericSpecialDirective } from './alphanumericspecial.directive';
import { TranslateModule } from '@ngx-translate/core';
import { LazyLoadDirective } from './lazyloaddirective';

@NgModule({
    declarations: [
        NumberFilterPipe,
        Ng2TriStateCheckboxComponent,
        TypeFilterPipe,
        DragModalDirective,
        DateAgoPipe,
        NumberToWordsPipe,
        CheckPasswordDirective,
        AlphanumericSpecialDirective,
        LazyLoadDirective,
    ],
    imports:[
        TranslateModule,
    ],
    exports: [
        NumberFilterPipe,
        Ng2TriStateCheckboxComponent,
        TypeFilterPipe,
        DragModalDirective,
        DateAgoPipe,
        NumberToWordsPipe,
        CheckPasswordDirective,
        TranslateModule,
        AlphanumericSpecialDirective,
        LazyLoadDirective
    ]

})
export class SharedDirectiveModule { }