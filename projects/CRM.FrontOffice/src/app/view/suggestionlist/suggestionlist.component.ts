import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, Suggestion } from 'shared/enitites';
import { AppPreloadService, ConfigService, SuggestionService, UtilityService } from 'shared/services';
import { GridPropertiesService } from '../../services';
@Component({
  selector: 'app-suggestionlist',
  templateUrl: './suggestionlist.component.html'
})
export class SuggestionlistComponent implements OnInit {

  public gridView!: DataResult;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public mySelection: string[] = [];
  public fields!: GridDetailConfig[];
  public groups: GroupDescriptor[] = [];
  public skeletonArray = new Array(18);
  public pageSize = 26;
  public skip = 0
  public suggestions: Suggestion[] = [];
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;

  constructor(
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    private suggestionService: SuggestionService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    await this.getGridConfiguration();
    await this.loadSuggestions();
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "Suggestion", "SuggestionGrid", this.gridPropertiesService.getSuggestionListGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Suggestion", "SuggestionGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getSuggestionListGrid();
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadSuggestions();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadSuggestions();
  }

  private async loadSuggestions() {
    try {
      this.spinnerService.show();
      let suggestions: any = await this.suggestionService.getAllSuggestionPaginated(this.skip, this.pageSize);      
      this.gridView = process(suggestions?.suggestionList, { group: this.groups });
      this.gridView.total = suggestions.totalCount;
      this.spinnerService.hide();    
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }
}