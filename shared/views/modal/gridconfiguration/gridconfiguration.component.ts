import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoneProposalService } from 'projects/CRM.Customer/src/app/services';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig } from 'shared/enitites';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views/common/alertdialog/alertdialog.service';

@Component({
  selector: 'app-gridconfiguration',
  templateUrl: './gridconfiguration.component.html',
  styleUrls: ['./gridconfiguration.component.css']
})
export class GridconfigurationComponent implements OnInit {

  @Input() fields: GridDetailConfig[] = [];
  @Input() gridConfigId?: string;
  @Input() pageName!: string;
  @Input() gridName!: string;
  @Input() fxUserId!: string;
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() ChildEvent = new EventEmitter();
  private fxCredential!: fxCredential;
  public cloneFields: GridDetailConfig[] = [];

  constructor(public utilityService: UtilityService,
    private stoneProposalService: StoneProposalService,
    private appPreloadService: AppPreloadService,
    private configService: ConfigService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private router: Router) { }

  async ngOnInit() {
    this.spinnerService.show();
    if (!this.fxUserId) {
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);
    }

    this.cloneFields = JSON.parse(JSON.stringify(this.fields))
    this.fields = this.fields.filter(c => c.title.toLowerCase() != "checkbox");

    if (this.fields && this.fields.length > 0) {
      this.fields = JSON.parse(JSON.stringify(this.fields));
    }
    this.spinnerService.hide();
  }

  public async saveGridConfiguration() {
    try {
      this.spinnerService.show();
      let gridConfigItem = new GridConfig();
      if (this.gridConfigId)
        gridConfigItem.id = this.gridConfigId;

      if (this.fxUserId)
        gridConfigItem.empID = this.fxUserId;
      else
        gridConfigItem.empID = this.fxCredential.id;
      gridConfigItem.pageName = this.pageName;
      gridConfigItem.gridName = this.gridName;

      let checkBoxField = this.cloneFields.find(c => c.title.toLowerCase() == "checkbox");
      if (checkBoxField)
        this.fields.unshift(checkBoxField)

      this.fields.forEach((item, i) => {
        item.sortOrder = i + 1;
      });
      gridConfigItem.gridDetail = this.fields;
      let flag: any;
      if (!this.fxUserId) {
        if (this.gridConfigId) {
          flag = await this.configService.updateGridConfig(gridConfigItem);
          this.utilityService.showNotification(`You have been updated Grid-configuration successfully!`)
        }
        else {
          flag = await this.configService.insertGridConfig(gridConfigItem);
          gridConfigItem.id = flag;
          this.utilityService.showNotification(`You have been added Grid-configuration successfully!`)
        }
      }
      else {
        if (this.gridConfigId) {
          flag = await this.stoneProposalService.updateGridConfig(gridConfigItem);
          this.utilityService.showNotification(`You have been updated Grid-configuration successfully!`)
        }
        else {
          flag = await this.stoneProposalService.insertGridConfig(gridConfigItem);
          gridConfigItem.id = flag;
          this.utilityService.showNotification(`You have been added Grid-configuration successfully!`)
        }
      }

      if (flag) {
        if (this.fxCredential && this.fxCredential.id) {
          let collection = JSON.parse(sessionStorage.getItem("GridConfig") || '[]') as GridConfig[];
          if (collection && collection.length > 0) {
            let index = collection.findIndex(c => c.empID == this.fxCredential.id && c.pageName.toLowerCase() == this.pageName.toLowerCase() && c.gridName.toLowerCase() == this.gridName.toLowerCase());
            if (index >= 0)
              collection[index] = gridConfigItem;
            else
              collection.push(gridConfigItem);
            sessionStorage.setItem("GridConfig", JSON.stringify(collection));
          }
          else {
            collection.push(gridConfigItem);
            sessionStorage.setItem("GridConfig", JSON.stringify(collection));
          }
        }
        this.parentMethodCall(gridConfigItem);
        this.closeGridConfigDialog();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
      this.spinnerService.hide();
    }
  }

  private parentMethodCall(gridConfigItem: GridConfig): void {
    this.ChildEvent.emit(gridConfigItem);
  }

  public closeGridConfigDialog(): void {
    this.toggle.emit(false);
  }
}