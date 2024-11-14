import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridMasterConfig } from 'shared/enitites';
import { ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { GridPropertiesService } from '../../../services';

@Component({
  selector: 'app-gridmasterconfiguration',
  templateUrl: './gridmasterconfiguration.component.html',
  styleUrls: ['./gridmasterconfiguration.component.css']
})
export class GridmasterconfigurationComponent implements OnInit {

  public gridConfigPageList = [
    { pageName: "Organization", gridName: "OrganizationGrid", isActive: true },
    { pageName: "Employee", gridName: "EmployeeGrid", isActive: false },
    { pageName: "User", gridName: "UserGrid", isActive: false },
    { pageName: "SystemUsers", gridName: "SystemUserGrid", isActive: false },
    { pageName: "Lab", gridName: "LabGrid", isActive: false },
    { pageName: "Logistic", gridName: "LogisticGrid", isActive: false },
    { pageName: "CustomerVerification", gridName: "CustomerVerificationGrid", isActive: false },
    { pageName: "InventoryAdmin", gridName: "InventoryAdminGrid", isActive: false },
    { pageName: "MarketSheetCustomer", gridName: "MarketSheetCustomerGrid", isActive: false },
    { pageName: "MarketSheetSeller", gridName: "MarketSheetSellerGrid", isActive: false },
    { pageName: "RFID", gridName: "RFIDGrid", isActive: false },
    { pageName: "LabIssueMaster", gridName: "LabIssueMasterGrid", isActive: false },
    { pageName: "InclusionUpload", gridName: "InclusionUploadGrid", isActive: false },
    { pageName: "InventoryUpload", gridName: "InventoryUploadGrid", isActive: false },
    { pageName: "Inventory", gridName: "InventoryGrid", isActive: false },
    { pageName: "Grading", gridName: "GradingGrid", isActive: false },
    { pageName: "LabReconsiliation", gridName: "LabReconsiliationGrid", isActive: false },
    { pageName: "StockOnHand", gridName: "StockOnHandGrid", isActive: false },
    { pageName: "StoneMedia", gridName: "StoneMediaGrid", isActive: false },
    { pageName: "PriceRequest", gridName: "PriceRequestGrid", isActive: false },
    { pageName: "PlanMaker", gridName: "PlanMakerGrid", isActive: false },
    { pageName: "LabReceive", gridName: "LabReceiveGrid", isActive: false },
    { pageName: "LabIssue", gridName: "LabIssueGrid", isActive: false },
  ];
  public gridMasterConfigResponse!: GridMasterConfig;
  public gridFields: GridDetailConfig[] = [];

  private fxCredential!: fxCredential;
  public isViewButtons: boolean = false;

  constructor(
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private configService: ConfigService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
  ) { }

  async ngOnInit() {
    this.spinnerService.show();
    this.fxCredential = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
      this.isViewButtons = true;

    await this.getGridConfig(this.gridConfigPageList[0].pageName, this.gridConfigPageList[0].gridName);
  }

  public activePageClick(item: any, index: number) {
    this.spinnerService.show();
    this.gridConfigPageList.forEach((element, i) => {
      if (i == index) {
        element.isActive = true;
        this.getGridConfig(element.pageName, element.gridName);
      }
      else
        element.isActive = false;
    });
  }

  public async getGridConfig(pageName: string, gridName: string) {
    try {
      this.gridMasterConfigResponse = await this.configService.getMasterGridConfig(pageName, gridName);
      if (this.gridMasterConfigResponse)
        this.gridFields = this.gridMasterConfigResponse.gridDetail;
      else {
        if (pageName == "Organization")
          this.gridFields = this.gridPropertiesService.getOrganizationGrid();
        else if (pageName == "Employee")
          this.gridFields = this.gridPropertiesService.getEmployeeGrid();
        else if (pageName == "User")
          this.gridFields = this.gridPropertiesService.getUserGrid();
        else if (pageName == "SystemUsers")
          this.gridFields = this.gridPropertiesService.getSystemUserGrid();
        else if (pageName == "Lab")
          this.gridFields = this.gridPropertiesService.getLabMasterGrid();
        else if (pageName == "Logistic")
          this.gridFields = this.gridPropertiesService.getLogisticMasterGrid();
        else if (pageName == "CustomerVerification")
          this.gridFields = this.gridPropertiesService.getCustomerVerificationGrid();
        else if (pageName == "InventoryAdmin")
          this.gridFields = this.gridPropertiesService.getInventoryGrid();
        else if (pageName == "MarketSheetCustomer")
          this.gridFields = this.gridPropertiesService.getInventoryGrid();
        else if (pageName == "MarketSheetSeller")
          this.gridFields = this.gridPropertiesService.getInventoryGrid();
        else if (pageName == "RFID")
          this.gridFields = this.gridPropertiesService.getRFIDGrid();
        else if (pageName == "LabIssueMaster")
          this.gridFields = this.gridPropertiesService.getLabIssueMasterGrid();
        else if (pageName == "InclusionUpload")
          this.gridFields = this.gridPropertiesService.getInclusionUploadGrid();
        else if (pageName == "InventoryUpload")
          this.gridFields = this.gridPropertiesService.getInventoryUploadGrid();
        else if (pageName == "Inventory")
          this.gridFields = this.gridPropertiesService.getInventoryGrid();
        else if (pageName == "Grading")
          this.gridFields = this.gridPropertiesService.getGradingGrid();
        else if (pageName == "LabReconsiliation")
          this.gridFields = this.gridPropertiesService.getLabResultGrid();
        else if (pageName == "StoneMedia")
          this.gridFields = this.gridPropertiesService.getStoneMediaGrid();
        else if (pageName == "PriceRequest")
          this.gridFields = this.gridPropertiesService.getPriceRequestGrid();
        else if (pageName == "PlanMaker")
          this.gridFields = this.gridPropertiesService.getPlanMakerGrid();
        else if (pageName == "LabReceive")
          this.gridFields = this.gridPropertiesService.getLabReceiveGrid();
        else if (pageName == "LabIssue")
          this.gridFields = this.gridPropertiesService.getLabIssueGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public async savePageGridSettings() {
    try {
      this.spinnerService.show();
      let activePage = this.gridConfigPageList.find(x => x.isActive == true);
      if (activePage) {
        let gridConfigItem = new GridMasterConfig();
        gridConfigItem.pageName = activePage.pageName;
        gridConfigItem.gridName = activePage.gridName;
        this.gridFields.forEach((item, i) => {
          item.sortOrder = i + 1;
        });
        gridConfigItem.gridDetail = this.gridFields;
        if (this.gridMasterConfigResponse && this.gridMasterConfigResponse.id != undefined && this.gridMasterConfigResponse.id != null)
          gridConfigItem.id = this.gridMasterConfigResponse.id;

        if (gridConfigItem.id) {
          let response: boolean
          response = await this.configService.updateMasterGridConfig(gridConfigItem);
          this.spinnerService.hide();
          this.utilityService.showNotification(`You have been updated Grid-configuration successfully!`)
          await this.getGridConfig(activePage.pageName, activePage.gridName);
        }
        else {
          let response: string
          response = await this.configService.insertMasterGridConfig(gridConfigItem);
          this.spinnerService.hide();
          this.utilityService.showNotification(`You have been saved Grid-configuration successfully!`)
          await this.getGridConfig(activePage.pageName, activePage.gridName);
        }
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }

  }

}