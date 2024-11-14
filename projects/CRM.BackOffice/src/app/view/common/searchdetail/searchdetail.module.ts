import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { GridModule } from "@progress/kendo-angular-grid";
import { LayoutModule } from "@progress/kendo-angular-layout";
import { SharedDirectiveModule } from "shared/directives";
import { MasterConfigService } from "../../../services";
import { SearchdetailComponent } from "./searchdetail.component";

@NgModule({
  imports: [
    CommonModule,
    GridModule,
    FormsModule,
    LayoutModule,
    SharedDirectiveModule
  ],
  declarations: [SearchdetailComponent],
  exports: [SearchdetailComponent],
  providers: [MasterConfigService]
})
export class SearchdetailModule { }