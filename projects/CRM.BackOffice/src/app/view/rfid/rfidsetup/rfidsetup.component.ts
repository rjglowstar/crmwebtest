import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, SystemUserPermission } from 'shared/enitites';
import { ConfigService, StockSetupRFIDFormat, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { CommuteItem, InventorySearchCriteria, InventorySearchResponse, InventorySelectAllItems, RfidCommuteItem } from '../../../businessobjects';
import { InventoryItems } from '../../../entities';
import { CommuteService, GridPropertiesService, RfidService } from '../../../services';
declare var Spacecode: any;


@Component({
  selector: 'app-rfidsetup',
  templateUrl: './rfidsetup.component.html',
  styleUrls: ['./rfidsetup.component.css']
})
export class RfidsetupComponent implements OnInit, OnDestroy {
  // RFID doc spacecode
  // https://www.spacecode.com/HtmlDoc/docs/jsdoc/

  public fxCredential?: fxCredential;
  //#region Grid Init
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public totalCount: number = 0;
  public isRegEmployee: boolean = false;
  public filterFlag = false;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public inventoryItems: InventoryItems[] = [];
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public tempInventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public stoneId!: string;
  public rfid!: string;
  public certificateNo!: string;
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];

  public foundSkip = 0;
  public notFoundSkip = 0;
  public allocatedSkip = 0;
  public notAllocatedSkip = 0;
  public rfIdGridPageSize = 6;
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  //#endregion

  //#region RFID Modal
  public rfidValue: string = "";
  public isAddRFID: boolean = false;
  public isAddRFIDInfo: boolean = false;
  public inventoryObj: InventoryItems = new InventoryItems();
  public cloneInventoryObj: InventoryItems = new InventoryItems();
  //#endregion RFID Modal

  //#region RFID Scan
  public device: any;
  // public scannedTags: string[] = ["AMT-898", "AMT-5468", "AMT-546", "AMT-204", "AMT-205", "AMT-206", "AMT-207", "AMT-208", "AMT-209", "AMT-210"];
  public scannedTags: string[] = [];

  public foundTags: any[] = [];
  public notFoundTags: any[] = [];
  public listNotFoundTags: any[] = [];
  public allocatedTags: any[] = [];
  public notAllocatedTags: any[] = [];

  public filterFoundTags!: DataResult;
  public filterNotFoundTags!: DataResult;
  public filterAllocatedTags!: DataResult;
  public filterNotAllocatedTags!: DataResult;

  public selectableModalSettings: SelectableSettings = { mode: 'single' };
  public myScanSelection: string[] = [];
  public selectedScanStone: InventoryItems = new InventoryItems();
  public allInventoryItems: InventorySelectAllItems[] = [];
  public selectedStones: any[] = [];
  public statusText: string = "ERROR";
  public statusTextBgClass: string = "bg-danger";
  public isScanCompleted: boolean = true;
  public tagArr: any = [];
  // public isLighting: boolean = false;
  public isAllAllocatedLighting: boolean = false;
  public isAllNotAllocatedLighting: boolean = false;
  public isAllFoundLighting: boolean = false;
  //#endregion RFID Scan

  public isViewButtons: boolean = false;
  public isCanAccessAllButtons: boolean = false;
  public timer: any;

  constructor(
    private router: Router,
    private rfidService: RfidService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private changeDetRef: ChangeDetectorRef,
    public commuteService: CommuteService) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
    this.loadSpaceCodeScan();
  }

  public async defaultMethodsLoad() {
    let deviceUrl: string = '';
    this.fxCredential = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    await this.setUserRights();

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
      this.isCanAccessAllButtons = true;

    this.inventorySearchCriteriaObj.organizationId = this.fxCredential.organizationId;
    if (environment.production)
      deviceUrl = "ws://" + this.fxCredential.deviceRFIDUrl;
    else
      deviceUrl = "ws://" + this.fxCredential.deviceRFIDUrl;
    this.device = new Spacecode.Device(deviceUrl);
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
    // this.device = new Spacecode.Device("192.168.10.66");
    // mumbai : "192.168.10.66"
    this.inventorySearchCriteriaObj.status = [StoneStatus.Lab.toString(), StoneStatus.Pricing.toString(), StoneStatus.Transit.toString(), StoneStatus.Order.toString(), StoneStatus.Sold.toString(), StoneStatus.Stock.toString(), StoneStatus.Repair.toString()]
    this.inventorySearchCriteriaObj.status.map(z => { this.listStatus.push({ name: z.toString(), isChecked: true }); });
    this.utilityService.onMultiSelectChange(this.listStatus, this.inventorySearchCriteriaObj.status);
    await this.getGridConfiguration();
    await this.loadInventoryData();
  }

  public filterStatusDropdownSearch(e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    Object.values(StoneStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential?.id ?? '', "RFID", "RFIDGrid", this.gridPropertiesService.getRFIDGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("RFID", "RFIDGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getRFIDGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  //#region InvGrid
  public async loadInventoryData() {
    try {
      this.spinnerService.show();

      this.inventorySearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.inventorySearchCriteriaObj.rfids = this.rfid ? this.utilityService.checkCertificateIds(this.rfid) : [];
      this.inventorySearchCriteriaObj.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
     
      let res = await this.rfidService.getInventoryItemsBySearch(this.inventorySearchCriteriaObj, this.skip, this.pageSize);
      if (res) {
        this.inventoryItems = res.inventories;
        this.gridView = process(res.inventories, { group: this.groups });
        this.gridView.total = res.totalCount;
        this.totalCount = res.totalCount;
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanDeleteLedger = userPermissions.actions.find(z => z.name == "CanAccessSetupButtons");
      if (CanDeleteLedger != null)
        this.isCanAccessAllButtons = true;
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadInventoryData();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadInventoryData();
  }

  public selectedRowChange(e: any) {
    this.inventoryObj = new InventoryItems();
    if (this.mySelection != null && this.mySelection.length > 0) {
      var selectedInv = this.inventoryItems.find(z => z.id == this.mySelection[0]);
      let value: InventoryItems = JSON.parse(JSON.stringify(selectedInv));
      value.labSendDate = this.utilityService.getValidDate(value.labSendDate);
      value.labReceiveDate = this.utilityService.getValidDate(value.labReceiveDate);
      value.marketSheetDate = this.utilityService.getValidDate(value.marketSheetDate);
      this.inventoryObj = { ...value };
    }

    if (e.selectedRows && e.selectedRows.length > 0) {
      e.selectedRows.forEach((element: any) => {
        let Selectedindex = this.selectedStones.findIndex(x => x.id == element.dataItem.id);
        if (Selectedindex < 0) {
          this.selectedStones.push(element.dataItem)
        }
      });
    }
    else {
      e.deselectedRows.forEach((element: any) => {
        if (!element.dataItem.isDisabled) {
          let index = this.selectedStones.findIndex(x => x.id == element.dataItem.id);
          if (index >= 0)
            this.selectedStones.splice(index, 1)
        }
      });
    }
    if (this.mySelection.length == 1)
      this.selectedStones = this.selectedStones.filter(x => x.id == this.mySelection[0]);

  }

  //#endregion InvGrid

  //#region Grid Config
  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
    if (gridConfig) {
      this.fields = gridConfig.gridDetail;
      this.gridConfig = new GridConfig();
      this.gridConfig.id = gridConfig.id
      this.gridConfig.gridDetail = gridConfig.gridDetail;
      this.gridConfig.gridName = gridConfig.gridName;
      this.gridConfig.pageName = gridConfig.pageName;
      this.gridConfig.empID = gridConfig.empID;
    }
  }

  public rfIdGridPageChange(event: PageChangeEvent, data: any[]): DataResult {
    let skip = event.skip;

    let allData = JSON.parse(JSON.stringify(data));
    let filterData = allData.slice(skip, skip + this.rfIdGridPageSize);

    let dataResult: DataResult = process(filterData, { group: [] });
    dataResult.total = allData.length;
    return dataResult;
  }
  //#endregion Grid 

  //#region RFID Modal
  public openRFIDModal() {
    if (this.fxCredential?.deviceRFIDUrl) {
      this.isAddRFID = true;
      this.cloneInventoryObj = { ...this.inventoryObj };
    }
    else
      this.alertDialogService.show("Please configure the RFID device url in the specific organization branch, contact your system administrator.");
  }

  public closeAddRFIDDialog() {
    this.isAddRFID = false;
    this.mySelection = [];
    this.cloneInventoryObj = new InventoryItems();

  }

  public async onRFIDSubmit(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        if (this.inventoryObj.rfid == this.cloneInventoryObj.rfid) {
          this.spinnerService.hide();
          this.utilityService.showNotification(`Record updated successfully!`);
          this.closeAddRFIDDialog();
          return;
        }
        if (this.isAddRFIDInfo)
          this.inventoryObj = this.selectedScanStone;

        let lsd = this.inventoryObj.labSendDate;
        this.inventoryObj.labSendDate = lsd ? this.utilityService.setUTCDateFilter(lsd) : null;
        let lrd = this.inventoryObj.labReceiveDate;
        this.inventoryObj.labReceiveDate = lrd ? this.utilityService.setUTCDateFilter(lrd) : null;
        let msd = this.inventoryObj.marketSheetDate;
        this.inventoryObj.marketSheetDate = msd ? this.utilityService.setUTCDateFilter(msd) : null;

        let res = await this.rfidService.updateInventoryData(this.inventoryObj)
        if (res) {
          this.spinnerService.hide();
          if (this.isAddRFID)
            this.closeAddRFIDDialog();
          else
            this.closeAddRFIDInfoDialog();

          let rfidCommuteItemList = new Array<RfidCommuteItem>();
          rfidCommuteItemList.push({ stoneId: this.inventoryObj.stoneId, rfidNo: this.inventoryObj.rfid });
          await this.callCommuteRfid(rfidCommuteItemList);

          this.mySelection = [];
          this.myScanSelection = [];

          this.loadInventoryData();
          this.utilityService.showNotification(`Record updated successfully!`)
          form.reset();
          this.selectedStones = [];
          this.inventoryObj = new InventoryItems()
        }
        else {
          this.spinnerService.hide();
          this.utilityService.showNotification(`Something went wrong, Try again later!`)
        }
      }
      else
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  //#endregion RFID Modal

  //#region Export To Excel
  public async exportToExcel() {
    this.spinnerService.show();
    var excelFile: any[] = [];
    let fetchInventories: any = await this.rfidService.getInventoriesWithOutRFID();
    if (fetchInventories && fetchInventories.length > 0) {
      let exportData: any[] = fetchInventories;

      exportData.forEach(element => {
        var excel = this.convertArrayToObject(this.fields, element);
        const { Checkbox, ...rest } = excel;
        excelFile.push(rest);
      });

      if (excelFile.length > 0)
        this.utilityService.exportAsExcelFile(excelFile, "Stone_Excel_");
      else
        this.spinnerService.hide();
    }
    else {
      this.spinnerService.hide();
      this.alertDialogService.show("No data to export!");
    }
    this.spinnerService.hide();
  }

  public convertArrayToObject(fields: GridDetailConfig[], element: any): any {
    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].title.toString() != "checkbox")
        obj[fields[i].title] = element[fields[i].propertyName];
    }
    return obj;
  }
  //#endregion

  //#region Import From Excel
  public async onSelectExcelFile(event: Event) {
    try {

      let finalImportData: InventoryItems[] = [];
      let acceptedFiles: string[] = [];
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(function (item) {
          return item.trim();
        });
      }

      if (target.files && target.files.length) {
        if (acceptedFiles.indexOf(target.files[0].type) == -1) {
          this.alertDialogService.show(`Please select valid file.`);
          return;
        }


        let file = target.files[0];
        let fileReader = new FileReader();
        // this.clearGrid();
        this.spinnerService.show();
        fileReader.onload = async (e) => {

          var arrayBuffer: any = fileReader.result;
          let data = new Uint8Array(arrayBuffer);
          let arr = new Array();

          for (let i = 0; i != data.length; ++i)
            arr[i] = String.fromCharCode(data[i]);

          let workbook = xlsx.read(arr.join(""), { type: "binary" });

          let Heading = ["stoneId", "rfid"]
          var inventoryFetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: Heading }) as any;
          let finalRfidInvItems: Array<{ stoneId: string, rfid: string }> = new Array<{ stoneId: string, rfid: string }>();

          if (inventoryFetchExcelItems && inventoryFetchExcelItems.length > 0) {

            // starting index given 1 because 1st record should be header
            for (let index = 1; index < inventoryFetchExcelItems.length; index++) {
              let element = inventoryFetchExcelItems[index];
              if (element.hasOwnProperty("stoneId")) {
                if (element.stoneId)
                  element.stoneId = element.stoneId.toLowerCase().trim();
                if (element.rfid)
                  element.rfid = element.rfid.toString().trim();
                if (element.stoneId && element.rfid)
                  finalRfidInvItems.push(element);
              }

            }

            if (finalRfidInvItems.length > 0) {
              let valueRFIDArr = finalRfidInvItems.map(e => e.rfid);
              let isDuplicateRFId = valueRFIDArr.filter(function (item, idx) {
                return valueRFIDArr.indexOf(item) != idx
              });

              let valueStoneArr = finalRfidInvItems.map(e => e.stoneId);
              let isDuplicateStone = valueStoneArr.filter(function (item, idx) {
                return valueStoneArr.indexOf(item) != idx
              });

              if (isDuplicateRFId && isDuplicateRFId.length > 0) {
                this.spinnerService.hide();
                this.alertDialogService.show(`Duplicate <b>${isDuplicateRFId.join(", ")}</b> RFID found in excel sheet!`);
                return;
              }

              if (isDuplicateStone && isDuplicateStone.length > 0) {
                this.spinnerService.hide();
                this.alertDialogService.show(`Duplicate <b>${isDuplicateStone.join(", ")}</b> Stones found in excel sheet!`);
                return;
              }

              if ((isDuplicateRFId && isDuplicateRFId.length > 0) && (isDuplicateStone && isDuplicateStone.length > 0)) {
                this.spinnerService.hide();
                this.alertDialogService.show(`Duplicate <b>${isDuplicateStone.join(", ")}</b> Stones & <b>${isDuplicateRFId.join(", ")}</b> RFID found in excel sheet!`);
                return;
              }

              if ((inventoryFetchExcelItems.length - 1) != finalRfidInvItems.length) {
                this.alertDialogService.show("Please check the excel file, it contains some invalid data!");
                this.spinnerService.hide();
                return;
              }
              else {
                let stoneIds: string[] = finalRfidInvItems.map(element => element.stoneId);
                let existStoneIds: InventoryItems[] = await this.rfidService.getStoneIdsExistOrNotAsync(stoneIds);
                if (existStoneIds.length != (inventoryFetchExcelItems.length - 1)) {
                  let invalidStoneIds = stoneIds.filter(x => !existStoneIds.map(x => x.stoneId.toLowerCase()).includes(x.toLowerCase()));
                  this.alertDialogService.show(`Please check the excel file, it contains invalid <b>${invalidStoneIds.join(", ")}</b> stoneIds!`);
                  this.spinnerService.hide();
                  return;
                }
                else {

                  let rfidsRequest: string[] = finalRfidInvItems.map(element => element.rfid);
                  let fetchInventories: InventoryItems[] = await this.rfidService.getrfIdsExistOrNotAsync(rfidsRequest);
                  if (fetchInventories && fetchInventories.length > 0) {
                    finalRfidInvItems = finalRfidInvItems.filter(x => !fetchInventories.map(x => x.rfid).includes(x.rfid))
                    this.alertDialogService.show(`Please check the excel file, <b>${fetchInventories.map(x => x.rfid).join(", ")}</b> already exist RFID!`);
                  }

                  for (let index = 0; index < finalRfidInvItems.length; index++) {
                    const element = finalRfidInvItems[index];
                    if (element.stoneId) {
                      let fetchInvData: InventoryItems = existStoneIds.find(x => x.stoneId.toLowerCase() == element.stoneId.toLowerCase()) ?? new InventoryItems();
                      if (fetchInvData.stoneId) {
                        fetchInvData.rfid = element.rfid;
                        finalImportData.push(fetchInvData);
                      }
                    }
                  }

                  if (finalImportData && finalImportData.length > 0) {
                    let responseImport: boolean = await this.rfidService.updateInventoryListData(finalImportData);
                    if (responseImport) {
                      this.spinnerService.hide();
                      this.loadInventoryData();

                      let rfidCommuteItemList = new Array<RfidCommuteItem>();
                      rfidCommuteItemList = finalImportData.map(inv => ({ stoneId: inv.stoneId, rfidNo: inv.rfid }));
                      await this.callCommuteRfid(rfidCommuteItemList);
                      finalImportData = [];
                      this.utilityService.showNotification("RFID has been imported successfully!");
                    }
                    else {
                      this.spinnerService.hide();
                      this.alertDialogService.show("Something went wrong while importing Excel, Try again later!");
                    }
                  }
                  else
                    this.spinnerService.hide();

                }
              }
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show("Something went wrong while importing Excel, Try again later!");
            }
          }
          else {
            this.spinnerService.hide();
            this.alertDialogService.show("Something went wrong while importing Excel, Try again later!");
          }

        }
        fileReader.readAsArrayBuffer(file);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  //#endregion Import From Excel

  //#region Scan RFID

  public loadSpaceCodeScan() {
    try {
      // var device = new Device("192.168.1k.20");
      this.getRFIDStatus(this.device._status);
      let that = this;
      this.device.connect();

      this.device.on('connected', function () {
        that.getRFIDStatus(that.device.getStatus());
      });

      this.device.on('disconnected', function () {
        that.getRFIDStatus(that.device.getStatus());
      });

      this.device.on('scanstarted', function () {
        // that.cleanScan();
        that.spinnerService.show()
        that.getRFIDStatus(that.device.getStatus());
      });

      this.device.on('tagadded', function (tagUid: any) {
        let index = that.scannedTags.findIndex(x => x == tagUid);
        if (index < 0)
          that.scannedTags.push(tagUid);

      });

      this.device.on('scancompleted', async function () {
        that.spinnerService.show();


        if (!that.isScanCompleted) {
          that.getRFIDStatus(that.device.getStatus());
          that.isScanCompleted = true;
        }
        //#region scan code old
        if (that.scannedTags && that.scannedTags.length > 0) {
          // that.cleanScan();
          that.selectedStones = [];

          that.inventorySearchCriteriaObj.status = [StoneStatus.Lab.toString(), StoneStatus.Pricing.toString(), StoneStatus.Transit.toString(), StoneStatus.Order.toString(), StoneStatus.Sold.toString(), StoneStatus.Stock.toString(), StoneStatus.Repair.toString()]
          let res: InventorySearchResponse = await that.rfidService.getInventoryItemsBySearch(that.inventorySearchCriteriaObj, 0, that.totalCount);
          if (res.inventories && res.inventories.length > 0) {

            let scanInventories: InventoryItems[] = res.inventories;

            if (scanInventories && scanInventories.length > 0) {
              for (let index = 0; index < that.mySelection.length; index++) {
                const element = that.mySelection[index];
                let inventoryItem: any = scanInventories.find((x: InventoryItems) => x.id == element);
                inventoryItem.isLighting = false;
                that.selectedStones.push(inventoryItem);
              }

              if (that.selectedStones && that.selectedStones.length > 0) {
                for (let index = 0; index < that.scannedTags.length; index++) {
                  const element = that.scannedTags[index];

                  let findingRFID = that.selectedStones.find((x: InventoryItems) => x.rfid == element);
                  if (findingRFID) {
                    let isExistFound = that.foundTags.some(x => x.rfid == element);
                    if (!isExistFound)
                      that.foundTags.push(findingRFID);

                  }

                  let remainRFID = scanInventories.find((x: InventoryItems) => x.rfid == element);

                  if (remainRFID) {
                    if (!findingRFID) {
                      let isExistRemainFound = that.allocatedTags.some(x => x.rfid == element);
                      if (!isExistRemainFound)
                        that.allocatedTags.push({ stoneId: remainRFID.stoneId, rfid: element });

                    }
                  }
                  else {
                    let isExistNotAllocatedFound = that.notAllocatedTags.some(x => x.rfid == element);
                    if (!isExistNotAllocatedFound)
                      that.notAllocatedTags.push({ rfid: element, isLighting: false });

                  }
                }

                if (that.foundTags.length > 0) {
                  that.notFoundTags = that.selectedStones.filter(x => !that.foundTags.map(a => a.stoneId).includes(x.stoneId));
                  let cloneNotFound = JSON.parse(JSON.stringify(that.notFoundTags));
                  that.listNotFoundTags = cloneNotFound.filter((x: any) => x.rfid == null);
                  that.notFoundTags = that.notFoundTags.filter(x => !(x.rfid == "" || x.rfid == null))
                }
                // else
                //   that.notFoundTags = that.selectedStones;
                that.allocatedTags = that.allocatedTags.map((str) => ({ stoneId: str.stoneId, rfid: str.rfid, isLighting: false }));
                // that.notAllocatedTags = that.notAllocatedTags.map((str) => ({ rfid: str, isLighting: false }));

                //Init Filter data in RFId Grids
                let event: any = { skip: 0 };
                that.filterFoundTags = that.rfIdGridPageChange(event, that.foundTags);
                that.filterNotFoundTags = that.rfIdGridPageChange(event, that.notFoundTags);
                that.filterAllocatedTags = that.rfIdGridPageChange(event, that.allocatedTags);
                that.filterNotAllocatedTags = that.rfIdGridPageChange(event, that.notAllocatedTags);

                that.spinnerService.hide();

                that.changeDetRef.detectChanges();

              }
              else
                that.spinnerService.hide();
            }
            else
              that.spinnerService.hide();

            //#endregion
          }
          else
            that.spinnerService.hide();
        }
        else
          that.spinnerService.hide();

      });

      this.routerOnActivate();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      // this.alertDialogService.show(error.error)
    }
  }

  public openRFIDInfoModal() {
    this.cleanScan();
    this.isAddRFIDInfo = true;
  }

  public closeAddRFIDInfoDialog() {
    this.cleanScan();
    this.isAddRFIDInfo = false;
    this.mySelection = [];
    this.selectedStones = [];
  }

  public async startScan() {
    try {
      this.spinnerService.show();
      // this.cleanScan();
      this.scannedTags = [];

      this.isScanCompleted = false;
      if (this.device.getStatus().toUpperCase() == "READY")
        this.device.requestScan();
      // else
      //   this.alertDialogService.show("Please Check Device.Device is Not Ready for Scan")

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public stopScan() {
    this.device.stopScan();
    this.refreshDevice();
    // this.getRFIDStatus('READY');
  }

  public cleanScan() {
    this.tagArr = [];
    // this.scannedTags = [];
    this.foundTags = [];
    this.notFoundTags = [];
    this.allocatedTags = [];
    this.notAllocatedTags = [];
    this.filterAllocatedTags = undefined as any;
    this.filterNotAllocatedTags = undefined as any;
    this.filterFoundTags = undefined as any;
    this.filterNotFoundTags = undefined as any;

    this.inventoryObj = new InventoryItems();

  }

  public selectedScanRowChange(event: any) {
    if (event.selectedRows[0].dataItem.rfid) {
      this.myScanSelection = [];
      this.utilityService.showNotification(`RFID has been already allocated on ${event.selectedRows[0].dataItem.stoneId}!`, "warning");
      this.inventoryObj = new InventoryItems();
      this.selectedScanStone = new InventoryItems();
    }
    else
      this.inventoryObj = event.selectedRows[0].dataItem;

    this.selectedScanStone = { ...this.inventoryObj };
  }

  public onNotAllocatedStoneChange(event: any) {
    let findStoneDetail = this.inventoryItems.find((x: InventoryItems) => x.stoneId.toLowerCase() == event.toLowerCase());
    this.selectedScanStone = { ...findStoneDetail } as any;
  }

  public startLighting(id: any, index: number, type: string) {
    try {
      this.spinnerService.show();
      let event: any = { skip: 0 };

      if (type.toLowerCase() == 'allocated') {
        this.allocatedTags[index].isLighting = !this.allocatedTags[index].isLighting

        let allocatedAllLight = this.allocatedTags.every(x => x.isLighting);
        if (allocatedAllLight)
          this.isAllAllocatedLighting = true
        else
          this.isAllAllocatedLighting = false

        this.filterAllocatedTags = this.rfIdGridPageChange(event, this.allocatedTags);
      }
      if (type.toLowerCase() == 'notallocated') {
        this.notAllocatedTags[index].isLighting = !this.notAllocatedTags[index].isLighting

        let notAllocatedAllLight = this.notAllocatedTags.every(x => x.isLighting);
        if (notAllocatedAllLight)
          this.isAllNotAllocatedLighting = true
        else
          this.isAllNotAllocatedLighting = false

        this.filterNotAllocatedTags = this.rfIdGridPageChange(event, this.notAllocatedTags);
      }
      if (type.toLowerCase() == 'found') {
        this.foundTags[index].isLighting = !this.foundTags[index].isLighting

        let foundAllLight = this.foundTags.every(x => x.isLighting);
        if (foundAllLight)
          this.isAllFoundLighting = true
        else
          this.isAllFoundLighting = false

        this.filterFoundTags = this.rfIdGridPageChange(event, this.foundTags);
      }


      let findLightIndex = this.tagArr.findIndex((x: any) => x == id.rfid);
      if (findLightIndex >= 0)
        this.tagArr.splice(findLightIndex, 1)
      else
        this.tagArr.push(id.rfid);

      this.stopLighting(false);

      if (this.tagArr && this.tagArr.length > 0)
        this.subMethodLighting()
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }
  }

  public startAllLighting(type: string) {
    try {
      let event: any = { skip: 0 };

      if (type.toLowerCase() == 'allocated') {
        let allocated = this.allocatedTags.map(x => x.rfid);

        if (!this.isAllAllocatedLighting) {
          this.allocatedTags.map(x => x.isLighting = true);
          this.tagArr.push(...allocated)
        }
        else {
          this.allocatedTags.map(x => x.isLighting = false);
          this.tagArr = this.tagArr.filter((val: any) => !allocated.includes(val));

        }
        this.isAllAllocatedLighting = !this.isAllAllocatedLighting;
        this.filterAllocatedTags = this.rfIdGridPageChange(event, this.allocatedTags);
      }

      if (type.toLowerCase() == 'notallocated') {
        let notallocated = this.notAllocatedTags.map(x => x.rfid);
        if (!this.isAllNotAllocatedLighting) {
          this.notAllocatedTags.map(x => x.isLighting = true);
          this.tagArr.push(...notallocated)
        }
        else {
          this.notAllocatedTags.map(x => x.isLighting = false);
          this.tagArr = this.tagArr.filter((val: any) => !notallocated.includes(val));
        }
        this.isAllNotAllocatedLighting = !this.isAllNotAllocatedLighting;
        this.filterNotAllocatedTags = this.rfIdGridPageChange(event, this.notAllocatedTags);

      }
      if (type.toLowerCase() == 'found') {
        let foundrfid = this.foundTags.map(x => x.rfid);
        if (!this.isAllFoundLighting) {
          this.foundTags.map(x => x.isLighting = true);
          this.tagArr.push(...foundrfid)
        }
        else {
          this.foundTags.map(x => x.isLighting = false);
          this.tagArr = this.tagArr.filter((val: any) => !foundrfid.includes(val));
        }
        this.isAllFoundLighting = !this.isAllFoundLighting;
        this.filterFoundTags = this.rfIdGridPageChange(event, this.foundTags);
      }

      let that = this;
      this.tagArr = this.tagArr.filter(function (item: any, pos: any) {
        return that.tagArr.indexOf(item) == pos;
      });

      this.stopLighting(false);
      if (this.tagArr && this.tagArr.length > 0)
        this.subMethodLighting()

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }
  }

  public subMethodLighting() {
    try {
      this.spinnerService.show();
      // if (this.tagArr.length == 0 && this.isLighting)
      //   this.stopLighting()

      // this.device.startLightingTagsLed(null, TagArr);
      this.device.startLightingTagsLed(null, this.tagArr);
      this.device.setLightIntensity(null, 300)
      let that = this;


      this.device.on('lightingstarted', function (tagsNotLighted: any) {
        // that.isLighting = true;
        // that.spinnerService.show();
        that.getRFIDStatus(that.device.getStatus());
        // if (tagsNotLighted.length > 0) {
        //   for (var i = 0; i < tagsNotLighted.length; ++i) {
        //     console.log('- ' + tagsNotLighted[i]);
        //   }
        // }
        that.spinnerService.hide();

      });
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }


  }

  public stopLighting(isAllRemove: boolean = true) {
    try {
      this.spinnerService.show();
      // this.device.stopLightingTagsLed(null, this.tagArr);
      this.device.stopLightingTagsLed();
      let that = this;
      this.device.on('lightingstopped', function () {
        // that.isLighting = false;
        // if (that.tagArr.length == 0)
        // that.tagArr = [];
        // that.spinnerService.show();
        that.getRFIDStatus(that.device.getStatus());
        if (isAllRemove) {
          that.isAllAllocatedLighting = false;
          that.isAllFoundLighting = false;
          that.isAllNotAllocatedLighting = false;
          if (that.foundTags && that.foundTags.length > 0)
            for (let index = 0; index < that.foundTags.length; index++) {
              const element = that.foundTags[index];
              element.isLighting = false;
            }

          if (that.allocatedTags && that.allocatedTags.length > 0)
            for (let index = 0; index < that.allocatedTags.length; index++) {
              const element = that.allocatedTags[index];
              element.isLighting = false;
            }

          if (that.notAllocatedTags && that.notAllocatedTags.length > 0)
            for (let index = 0; index < that.notAllocatedTags.length; index++) {
              const element = that.notAllocatedTags[index];
              element.isLighting = false;
            }
        }
        that.spinnerService.hide();

      });
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }


  }

  public refreshDevice() {
    this.spinnerService.show();
    if (!this.device.isConnected()) {
      this.device.connect();
      this.spinnerService.hide();

    }
    this.scannedTags = [];

    this.cleanScan()
    this.getRFIDStatus(this.device.getStatus());
    this.spinnerService.hide();

  }

  public getRFIDStatus(status: string) {
    // this.spinnerService.show();
    status = status.toUpperCase();
    this.statusText = status;
    if (status == "NOT_READY" || status == "ERROR")
      this.statusTextBgClass = "bg-danger";
    else if (status == "READY")
      this.statusTextBgClass = "bg-success";
    else if (status == "SCANNING")
      this.statusTextBgClass = "bg-info";
    else if (status == "LIGHTING")
      this.statusTextBgClass = "bg-warning";

    // this.spinnerService.hide();

  }

  public routerOnActivate() {
    let that = this;
    this.timer = setInterval(() => {
      that.getRFIDStatus(that.device.getStatus());
    }, 5000);
  }

  public routerOnDeactivate() {
    clearInterval(this.timer);
  }
  //#endregion Scan RFID

  //#region Select All
  public async loadAllInventories() {
    try {
      this.inventorySearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.inventorySearchCriteriaObj.rfids = this.rfid ? this.utilityService.checkCertificateIds(this.rfid) : [];
      this.inventorySearchCriteriaObj.status = [StoneStatus.Lab.toString(), StoneStatus.Pricing.toString(), StoneStatus.Transit.toString(), StoneStatus.Order.toString(), StoneStatus.Sold.toString(), StoneStatus.Stock.toString(), StoneStatus.Repair.toString()]
      this.allInventoryItems = await this.rfidService.getInventoryItemsForSelectAll(this.inventorySearchCriteriaObj);
      if (this.allInventoryItems && this.allInventoryItems.length > 0)
        this.mySelection = this.allInventoryItems.map(z => z.id);

      this.changeDetRef.detectChanges();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async selectAllInventories(event: string) {
    this.mySelection = [];
    this.selectedStones = [];
    if (event.toLowerCase() == 'checked') {
      if (this.totalCount > this.pageSize) {
        this.spinnerService.show();
        await this.loadAllInventories();
        this.spinnerService.hide();
      }
      else
        this.mySelection = this.inventoryItems.map(z => z.id);
    }

  }
  //#endregion

  public onFilterSubmit(form: NgForm) {
    try {
      this.skip = 0
      this.mySelection = [];
      this.loadInventoryData()
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }



  public clearFilter(form: NgForm) {
    form.reset()
    this.inventorySearchCriteriaObj = new InventorySearchCriteria();
    this.listStatus.forEach(z => { z.isChecked = false });
    this.inventorySearchCriteriaObj.organizationId = this.fxCredential?.organizationId;
    this.loadInventoryData();
  }

  public filterSidebar() {
    this.filterFlag = !this.filterFlag;
  }

  public async callCommuteRfid(rfidCommuteItem: RfidCommuteItem[]) {
    let commuteObj = new CommuteItem();
    commuteObj.rfidCommuteItem = rfidCommuteItem;
    await this.commuteService.updateStoneRfid(commuteObj);
  }

  public deleteRFIDModal() {
    let stockCount: Array<string> = new Array<string>();
    let otherCount: Array<string> = new Array<string>();
    let allRFIDNull: boolean = false;

    if (this.allInventoryItems.length > 0) {
      stockCount = this.allInventoryItems.filter(x => this.mySelection.includes(x.id) && x.status.toLowerCase() == 'stock').map(x => x.stoneId);
      otherCount = this.allInventoryItems.filter(x => this.mySelection.includes(x.id) && x.status.toLowerCase() != 'stock').map(x => x.stoneId);
    }
    else {
      stockCount = this.inventoryItems.filter(x => this.mySelection.includes(x.id) && x.status.toLowerCase() == 'stock').map(x => x.stoneId);
      otherCount = this.inventoryItems.filter(x => this.mySelection.includes(x.id) && x.status.toLowerCase() != 'stock').map(x => x.stoneId);
      allRFIDNull = this.inventoryItems.filter(x => this.mySelection.includes(x.id)).every(x => x.rfid == null);
    }

    let alertMessage = `Are you want to delete stone(s)'s RFID(s)? <br/>`;
    if (stockCount.length > 0)
      alertMessage += `<b>Stock On Hand</b>: ${stockCount.length}.<br/>`;

    if (otherCount.length > 0)
      alertMessage += `<b>Other</b>: ${otherCount.length}.`;

    this.alertDialogService.ConfirmYesNo(alertMessage, "Remove RFID").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          if (!allRFIDNull) {
            let deleteResponse = await this.rfidService.removeRFIDFromInventory(this.mySelection);
            if (deleteResponse) {
              let rfidCommuteItemList = new Array<RfidCommuteItem>();
              let mergeStocks = [...stockCount, ...otherCount];
              for (let index = 0; index < mergeStocks.length; index++) {
                const element = mergeStocks[index];
                if (element)
                  rfidCommuteItemList.push({ stoneId: element, rfidNo: null as any });
              }
              await this.callCommuteRfid(rfidCommuteItemList);
              this.mySelection = [];
              this.myScanSelection = [];

              this.loadInventoryData();
              this.utilityService.showNotification(`RFID has been removed successfully!`);
            }
          }
          else {
            this.mySelection = [];
            this.myScanSelection = [];
            this.utilityService.showNotification(`RFID has been removed successfully!`);
          }

        }
        catch (error: any) {
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }
      }
    })
  }

  public exportScannedGrid() {
    let excelFile = [];
    let lengthArray = [this.foundTags.length, this.notFoundTags.length, this.allocatedTags.length, this.notAllocatedTags.length];
    let length = (Math.max(...lengthArray)) ?? 0;
    if (length == undefined || length == null || length <= 0)
      return this.alertDialogService.show("There is no stone to export!");

    for (let index = 0; index < length; index++) {
      let foundElement = this.foundTags[index] != null ? this.foundTags[index] : null;
      let notFoundElement = this.notFoundTags[index] != null ? this.notFoundTags[index] : null;
      let allocatedElement = this.allocatedTags[index] != null ? this.allocatedTags[index] : null;
      let noatAllocatedElement = this.notAllocatedTags[index] != null ? this.notAllocatedTags[index] : null;

      var excel = this.convertArrayToObjectExcel(StockSetupRFIDFormat, foundElement, notFoundElement, allocatedElement, noatAllocatedElement);
      excelFile.push(excel);
    }

    if (excelFile.length > 0)
      this.utilityService.exportAsExcelFile(excelFile, "StockTally_Scanned_Excel");
  }

  public convertArrayToObjectExcel(fields: Array<string>, foundElement: any, notFoundElement: any, allocatedElement: any, notAllocatedElement: any): any {
    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      if (foundElement != null) {
        if (fields[i] == "Found Stone") {
          obj[fields[i]] = foundElement.stoneId;
        }
      }
      if (notFoundElement != null) {
        if (fields[i] == "Not Found Stone") {
          if (notFoundElement.stoneId)
            obj[fields[i]] = notFoundElement.stoneId;
          else
            obj[fields[i]] = notFoundElement.rfid;
        }
      }

      if (allocatedElement != null) {
        if (fields[i] == "Allocated Stone") {
          if (allocatedElement.stoneId)
            obj[fields[i]] = allocatedElement.stoneId;
          else
            obj[fields[i]] = allocatedElement.rfid;
        }
      }

      if (notAllocatedElement != null) {
        if (fields[i] == "Not Allocated Stone") {
          if (notAllocatedElement.stoneId)
            obj[fields[i]] = notAllocatedElement.stoneId;
          else
            obj[fields[i]] = notAllocatedElement.rfid;
        }
      }
    }
    return obj;
  }

  ngOnDestroy() {
    if (this.timer)
      this.routerOnDeactivate()
  }

}
